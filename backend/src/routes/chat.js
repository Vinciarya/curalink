const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');
const { validateChatRequest } = require('../middleware/validateRequest');

router.post('/', validateChatRequest, chat);
module.exports = router;
