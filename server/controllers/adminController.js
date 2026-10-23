const Token = require('../models/Token');
const Service = require('../models/Service');
const User = require('../models/User');

// @desc    Get the live waiting list for a service (or all services if none specified)
// @route   GET /api/admin/queue?serviceId=...
// @access  Private/Admin
const getWaitingList = async (req, res, next) => {
  try {
    const { serviceId } = req.query;
    const filter = { status: 'waiting' };
    if (serviceId) filter.service = serviceId;

    const waiting = await Token.find(filter)
      .populate('service', 'name department')
      .populate('customer', 'name phone email')
      .sort({ joinedAt: 1 });

    res.json(waiting);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all currently-serving tokens across services (for the monitor view)
// @route   GET /api/admin/serving
// @access  Private/Admin
const getServingList = async (req, res, next) => {
  try {
    const serving = await Token.find({ status: 'serving' })
      .populate('service', 'name department')
      .populate('customer', 'name phone')
      .sort({ calledAt: -1 });

    res.json(serving);
  } catch (error) {
    next(error);
  }
};

// @desc    Call the next waiting token for a service
// @route   POST /api/admin/queue/:serviceId/call-next
// @access  Private/Admin
const callNextToken = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // only one token should be "serving" per service at a time
    const alreadyServing = await Token.findOne({ service: serviceId, status: 'serving' });
    if (alreadyServing) {
      res.status(400);
      throw new Error('A token is already being served for this service. Complete or skip it first.');
    }

    const next_ = await Token.findOne({ service: serviceId, status: 'waiting' }).sort({ joinedAt: 1 });
    if (!next_) {
      res.status(404);
      throw new Error('No customers waiting in this queue');
    }

    next_.status = 'serving';
    next_.calledAt = new Date();
    await next_.save();

    const populated = await next_.populate([
      { path: 'service', select: 'name department' },
      { path: 'customer', select: 'name phone' },
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a token as completed
// @route   PUT /api/admin/queue/:id/complete
// @access  Private/Admin
const completeToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      res.status(404);
      throw new Error('Token not found');
    }
    if (token.status !== 'serving') {
      res.status(400);
      throw new Error('Only a token currently being served can be completed');
    }

    token.status = 'completed';
    token.completedAt = new Date();
    await token.save();

    res.json(token);
  } catch (error) {
    next(error);
  }
};

// @desc    Skip a token (customer absent, etc.)
// @route   PUT /api/admin/queue/:id/skip
// @access  Private/Admin
const skipToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      res.status(404);
      throw new Error('Token not found');
    }
    if (!['waiting', 'serving'].includes(token.status)) {
      res.status(400);
      throw new Error('This token cannot be skipped');
    }

    token.status = 'skipped';
    await token.save();

    res.json(token);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cancels any token
// @route   PUT /api/admin/queue/:id/cancel
// @access  Private/Admin
const adminCancelToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      res.status(404);
      throw new Error('Token not found');
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

// @desc    Dashboard statistics (today's totals + per-service breakdown)
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getStatistics = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalServices, totalCustomers, todayTokens, waitingNow, servingNow, completedToday, cancelledToday, skippedToday] =
      await Promise.all([
        Service.countDocuments({}),
        User.countDocuments({ role: 'customer' }),
        Token.countDocuments({ createdAt: { $gte: startOfToday } }),
        Token.countDocuments({ status: 'waiting' }),
        Token.countDocuments({ status: 'serving' }),
        Token.countDocuments({ status: 'completed', completedAt: { $gte: startOfToday } }),
        Token.countDocuments({ status: 'cancelled', updatedAt: { $gte: startOfToday } }),
        Token.countDocuments({ status: 'skipped', updatedAt: { $gte: startOfToday } }),
      ]);

    // per-service breakdown for today
    const services = await Service.find({});
    const perService = await Promise.all(
      services.map(async (service) => {
        const [waiting, completed] = await Promise.all([
          Token.countDocuments({ service: service._id, status: 'waiting' }),
          Token.countDocuments({
            service: service._id,
            status: 'completed',
            completedAt: { $gte: startOfToday },
          }),
        ]);
        return { serviceId: service._id, name: service.name, waiting, completedToday: completed };
      })
    );

    // average wait time today, computed from calledAt - joinedAt for completed tokens
    const completedTodayDocs = await Token.find({
      status: 'completed',
      completedAt: { $gte: startOfToday },
      calledAt: { $ne: null },
    });
    let avgWaitMinutes = 0;
    if (completedTodayDocs.length > 0) {
      const totalMs = completedTodayDocs.reduce(
        (sum, t) => sum + (new Date(t.calledAt) - new Date(t.joinedAt)),
        0
      );
      avgWaitMinutes = Math.round(totalMs / completedTodayDocs.length / 60000);
    }

    res.json({
      totalServices,
      totalCustomers,
      todayTokens,
      waitingNow,
      servingNow,
      completedToday,
      cancelledToday,
      skippedToday,
      avgWaitMinutes,
      perService,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWaitingList,
  getServingList,
  callNextToken,
  completeToken,
  skipToken,
  adminCancelToken,
  getStatistics,
};
