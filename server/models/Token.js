const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['waiting', 'serving', 'completed', 'skipped', 'cancelled'],
      default: 'waiting',
    },
    joinedAt: { type: Date, default: Date.now },
    calledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// helps quickly fetch the active queue for a service, ordered by join time
tokenSchema.index({ service: 1, status: 1, joinedAt: 1 });

module.exports = mongoose.model('Token', tokenSchema);
