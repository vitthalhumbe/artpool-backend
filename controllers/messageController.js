const Message = require('../models/Message');

const getConversation = async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    }).populate('sender', 'username profile.avatar_url').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversationList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'username profile.avatar_url')
      .populate('receiver', 'username profile.avatar_url')
      .sort({ createdAt: -1 });

    // Get unique conversations
    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const otherId = msg.sender._id.toString() === userId ? msg.receiver._id.toString() : msg.sender._id.toString();
      if (!seen.has(otherId)) {
        seen.add(otherId);
        conversations.push({
          other: msg.sender._id.toString() === userId ? msg.receiver : msg.sender,
          lastMessage: msg.text,
          createdAt: msg.createdAt
        });
      }
    }
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConversation, getConversationList };