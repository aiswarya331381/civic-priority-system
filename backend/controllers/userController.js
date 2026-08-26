const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) { next(err); }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle
// @access  Private/Admin
exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// @desc    Promote a user to admin
// @route   POST /api/users/:id/make-admin
// @access  Private/Admin
//
// SECURITY: this route is mounted behind `protect` + `adminOnly` in
// routes/users.js, so by the time this handler runs Express has already
// verified (1) the request carries a valid JWT for an existing, active
// user and (2) that authenticated user's role is 'admin'. A non-admin
// calling this endpoint directly (e.g. via curl/Postman) will be stopped
// by `adminOnly` and receive a 403 before this code ever executes — the
// promotion can never happen from the frontend alone.
exports.makeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'User is already an administrator' });
    }

    user.role = 'admin';
    await user.save();
    res.json({ success: true, message: `${user.name} is now an administrator`, user });
  } catch (err) { next(err); }
};