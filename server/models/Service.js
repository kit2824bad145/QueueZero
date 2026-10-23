const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Service name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: 'General' },
    avgServiceTimeMinutes: { type: Number, default: 5, min: 1 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // running counter used to assign human-friendly token numbers per service, resets logic handled in controller
    lastTokenNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
