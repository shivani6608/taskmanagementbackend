const express = require('express');
const {
 getTasks,
 getTaskById,
 createTask,
 updateTask,
 deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const router = express.Router();
router.use(protect);
router.route('/').get(getTasks).post(uploadSingle, createTask);
router.route('/:id').get(getTaskById).put(uploadSingle, updateTask).delete(deleteTask);
module.exports = router;
