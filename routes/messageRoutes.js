const express = require('express');
const router = express.Router();
const { getConversation, getConversationList } = require('../controllers/messageController');

router.get('/conversations/:userId', getConversationList);
router.get('/:userId/:otherId', getConversation);

module.exports = router;