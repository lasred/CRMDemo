const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  stage: {
    type: String,
    enum: ['qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'qualification',
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10,
  },
  expectedCloseDate: {
    type: Date,
    required: true,
  },
  actualCloseDate: {
    type: Date,
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    name: String,
    quantity: Number,
    price: Number,
  }],
  description: {
    type: String,
  },
  lostReason: {
    type: String,
  },
  wonDetails: {
    type: String,
  },
  nextStep: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date,
  }],
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

dealSchema.pre('save', function(next) {
  const stageProbabilities = {
    'qualification': 10,
    'needs_analysis': 25,
    'proposal': 50,
    'negotiation': 75,
    'closed_won': 100,
    'closed_lost': 0,
  };
  
  if (this.isModified('stage')) {
    this.probability = stageProbabilities[this.stage];
  }
  
  next();
});

dealSchema.index({ title: 'text' });

module.exports = mongoose.model('Deal', dealSchema);