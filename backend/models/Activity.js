const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task_created', 'task_completed', 'deal_created', 'deal_updated', 'contact_created', 'company_created'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['contact', 'company', 'deal', 'task'],
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.type',
    },
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ 'relatedTo.id': 1 });

module.exports = mongoose.model('Activity', activitySchema);