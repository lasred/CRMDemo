const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

router.get('/', protect, async (req, res) => {
  try {
    const { search, stage, owner, minValue, maxValue, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (stage) query.stage = stage;
    if (owner) query.owner = owner;
    
    if (minValue || maxValue) {
      query.value = {};
      if (minValue) query.value.$gte = parseFloat(minValue);
      if (maxValue) query.value.$lte = parseFloat(maxValue);
    }
    
    const deals = await Deal.find(query)
      .populate('contact', 'firstName lastName email')
      .populate('company', 'name')
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Deal.countDocuments(query);
    
    const stageStats = await Deal.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ]);
    
    res.json({
      deals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      stageStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pipeline', protect, async (req, res) => {
  try {
    const pipeline = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          deals: {
            $push: {
              _id: '$_id',
              title: '$title',
              value: '$value',
              company: '$company',
              contact: '$contact',
              expectedCloseDate: '$expectedCloseDate',
              probability: '$probability',
            },
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    
    await Deal.populate(pipeline, [
      { path: 'deals.company', select: 'name' },
      { path: 'deals.contact', select: 'firstName lastName' },
    ]);
    
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact')
      .populate('company')
      .populate('owner', 'name email')
      .populate('createdBy', 'name email');
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const dealData = {
      ...req.body,
      owner: req.body.owner || req.user._id,
      createdBy: req.user._id,
    };
    
    const deal = await Deal.create(dealData);
    
    await Activity.create({
      type: 'deal_created',
      title: `Deal created: ${deal.title}`,
      description: `Value: $${deal.value.toLocaleString()}`,
      user: req.user._id,
      relatedTo: {
        type: 'deal',
        id: deal._id,
      },
    });
    
    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    const oldStage = deal.stage;
    Object.assign(deal, req.body);
    deal.updatedAt = Date.now();
    
    if (deal.stage === 'closed_won' && oldStage !== 'closed_won') {
      deal.actualCloseDate = new Date();
    }
    
    await deal.save();
    
    if (oldStage !== deal.stage) {
      await Activity.create({
        type: 'deal_updated',
        title: `Deal stage changed: ${oldStage} → ${deal.stage}`,
        description: deal.title,
        user: req.user._id,
        relatedTo: {
          type: 'deal',
          id: deal._id,
        },
      });
    }
    
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    await deal.remove();
    
    res.json({ message: 'Deal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/activities', protect, async (req, res) => {
  try {
    const activities = await Activity.find({
      'relatedTo.type': 'deal',
      'relatedTo.id': req.params.id,
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;