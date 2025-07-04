const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Contact = require('../models/Contact');
const Activity = require('../models/Activity');

router.get('/', protect, async (req, res) => {
  try {
    const { search, status, source, owner, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (owner) query.owner = owner;
    
    const contacts = await Contact.find(query)
      .populate('company', 'name')
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Contact.countDocuments(query);
    
    res.json({
      contacts,
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
    const contact = await Contact.findById(req.params.id)
      .populate('company')
      .populate('owner', 'name email')
      .populate('createdBy', 'name email');
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      owner: req.body.owner || req.user._id,
      createdBy: req.user._id,
    };
    
    const contact = await Contact.create(contactData);
    
    await Activity.create({
      type: 'contact_created',
      title: `Contact created: ${contact.firstName} ${contact.lastName}`,
      user: req.user._id,
      relatedTo: {
        type: 'contact',
        id: contact._id,
      },
    });
    
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    Object.assign(contact, req.body);
    contact.updatedAt = Date.now();
    
    await contact.save();
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    await contact.remove();
    
    res.json({ message: 'Contact removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/activities', protect, async (req, res) => {
  try {
    const activities = await Activity.find({
      'relatedTo.type': 'contact',
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