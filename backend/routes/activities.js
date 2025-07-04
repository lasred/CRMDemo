const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');

router.get('/', protect, async (req, res) => {
  try {
    const { type, user, relatedType, relatedId, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (user) query.user = user;
    if (relatedType && relatedId) {
      query['relatedTo.type'] = relatedType;
      query['relatedTo.id'] = relatedId;
    }
    
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('relatedTo.id')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Activity.countDocuments(query);
    
    res.json({
      activities,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      user: req.user._id,
    };
    
    const activity = await Activity.create(activityData);
    
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/timeline', protect, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email avatar')
      .populate('relatedTo.id')
      .limit(100)
      .sort({ createdAt: -1 });
    
    const grouped = activities.reduce((acc, activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});
    
    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;