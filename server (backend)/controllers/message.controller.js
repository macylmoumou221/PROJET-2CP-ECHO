const Message = require('../models/message.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const fs = require('fs');
const path = require('path');

// Get all conversations
exports.getConversations = async (req, res) => {
  try {
    // Find all users the current user has messaged with
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    // Extract unique conversation partners
    const conversationPartners = new Set();
    const latestMessages = {};
    
    messages.forEach(message => {
      const partnerId = message.sender.toString() === req.user._id.toString() 
        ? message.receiver.toString() 
        : message.sender.toString();
      
      conversationPartners.add(partnerId);
      
      // Store the latest message for each partner
      if (!latestMessages[partnerId] || message.createdAt > latestMessages[partnerId].createdAt) {
        latestMessages[partnerId] = message;
      }
    });
    
    // Filter out null partners and handle user lookup errors
    const conversations = (await Promise.all(
      Array.from(conversationPartners).map(async partnerId => {
        try {
          const partner = await User.findById(partnerId).select('username firstName lastName profilePicture');
          
          // Skip if partner no longer exists
          if (!partner) {
            return null;
          }
          
          const latestMessage = latestMessages[partnerId];
          const unreadCount = await Message.countDocuments({
            sender: partnerId,
            receiver: req.user._id,
            isRead: false
          });
          
          return {
            partner: {
              _id: partner._id,
              username: partner.username,
              firstName: partner.firstName,
              lastName: partner.lastName,
              profilePicture: partner.profilePicture
            },
            latestMessage: {
              _id: latestMessage._id,
              text: latestMessage.text,
              media: latestMessage.media,
              mediaType: latestMessage.mediaType,
              createdAt: latestMessage.createdAt,
              isFromUser: latestMessage.sender.toString() === req.user._id.toString()
            },
            unreadCount
          };
        } catch (err) {
          console.error(`Error fetching partner ${partnerId}:`, err);
          return null;
        }
      })
    )).filter(conversation => conversation !== null); // Remove null entries
    
    // Sort conversations by latest message date
    conversations.sort((a, b) => 
      new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt)
    );
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Erreur de récupération des conversations:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get messages between current user and the specified user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Mark messages as read
    await Message.updateMany(
      { 
        sender: userId, 
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );
    
    // Get total count for pagination
    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    });
    
    // Add isFromUser field to each message
    const formattedMessages = messages.map(message => ({
      ...message,
      isFromUser: message.sender.toString() === req.user._id.toString()
    }));
    
    // Sort messages chronologically for display
    formattedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Get user details
    const partner = await User.findById(userId).select('username firstName lastName profilePicture');
    
    res.status(200).json({
      messages: formattedMessages,
      partner: {
        _id: partner._id,
        username: partner.username,
        firstName: partner.firstName,
        lastName: partner.lastName,
        profilePicture: partner.profilePicture
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur de récupération des messages:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// Send a message (used in WebSockets)
exports.sendMessage = async (senderId, receiverId, text, file = null) => {
  try {
    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text: text || ''
    });
    
    // Handle file if provided
    if (file) {
      message.media = `${process.env.FRONTEND_URL}/uploads/messages/${file}`;
      message.mediaType = 'image';
    }
    
    await message.save();
    
    // Create notification for receiver
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'message',
      content: 'vous a envoyé un message',
      relatedId: message._id,
      onModel: 'Message'
    });
    
    // Return the saved message
    const populatedMessage = await Message.findById(message._id).lean();
    
    return {
      ...populatedMessage,
      isFromUser: false // For the receiver
    };
  } catch (error) {
    console.error('Erreur d\'envoi de message:', error);
    throw error;
  }
};

// HTTP fallback for sending messages
exports.sendMessageHTTP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text, media } = req.body;
    
    // Create new message
    const message = new Message({
      sender: req.user._id,
      receiver: userId,
      text: text || ''
    });
    
    // Handle media upload (file or URL)
    if (req.file) {
      message.media = `${process.env.FRONTEND_URL}/uploads/messages/${req.file.filename}`;
      message.mediaType = 'image';
    } else if (media) {
      message.media = media;
      message.mediaType = 'image';
    }
    
    // Validate that either text or media is present
    if (!message.text && !message.media) {
      return res.status(400).json({ 
        message: 'Le message ou le média est requis' 
      });
    }
    
    await message.save();
    
    // Create notification for receiver
    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'message',
      content: 'vous a envoyé un message',
      relatedId: message._id,
      onModel: 'Message'
    });
    
    // Return the saved message
    const savedMessage = await Message.findById(message._id).lean();
    
    res.status(201).json({
      message: 'Message envoyé avec succès',
      data: {
        ...savedMessage,
        isFromUser: true
      }
    });
  } catch (error) {
    console.error('Erreur d\'envoi de message HTTP:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};