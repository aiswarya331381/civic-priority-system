const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Complaint = require('../models/Complaint');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Complaint.deleteMany({});
  console.log('Cleared existing data');

  const salt = await bcrypt.genSalt(12);
  const users = await User.insertMany([
    { name: 'Arjun Sharma', email: 'arjun@citizen.in', password: await bcrypt.hash('user123', salt), role: 'user', avatar: 'AS' },
    { name: 'Priya Reddy', email: 'priya@citizen.in', password: await bcrypt.hash('user123', salt), role: 'user', avatar: 'PR' },
    { name: 'District Admin', email: 'admin@civic.gov.in', password: await bcrypt.hash('admin123', salt), role: 'admin', avatar: 'DA' },
  ]);
  console.log(`Created ${users.length} users`);

  const [arjun, priya] = users;
  const complaints = await Complaint.insertMany([
    {
      title: 'Pothole on Main Bazaar Road',
      description: 'Large dangerous pothole near vegetable market junction causing accidents. Multiple two-wheelers have fallen. Immediate repair needed before monsoon season worsens conditions.',
      location: { address: 'Main Bazaar Rd, Rajamahendravaram', lat: 17.0005, lng: 81.8040 },
      severity: 'critical', status: 'in-progress', assignedTo: 'Roads & Highways', userId: arjun._id,
      updates: [{ message: 'Complaint submitted', updatedByName: 'Arjun Sharma' }, { message: 'Assigned to Roads & Highways', updatedByName: 'District Admin' }],
    },
    {
      title: 'Broken Street Lights – Godavari Nagar',
      description: 'Street lights not working for past 2 weeks in Godavari Nagar colony. Entire street dark at night causing safety concerns.',
      location: { address: 'Godavari Nagar, Rajamahendravaram', lat: 16.9999, lng: 81.7784 },
      severity: 'high', status: 'pending', userId: priya._id,
      updates: [{ message: 'Complaint submitted', updatedByName: 'Priya Reddy' }],
    },
    {
      title: 'Garbage Not Collected for 5 Days',
      description: 'Garbage collection truck has not visited our area for 5 days. Waste piling up creating health hazards.',
      location: { address: 'Tilak Rd, Rajamahendravaram', lat: 17.0020, lng: 81.7902 },
      severity: 'medium', status: 'resolved', assignedTo: 'Sanitation Board', userId: arjun._id,
      updates: [{ message: 'Complaint submitted', updatedByName: 'Arjun Sharma' }, { message: 'Garbage cleared. Regular collection restored.', updatedByName: 'District Admin' }],
    },
    {
      title: 'Water Supply Irregular – Canal Road Area',
      description: 'Water supply has been very irregular for 3 weeks. Supply comes only once in 2 days for just 1 hour.',
      location: { address: 'Canal Rd, Rajamahendravaram', lat: 17.0035, lng: 81.7810 },
      severity: 'high', status: 'in-progress', assignedTo: 'Water Supply Div', userId: priya._id,
      updates: [{ message: 'Complaint submitted', updatedByName: 'Priya Reddy' }, { message: 'Water Supply Division investigating pipeline issue', updatedByName: 'District Admin' }],
    },
    {
      title: 'Open Drain Causing Flooding Near School',
      description: 'An open drain near the school has been blocked causing water to overflow onto the road during rains.',
      location: { address: 'School Colony, Rajamahendravaram', lat: 16.9980, lng: 81.7990 },
      severity: 'critical', status: 'pending', userId: arjun._id,
      updates: [{ message: 'Complaint submitted', updatedByName: 'Arjun Sharma' }],
    },
  ]);
  console.log(`Created ${complaints.length} complaints`);
  console.log('\n✅ Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  Citizen : arjun@citizen.in / user123');
  console.log('  Admin   : admin@civic.gov.in / admin123');
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
