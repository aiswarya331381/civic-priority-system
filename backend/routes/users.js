const express = require('express');
const { getUsers, toggleUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/', getUsers);
router.put('/:id/toggle', toggleUser);

module.exports = router;
