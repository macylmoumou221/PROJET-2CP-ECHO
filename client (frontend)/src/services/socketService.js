import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.BASE_URL = 'http://localhost:5000';
  }

  connect(token) {
    this.socket = io(this.BASE_URL, {
      auth: { token },
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(receiverId, text, mediaUrl = null) {
    this.socket.emit('sendMessage', { receiverId, text, mediaUrl });
  }

  sendTyping(receiverId) {
    this.socket.emit('typing', { receiverId });
  }

  sendStopTyping(receiverId) {
    this.socket.emit('stopTyping', { receiverId });
  }

  onNewMessage(callback) {
    this.socket.on('newMessage', callback);
  }

  onUserTyping(callback) {
    this.socket.on('userTyping', callback);
  }

  onUserStopTyping(callback) {
    this.socket.on('userStopTyping', callback);
  }

  onUserOnline(callback) {
    this.socket.on('userOnline', callback);
  }

  onUserOffline(callback) {
    this.socket.on('userOffline', callback);
  }

  onOnlineUsers(callback) {
    this.socket.on('onlineUsers', callback);
  }

  onConversationUpdate(callback) {
    this.socket.on('conversationUpdate', callback);
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Add connection check method
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();
