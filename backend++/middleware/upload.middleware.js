const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const ensureUploadsDir = (type) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const typeDir = path.join(uploadsDir, type);
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }
  
  return typeDir;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.uploadType || 'misc';
    const uploadPath = ensureUploadsDir(uploadType);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Keep original filename and add timestamp to ensure uniqueness
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext);
    cb(null, `${filename}-${uniqueSuffix}${ext}`);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Only allow image types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/i;
  
  // Get file extension and convert to lowercase
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check file extension
  const isValidExt = allowedImageTypes.test(ext);
  
  // Check mime type
  const isValidMime = file.mimetype.startsWith('image/');
  
  if (isValidExt && isValidMime) {
    req.mediaType = 'image';
    return cb(null, true);
  }
  
  cb(new Error('Format de fichier non supporté. Seules les images sont autorisées.'));
};

// Create the upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for images
  },
  fileFilter: fileFilter
});

// Middleware to handle file uploads
exports.uploadFile = (field, type) => {
  return (req, res, next) => {
    req.uploadType = type;
    
    // If URL is provided instead of file upload
    if (req.body.mediaUrl) {
      req.file = {
        filename: req.body.mediaUrl,
        originalname: req.body.mediaUrl
      };
      return next();
    }
    
    const uploadSingle = upload.single(field);
    
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error (e.g., file too large)
        return res.status(400).json({
          message: err.code === 'LIMIT_FILE_SIZE' 
            ? 'Le fichier est trop volumineux. La taille maximale est de 10MB.'
            : `Erreur d'upload: ${err.message}`
        });
      } else if (err) {
        // Other errors (e.g., invalid file type)
        return res.status(400).json({
          message: err.message
        });
      }
      
      // Add file type information if a file was uploaded
      if (req.file) {
        req.file.mediaType = 'image';
      }
      
      next();
    });
  };
};