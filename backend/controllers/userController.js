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
