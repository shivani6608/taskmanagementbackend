                    const User = require('../models/User');
const generateToken = require('../utils/generateToken');
// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res, next) => {
 try {
 const { name, email, password } = req.body;
 if (!name || !email || !password) {
 return res.status(400).json({ message: 'Name, email and password are required' });
 }
 const existingUser = await User.findOne({ email: email.toLowerCase() });
 if (existingUser) {
 return res.status(400).json({ message: 'A user with this email already exists' });
 }
 const user = await User.create({ name, email, password });
 res.status(201).json({
 _id: user._id,
 name: user.name,
 email: user.email,
 token: generateToken(user._id),
 });
 } catch (error) {
 next(error);
 }
};
// @desc Authenticate user & get token
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res, next) => {
 try {
 const { email, password } = req.body;
 if (!email || !password) {
 return res.status(400).json({ message: 'Email and password are required' });
 }
 const user = await User.findOne({ email: email.toLowerCase() });
 if (!user || !(await user.matchPassword(password))) {
 return res.status(401).json({ message: 'Invalid email or password' });
 }
 res.json({
 _id: user._id,
 name: user.name,
 email: user.email,
 token: generateToken(user._id),
 });
 } catch (error) {
 next(error);
 }
};
// @desc Get the currently authenticated user
// @route GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
 res.json(req.user);
};
module.exports = { registerUser, loginUser, getMe };