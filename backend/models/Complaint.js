const mongoose = require('mongoose');

// ── Priority Calculation ────────────────────────────────────────────────────
const SEV_SCORE = { critical: 40, high: 30, medium: 20, low: 10 };

function calcPriorityScore(severity, createdAt, upvotes = 0) {
  let score = SEV_SCORE[severity] || 10;

  // Age bonus — older unresolved issues get higher priority (max +30)
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  const ageBonus = Math.min(30, Math.floor(ageHours / 12) * 3);
  score += ageBonus;

  // Upvote/report bonus (max +20)
  score += Math.min(20, upvotes * 2);

  return Math.min(100, score);
}

function calcPriorityLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// ── Sub-schemas ─────────────────────────────────────────────────────────────
const updateSchema = new mongoose.Schema({
  message:       { type: String, required: true },
  updatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String },
}, { timestamps: true });

// ── Main Schema ──────────────────────────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, 'Title is required'],
    trim: true, minlength: [10, 'Min 10 chars'], maxlength: [150, 'Max 150 chars'],
  },
  description: {
    type: String, required: [true, 'Description is required'],
    trim: true, minlength: [20, 'Min 20 chars'], maxlength: [2000, 'Max 2000 chars'],
  },
  category: {
    type: String,
    enum: ['roads', 'water', 'electricity', 'sanitation', 'drainage', 'parks', 'streetlights', 'other'],
    default: 'other',
  },
  location: {
    address:  { type: String, required: true, trim: true },
    street:   { type: String, trim: true, default: '' },
    city:     { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state:    { type: String, trim: true, default: '' },
    pincode:  { type: String, trim: true, default: '' },
    lat:      { type: Number, required: true, min: -90,  max: 90 },
    lng:      { type: Number, required: true, min: -180, max: 180 },
  },
  severity: {
    type: String, enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Severity is required'],
  },
  status: {
    type: String, enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending',
  },
  images: [{ type: String }],       // URLs / filenames
  assignedTo:    { type: String, default: null },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes:       { type: Number, default: 0, min: 0 },
  upvotedBy:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priorityScore: { type: Number, default: 10, min: 0, max: 100 },
  priorityLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  updates:       [updateSchema],
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ severity: 1 });
complaintSchema.index({ priorityScore: -1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// ── Auto-calculate priority before save ──────────────────────────────────────
complaintSchema.pre('save', function (next) {
  this.priorityScore = calcPriorityScore(this.severity, this.createdAt || new Date(), this.upvotes);
  this.priorityLevel = calcPriorityLevel(this.priorityScore);
  next();
});

// ── Static helper to recalculate priority (call from controller) ─────────────
complaintSchema.statics.recalcPriority = async function (id) {
  const c = await this.findById(id);
  if (!c) return;
  c.priorityScore = calcPriorityScore(c.severity, c.createdAt, c.upvotes);
  c.priorityLevel = calcPriorityLevel(c.priorityScore);
  await c.save();
  return c;
};

module.exports = mongoose.model('Complaint', complaintSchema);
