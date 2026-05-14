const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to DB'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const adminEmail = 'admin@civic.gov.in';

    const existing = await User.findOne({
      email: adminEmail.toLowerCase().trim()
    });

    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail.toLowerCase().trim(),
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin created successfully');
    console.log('Email:', admin.email);
    console.log('Password: admin123');

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();