const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalContacts,
      totalCompanies,
      totalDeals,
      totalTasks,
      recentActivities,
      dealsByStage,
      upcomingTasks,
      recentDeals,
    ] = await Promise.all([
      Contact.countDocuments(),
      Company.countDocuments(),
      Deal.countDocuments(),
      Task.countDocuments({ assignedTo: req.user._id, status: { $ne: 'completed' } }),
      Activity.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Deal.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' },
          },
        },
      ]),
      Task.find({
        assignedTo: req.user._id,
        status: { $ne: 'completed' },
        dueDate: { $gte: new Date() },
      })
        .sort({ dueDate: 1 })
        .limit(5)
        .populate('relatedTo.id'),
      Deal.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('company', 'name')
        .populate('contact', 'firstName lastName'),
    ]);
    
    const totalRevenue = await Deal.aggregate([
      { $match: { stage: 'closed_won' } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]);
    
    const monthlyRevenue = await Deal.aggregate([
      {
        $match: {
          stage: 'closed_won',
          actualCloseDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$actualCloseDate' },
            month: { $month: '$actualCloseDate' },
          },
          revenue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    
    res.json({
      overview: {
        totalContacts,
        totalCompanies,
        totalDeals,
        pendingTasks: totalTasks,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      dealsByStage,
      monthlyRevenue,
      recentActivities,
      upcomingTasks,
      recentDeals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics', protect, async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let dateFilter = new Date();
    switch (period) {
      case '7days':
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case '30days':
        dateFilter.setDate(dateFilter.getDate() - 30);
        break;
      case '90days':
        dateFilter.setDate(dateFilter.getDate() - 90);
        break;
      case '1year':
        dateFilter.setFullYear(dateFilter.getFullYear() - 1);
        break;
    }
    
    const [
      newContacts,
      newCompanies,
      newDeals,
      closedDeals,
      taskCompletion,
      topPerformers,
    ] = await Promise.all([
      Contact.countDocuments({ createdAt: { $gte: dateFilter } }),
      Company.countDocuments({ createdAt: { $gte: dateFilter } }),
      Deal.countDocuments({ createdAt: { $gte: dateFilter } }),
      Deal.find({
        stage: 'closed_won',
        actualCloseDate: { $gte: dateFilter },
      }),
      Task.aggregate([
        { $match: { createdAt: { $gte: dateFilter } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Deal.aggregate([
        {
          $match: {
            stage: 'closed_won',
            actualCloseDate: { $gte: dateFilter },
          },
        },
        {
          $group: {
            _id: '$owner',
            totalRevenue: { $sum: '$value' },
            dealCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ]),
    ]);
    
    const conversionRate = newDeals > 0 
      ? (closedDeals.length / newDeals * 100).toFixed(2)
      : 0;
    
    const avgDealSize = closedDeals.length > 0
      ? closedDeals.reduce((sum, deal) => sum + deal.value, 0) / closedDeals.length
      : 0;
    
    res.json({
      metrics: {
        newContacts,
        newCompanies,
        newDeals,
        closedDeals: closedDeals.length,
        revenue: closedDeals.reduce((sum, deal) => sum + deal.value, 0),
        conversionRate,
        avgDealSize,
      },
      taskCompletion,
      topPerformers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;