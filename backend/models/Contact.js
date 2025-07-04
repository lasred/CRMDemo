const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  mobile: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  department: {
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
  status: {
    type: String,
    enum: ['lead', 'prospect', 'customer', 'inactive'],
    default: 'lead',
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'email', 'phone', 'event', 'other'],
    default: 'website',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  notes: {
    type: String,
  },
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

contactSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Contact', contactSchema);