const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
  },
  revenue: {
    type: Number,
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  type: {
    type: String,
    enum: ['prospect', 'customer', 'partner', 'vendor', 'other'],
    default: 'prospect',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
  },
  tags: [{
    type: String,
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
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

companySchema.index({ name: 'text', domain: 'text' });

module.exports = mongoose.model('Company', companySchema);