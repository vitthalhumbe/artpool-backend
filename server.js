require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});
app.use((req, res, next) => {
  if (req.body) {
    JSON.stringify(req.body).replace(/\$|\./g, '');
  }
  next();
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/artworks', require('./routes/artworkRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/commissions', require('./routes/commissionRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send_message', async (data) => {
    const { senderId, receiverId, text } = data;
    const Message = require('./models/Message');
    const Notification = require('./models/Notification');

    const message = await Message.create({ sender: senderId, receiver: receiverId, text });
    const populated = await message.populate('sender', 'username profile.avatar_url');

    // Send to receiver if online
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', populated);
    }

    // Create notification
    const notif = await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'message',
      text: `sent you a message`
    });
    const populatedNotif = await notif.populate('sender', 'username profile.avatar_url');
    if (receiverSocket) {
      io.to(receiverSocket).emit('new_notification', populatedNotif);
    }
  });

  socket.on('send_notification', async (data) => {
    const { recipientId, senderId, type, text } = data;
    const Notification = require('./models/Notification');

    const notif = await Notification.create({ recipient: recipientId, sender: senderId, type, text });
    const populated = await notif.populate('sender', 'username profile.avatar_url');

    const recipientSocket = onlineUsers.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('new_notification', populated);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) { onlineUsers.delete(userId); break; }
    }
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`mongo connected : ${conn.connection.host}`);
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
};

app.get('/', (req, res) => res.send('api running'));

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server runs at : ${PORT}`));
});