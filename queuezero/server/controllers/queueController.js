const mongoose = require('mongoose');
const Token = require('../models/Token');
const Service = require('../models/Service');

// Small helper: how many people are ahead of a waiting token in its service queue
const countAhead = async (serviceId, joinedAt) => {
  return Token.countDocuments({
    service: serviceId,
    status: 'waiting',
    joinedAt: { $lt: joinedAt },
  });
};

// @desc    Join a queue for a service (auto-generates the next token number)
// @route   POST /api/queue/join
// @access  Private/Customer
const joinQueue = async (req, res, next) => {
  try {
    const { serviceId } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      res.status(404);
      throw new Error('Service not found or currently unavailable');
    }

    const existing = await Token.findOne({
      customer: req.user._id,
      service: serviceId,
      status: { $in: ['waiting', 'serving'] },
    });
    if (existing) {
      res.status(400);
      throw new Error('You already have an active token for this service');
    }

    // atomically bump the service's running token counter
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $inc: { lastTokenNumber: 1 } },
      { new: true }
    );

    const token = await Token.create({
      tokenNumber: updatedService.lastTokenNumber,
      service: serviceId,
      customer: req.user._id,
      status: 'waiting',
    });

    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in customer's current active token with live queue status
// @route   GET /api/queue/my-token
// @access  Private/Customer
const getMyActiveToken = async (req, res, next) => {
  try {
    const token = await Token.findOne({
      customer: req.user._id,
      status: { $in: ['waiting', 'serving'] },
    }).populate('service', 'name department avgServiceTimeMinutes');

    if (!token) {
      return res.json(null);
    }

    let peopleAhead = 0;
    let currentlyServingNumber = null;

    if (token.status === 'waiting') {
      peopleAhead = await countAhead(token.service._id, token.joinedAt);
    }

    const serving = await Token.findOne({ service: token.service._id, status: 'serving' }).sort({
      calledAt: -1,
    });
    if (serving) currentlyServingNumber = serving.tokenNumber;

    const estimatedWaitMinutes = peopleAhead * (token.service.avgServiceTimeMinutes || 5);

    res.json({
      ...token.toObject(),
      peopleAhead,
      currentlyServingNumber,
      estimatedWaitMinutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel the logged-in customer's own token
// @route   PUT /api/queue/:id/cancel
// @access  Private/Customer
const cancelMyToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      res.status(404);
      throw new Error('Token not found');
    }
    if (token.customer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You can only cancel your own token');
    }
    if (!['waiting', 'serving'].includes(token.status)) {
      res.status(400);
      throw new Error('This token can no longer be cancelled');
    }

    token.status = 'cancelled';
    await token.save();

    res.json(token);
  } catch (error) {
    next(error);
  }
};

// @desc    Get the logged-in customer's past queue history
// @route   GET /api/queue/history
// @access  Private/Customer
const getMyHistory = async (req, res, next) => {
  try {
    const history = await Token.find({
      customer: req.user._id,
      status: { $in: ['completed', 'cancelled', 'skipped'] },
    })
      .populate('service', 'name department')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { joinQueue, getMyActiveToken, cancelMyToken, getMyHistory };
