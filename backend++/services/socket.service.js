const Message = require('../models/message.model');
const Notification = require('../models/notification.model');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

module.exports = (io) => {
  // Store active users
  const activeUsers = new Map();
  
  io.on('connection', (socket) => {
    console.log('Nouveau client connecté');
    
    // User authentication
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;
        
        if (!token) {
          socket.emit('error', { message: 'Token non fourni' });
          return;
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.isEmailVerified || user.isBanned) {
          socket.emit('error', { message: 'Authentification invalide' });
          return;
        }
        
        // Store user socket mapping
        activeUsers.set(user._id.toString(), socket.id);
        socket.userId = user._id.toString();
        console.log(`Utilisateur ${user.username} (${user._id}) authentifié`);
        
        // Join a room specific to this user
        socket.join(user._id.toString());
        
        // Send online status
        io.emit('userOnline', user._id.toString());
        
        // Send user the list of currently online users
        const onlineUsers = Array.from(activeUsers.keys());
        socket.emit('onlineUsers', onlineUsers);
      } catch (error) {
        console.error('Erreur d\'authentification socket:', error);
        socket.emit('error', { message: 'Erreur d\'authentification' });
      }
    });
    
    // Handle private messaging
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, text, media } = data;
        
        if (!socket.userId) {
          socket.emit('error', { message: 'Non authentifié' });
          return;
        }

        // Validate message
        if (!text && !media) {
          socket.emit('error', { message: 'Message is required if no file is uploaded' });
          return;
        }

        if (text && text.trim() === '') {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }
        
        // Use the message controller to handle the message
        const messageController = require('../controllers/message.controller');
        const message = await messageController.sendMessage(socket.userId, receiverId, text, media);
        
        // Emit the message to the recipient if they're online
        if (activeUsers.has(receiverId)) {
          io.to(receiverId).emit('newMessage', {
            ...message,
            sender: {
              _id: socket.userId
            }
          });
        }
        
        // Emit back to sender
        socket.emit('messageSent', {
          ...message,
          isFromUser: true
        });
      } catch (error) {
        console.error('Erreur d\'envoi de message WebSocket:', error);
        socket.emit('error', { message: 'Erreur lors de l\'envoi du message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      
      if (!socket.userId) {
        return;
      }
      
      if (activeUsers.has(receiverId)) {
        io.to(receiverId).emit('userTyping', { userId: socket.userId });
      }
    });
    
    // Handle stop typing indicator
    socket.on('stopTyping', (data) => {
      const { receiverId } = data;
      
      if (!socket.userId) {
        return;
      }
      
      if (activeUsers.has(receiverId)) {
        io.to(receiverId).emit('userStopTyping', { userId: socket.userId });
      }
    });
    
    // Handle notifications
    socket.on('getNotifications', async () => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Non authentifié' });
          return;
        }
        
        const notifications = await Notification.find({ 
          recipient: socket.userId,
          isRead: false
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('sender', 'username profilePicture')
          .lean();
        
        socket.emit('notifications', notifications);
      } catch (error) {
        console.error('Erreur de récupération des notifications:', error);
        socket.emit('error', { message: 'Erreur lors de la récupération des notifications' });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client déconnecté');
      
      if (socket.userId) {
        // Remove from active users
        activeUsers.delete(socket.userId);
        
        // Notify others of user going offline
        io.emit('userOffline', socket.userId);
      }
    });
  });
  
  // Function to send notification to a specific user
  const sendNotification = (userId, notification) => {
    if (activeUsers.has(userId)) {
      io.to(userId).emit('notification', notification);
    }
  };
  
  return {
    sendNotification,
    activeUsers
  };
};