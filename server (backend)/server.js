require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const connectDB = require('./config/database');
const session = require('express-session');
const passport = require('./config/passport');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Initialize socket service
const socketService = require('./services/socket.service')(io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10000 // limit each IP to 10000 requests per day
});

// Enable CORS with proper configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // Preflight results can be cached for 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression middleware
app.use(compression());

// Serve static files with CORS headers
const serveStaticWithCORS = (directory) => {
  return (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    express.static(directory)(req, res, next);
  };
};

// Apply the modified static file serving
app.use('/uploads', serveStaticWithCORS(path.join(__dirname, 'uploads')));
app.use('/api/uploads', serveStaticWithCORS(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const claimRoutes = require('./routes/claim.routes');
const eventRoutes = require('./routes/event.routes');
const lostFoundRoutes = require('./routes/lostFound.routes');
const announcementRoutes = require('./routes/announcement.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');

// Apply rate limiting to API routes only (after static file serving)
app.use('/api', limiter);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Handle 404 routes - This must be after all valid routes
app.all('*', (req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});