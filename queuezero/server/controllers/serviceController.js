const Service = require('../models/Service');
const Token = require('../models/Token');

// @desc    Get all active services (for customers to browse)
// @route   GET /api/services
// @access  Private
const getServices = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isActive: true };
    const services = await Service.find(filter).sort({ createdAt: -1 });

    // attach a live waiting-count to each service so the UI can show it without another round trip
    const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        const waitingCount = await Token.countDocuments({ service: service._id, status: 'waiting' });
        return { ...service.toObject(), waitingCount };
      })
    );

    res.json(servicesWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by id
// @route   GET /api/services/:id
// @access  Private
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res, next) => {
  try {
    const { name, description, department, avgServiceTimeMinutes } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Service name is required');
    }

    const service = await Service.create({
      name,
      description,
      department,
      avgServiceTimeMinutes,
      createdBy: req.user._id,
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    const { name, description, department, avgServiceTimeMinutes, isActive } = req.body;

    if (name !== undefined) service.name = name;
    if (description !== undefined) service.description = description;
    if (department !== undefined) service.department = department;
    if (avgServiceTimeMinutes !== undefined) service.avgServiceTimeMinutes = avgServiceTimeMinutes;
    if (isActive !== undefined) service.isActive = isActive;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404);
      throw new Error('Service not found');
    }

    const activeTokens = await Token.countDocuments({
      service: service._id,
      status: { $in: ['waiting', 'serving'] },
    });

    if (activeTokens > 0) {
      res.status(400);
      throw new Error('Cannot delete a service with an active queue. Clear or complete tokens first.');
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
