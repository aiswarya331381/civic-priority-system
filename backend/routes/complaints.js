const express  = require('express');
const { body } = require('express-validator');
const {
  createComplaint, getComplaints, getAllComplaints,
  getComplaint, updateComplaint, deleteComplaint,
  upvoteComplaint, getAnalytics,
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');
const { validate }           = require('../middleware/validate');
const upload                 = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// Analytics & browse (before /:id to avoid conflict)
router.get('/analytics', adminOnly, getAnalytics);
router.get('/all', getAllComplaints);

// CRUD
router.get('/',    getComplaints);

router.post('/',
  upload.array('images', 5),            // accept up to 5 images
  [
    body('title').trim().isLength({ min: 10, max: 150 }).withMessage('Title: 10–150 chars'),
    body('description').trim().isLength({ min: 20, max: 2000 }).withMessage('Description: 20–2000 chars'),
    body('severity').isIn(['low','medium','high','critical']).withMessage('Invalid severity'),
    validate,
  ],
  createComplaint
);

router.get('/:id',    getComplaint);
router.put('/:id',    adminOnly, updateComplaint);
router.delete('/:id', adminOnly, deleteComplaint);

// Upvote (any logged-in user)
router.post('/:id/upvote', upvoteComplaint);

module.exports = router;
