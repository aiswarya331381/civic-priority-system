const express = require('express');
const { getUsers, toggleUser, makeAdmin } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Every route below requires (1) a valid logged-in user AND (2) that user's
// role to be 'admin'. This is enforced server-side regardless of what the
// frontend sends, so a normal user can never promote anyone by calling the
// API directly — they'll get a 403 from `adminOnly` before reaching the
// controller.
router.use(protect, adminOnly);

router.get('/', getUsers);
router.put('/:id/toggle', toggleUser);
router.post('/:id/make-admin', makeAdmin);

module.exports = router;