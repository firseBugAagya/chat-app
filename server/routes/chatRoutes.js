const express = require('express');
const router = express.Router();
const { getContacts, getMessages, sendMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/contacts', authMiddleware, getContacts);
router.get('/messages/:receiverId', authMiddleware, getMessages);
router.post('/messages', authMiddleware, sendMessage);

module.exports = router;