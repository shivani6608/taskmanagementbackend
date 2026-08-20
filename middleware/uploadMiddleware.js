const multer = require('multer');
const { storage } = require('../config/cloudinary');
// Single-file upload ("file" field) streamed directly to Cloudinary.
const upload = multer({
 storage,
 limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
module.exports = { uploadSingle: upload.single('file') };