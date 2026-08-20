const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Verifies the incoming Authorization: Bearer <token> header and attaches
// the authenticated user (minus password) to req.user.
const protect = async (req, res, next) => {
 let token;
 const authHeader = req.headers.authorization;
 if (authHeader && authHeader.startsWith('Bearer ')) {
 token = authHeader.split(' ')[1];
 }
 if (!token) {
 return res.status(401).json({ message: 'Not authorized, no token provided' });
 }
 try {
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
 const user = await User.findById(decoded.id).select('-password');
 if (!user) {
 return res.status(401).json({ message: 'Not authorized, user not found' });
 }
 req.user = user;
 next();
 } catch (error) {
 return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
 }
};
module.exports = { protect };