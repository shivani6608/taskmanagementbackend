// 404 handler for unmatched routes
const notFound = (req, res, next) => {
 const error = new Error(`Route not found: ${req.originalUrl}`);
 res.status(404);
 next(error);
};
// Centralized error handler â€” normalizes Mongoose/JWT/generic errors into JSON.
const errorHandler = (err, req, res, next) => {
 let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
 let message = err.message || 'Server error';
 if (err.name === 'ValidationError') {
 statusCode = 400;
 message = Object.values(err.errors)
 .map((val) => val.message)
 .join(', ');
 }
 if (err.name === 'CastError') {
 statusCode = 400;
 message = `Invalid value for field "${err.path}"`;
 }
 if (err.code === 11000) {
 statusCode = 400;
 const field = Object.keys(err.keyValue || {})[0];
 message = field ? `${field} already in use` : 'Duplicate field value';
 }
 if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
 statusCode = 401;
 message = 'Not authorized, invalid or expired token';
 }
 res.status(statusCode).json({
 message,
 stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
 });
};
module.exports = { notFound, errorHandler };