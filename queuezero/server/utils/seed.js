// Seeds one admin account and a handful of sample services.
// Run with: npm run seed  (after setting MONGO_URI in .env)
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Service = require('../models/Service');

dotenv.config();

const seed = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@queuezero.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'QueueZero Admin',
      email: 'admin@queuezero.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin created -> admin@queuezero.com / Admin@123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  const sampleServices = [
    { name: 'General OPD Consultation', department: 'Hospital', avgServiceTimeMinutes: 10 },
    { name: 'Account Opening', department: 'Bank', avgServiceTimeMinutes: 15 },
    { name: 'Passport Verification', department: 'Government Office', avgServiceTimeMinutes: 12 },
    { name: 'Student Fee Payment', department: 'College', avgServiceTimeMinutes: 5 },
    { name: 'Haircut & Styling', department: 'Salon', avgServiceTimeMinutes: 20 },
  ];

  for (const svc of sampleServices) {
    const exists = await Service.findOne({ name: svc.name });
    if (!exists) {
      await Service.create(svc);
      console.log(`Service created: ${svc.name}`);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
