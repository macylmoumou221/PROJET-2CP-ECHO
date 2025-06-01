const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Serve files from uploads directory
router.get('/*', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params[0]);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: `File ${req.params[0]} not found`,
      status: 404
    });
  }

  // Send file
  res.sendFile(filePath);
});

module.exports = router;