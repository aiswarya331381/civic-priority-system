const path = require('path');
const Complaint = require('../models/Complaint');

// Helper: build image URLs from uploaded files
const buildImageUrls = (files, req) => {
  if (!files || !files.length) return [];
  const base = `${req.protocol}://${req.get('host')}`;
  return files.map(f => `${base}/uploads/${f.filename}`);
};

// ── Create complaint ─────────────────────────────────────────────────────────
// POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, severity, category, location } = req.body;

    // location may arrive as JSON string (FormData) or object
    let loc = location;
    if (typeof location === 'string') {
      try { loc = JSON.parse(location); } catch { loc = {}; }
    }

    if (!loc?.lat || !loc?.lng || !loc?.address) {
      return res.status(400).json({ success: false, message: 'Location (lat, lng, address) is required' });
    }

    const images = buildImageUrls(req.files, req);

    const complaint = await Complaint.create({
      title, description, severity, category: category || 'other',
      location: {
        address:  loc.address,
        street:   loc.street  || '',
        city:     loc.city    || '',
        district: loc.district|| '',
        state:    loc.state   || '',
        pincode:  loc.pincode || '',
        lat:      parseFloat(loc.lat),
        lng:      parseFloat(loc.lng),
      },
      images,
      userId: req.user._id,
      updates: [{ message: 'Complaint submitted by citizen', updatedByName: req.user.name }],
    });

    await complaint.populate('userId', 'name email avatar');
    res.status(201).json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Get complaints ───────────────────────────────────────────────────────────
// GET /api/complaints  (own for user, all for admin)
exports.getComplaints = async (req, res, next) => {
  try {
    const { status, severity, search, sort = '-priorityScore', page = 1, limit = 50 } = req.query;
    const query = {};
    if (req.user.role !== 'admin') query.userId = req.user._id;
    if (status)   query.status = status;
    if (severity) query.severity = severity;
    if (search)   query.$or = [
      { title:              { $regex: search, $options: 'i' } },
      { description:        { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];

    const total      = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), complaints });
  } catch (err) { next(err); }
};

// ── Get all complaints (public browse) ───────────────────────────────────────
// GET /api/complaints/all
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status, severity, search, sort = '-priorityScore' } = req.query;
    const query = {};
    if (status)   query.status = status;
    if (severity) query.severity = severity;
    if (search)   query.$or = [
      { title:              { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
    const complaints = await Complaint.find(query)
      .populate('userId', 'name avatar')
      .sort(sort)
      .limit(100);
    res.json({ success: true, complaints });
  } catch (err) { next(err); }
};

// ── Get single complaint ─────────────────────────────────────────────────────
// GET /api/complaints/:id
exports.getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('userId', 'name email avatar');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role !== 'admin' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Update complaint (admin) ──────────────────────────────────────────────────
// PUT /api/complaints/:id
exports.updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const { status, assignedTo, title, description, severity } = req.body;
    const msgs = [];

    if (status && status !== complaint.status) {
      complaint.status = status;
      msgs.push(`Status updated to "${status}"`);
    }
    if (assignedTo !== undefined && assignedTo !== complaint.assignedTo) {
      complaint.assignedTo = assignedTo || null;
      msgs.push(assignedTo ? `Assigned to ${assignedTo}` : 'Unassigned');
    }
    if (title)       complaint.title = title;
    if (description) complaint.description = description;
    if (severity)    complaint.severity = severity;

    if (msgs.length) {
      complaint.updates.push({
        message: msgs.join('; '),
        updatedBy: req.user._id,
        updatedByName: req.user.name,
      });
    }

    await complaint.save(); // triggers priority recalc via pre-save
    await complaint.populate('userId', 'name email avatar');
    res.json({ success: true, complaint });
  } catch (err) { next(err); }
};

// ── Delete complaint (admin) ──────────────────────────────────────────────────
// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) { next(err); }
};

// ── Upvote complaint ──────────────────────────────────────────────────────────
// POST /api/complaints/:id/upvote
exports.upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Not found' });

    const uid = req.user._id.toString();
    const already = complaint.upvotedBy.map(String).includes(uid);

    if (already) {
      complaint.upvotes    = Math.max(0, complaint.upvotes - 1);
      complaint.upvotedBy  = complaint.upvotedBy.filter(id => id.toString() !== uid);
    } else {
      complaint.upvotes   += 1;
      complaint.upvotedBy.push(req.user._id);
    }

    await complaint.save();
    res.json({ success: true, upvotes: complaint.upvotes, upvoted: !already });
  } catch (err) { next(err); }
};

// ── Analytics (admin) ─────────────────────────────────────────────────────────
// GET /api/complaints/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const [statusStats, severityStats, priorityStats, total, recentComplaints, topPriority] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$priorityLevel', count: { $sum: 1 } } }]),
      Complaint.countDocuments(),
      Complaint.find().sort('-createdAt').limit(5).populate('userId', 'name avatar'),
      Complaint.find({ status: { $ne: 'resolved' } }).sort('-priorityScore').limit(5).populate('userId', 'name avatar'),
    ]);

    res.json({
      success: true,
      analytics: {
        total,
        byStatus:   Object.fromEntries(statusStats.map(s   => [s._id, s.count])),
        bySeverity: Object.fromEntries(severityStats.map(s  => [s._id, s.count])),
        byPriority: Object.fromEntries(priorityStats.map(s  => [s._id, s.count])),
        recent:     recentComplaints,
        topPriority,
      },
    });
  } catch (err) { next(err); }
};
