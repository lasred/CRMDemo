const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Company = require('../models/Company');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

router.get('/', protect, async (req, res) => {
  try {
    const { search, type, status, owner, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (owner) query.owner = owner;
    
    const companies = await Company.find(query)
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Company.countDocuments(query);
    
    res.json({
      companies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('createdBy', 'name email');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    const contacts = await Contact.find({ company: company._id });
    const deals = await Deal.find({ company: company._id });
    
    res.json({
      ...company.toObject(),
      contacts: contacts.length,
      deals: deals.length,
      totalDealValue: deals.reduce((sum, deal) => sum + deal.value, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      owner: req.body.owner || req.user._id,
      createdBy: req.user._id,
    };
    
    const company = await Company.create(companyData);
    
    await Activity.create({
      type: 'company_created',
      title: `Company created: ${company.name}`,
      user: req.user._id,
      relatedTo: {
        type: 'company',
        id: company._id,
      },
    });
    
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    Object.assign(company, req.body);
    company.updatedAt = Date.now();
    
    await company.save();
    
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    await company.remove();
    
    res.json({ message: 'Company removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/contacts', protect, async (req, res) => {
  try {
    const contacts = await Contact.find({ company: req.params.id })
      .populate('owner', 'name email');
    
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/deals', protect, async (req, res) => {
  try {
    const deals = await Deal.find({ company: req.params.id })
      .populate('owner', 'name email')
      .populate('contact', 'firstName lastName');
    
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/activities', protect, async (req, res) => {
  try {
    const activities = await Activity.find({
      'relatedTo.type': 'company',
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