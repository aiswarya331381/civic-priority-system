const User          = require('../models/User');
const bcrypt        = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// @desc   Register user
// @route  POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user  = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, role: 'user' });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
};

// @desc   Login
// @route  POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Must use .select('+password') because password has select:false in schema
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    // Direct bcrypt compare — most reliable approach
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ success: true, token, user: userObj });
  } catch (err) { next(err); }
};

// @desc   Get logged-in user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
