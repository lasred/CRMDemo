const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

router.get('/', protect, async (req, res) => {
  try {
    const { search, status, type, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dueDate: 1, priority: -1 });
    
    const count = await Task.countDocuments(query);
    
    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-tasks', protect, async (req, res) => {
  try {
    const { status = 'todo,in_progress' } = req.query;
    
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: { $in: status.split(',') },
    })
    .populate('relatedTo.id')
    .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('relatedTo.id');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    const task = await Task.create(taskData);
    
    await Activity.create({
      type: 'task_created',
      title: `Task created: ${task.title}`,
      user: req.user._id,
      relatedTo: {
        type: 'task',
        id: task._id,
      },
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const oldStatus = task.status;
    Object.assign(task, req.body);
    task.updatedAt = Date.now();
    
    if (task.status === 'completed' && oldStatus !== 'completed') {
      task.completedAt = new Date();
      
      await Activity.create({
        type: 'task_completed',
        title: `Task completed: ${task.title}`,
        user: req.user._id,
        relatedTo: {
          type: 'task',
          id: task._id,
        },
      });
    }
    
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.remove();
    
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;