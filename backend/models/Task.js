const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'demo', 'follow_up', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'cancelled'],
    default: 'todo',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completedAt: {
    type: Date,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['contact', 'company', 'deal'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.type',
    },
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false,
    },
    time: Date,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);