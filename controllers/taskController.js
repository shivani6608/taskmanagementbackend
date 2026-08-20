const Task = require('../models/Task');
const { getWeatherByCity } = require('../utils/weatherService');
const { sendTaskCreatedEmail, sendTaskCompletedEmail } = require('../utils/emailService');

const ALLOWED_SORT_FIELDS = ['createdAt', 'dueDate', 'title', 'priority'];
const PRIORITY_RANK = { LOW: 1, MEDIUM: 2, HIGH: 3 };

// @desc Get logged-in user's tasks with filtering, search, sorting & pagination
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Filter tasks so users only ever access their own data
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.max(Number(limit) || 10, 1);
    const skip = (numericPage - 1) * numericLimit;
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

    let tasks;
    let total;

    if (sortField === 'priority') {
      // Priority is stored as LOW/MEDIUM/HIGH text, which doesn't sort correctly
      // alphabetically, so rank it numerically before sorting.
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            priorityRank: {
              $switch: {
                branches: Object.entries(PRIORITY_RANK).map(([key, rank]) => ({
                  case: { $eq: ['$priority', key] },
                  then: rank,
                })),
                default: 0,
              },
            },
          },
        },
        { $sort: { priorityRank: sortDirection, createdAt: -1 } },
        { $project: { priorityRank: 0 } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: numericLimit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];
      const [result] = await Task.aggregate(pipeline);
      tasks = result.data;
      total = result.totalCount[0]?.count || 0;
    } else {
      [tasks, total] = await Promise.all([
        Task.find(query)
          .sort({ [sortField]: sortDirection, createdAt: -1 })
          .skip(skip)
          .limit(numericLimit),
        Task.countDocuments(query),
      ]);
    }

    res.json({
      data: tasks,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        lastPage: Math.max(Math.ceil(total / numericLimit), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get a single task by id (must belong to the logged-in user)
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc Create a task (optional file attachment + location weather + confirmation email)
// @route POST /api/tasks
// @access Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, location } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let weather = null;
    if (location) {
      try {
        weather = await getWeatherByCity(location);
      } catch (err) {
        console.error('Weather fetch failed:', err.message);
        // don't block task creation if weather lookup fails
      }
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      location,
      weather,
      fileUrl: req.file ? req.file.path : undefined,
    });

    // Fire-and-forget side effect — never block the response on it
    await sendTaskCreatedEmail(req.user, task);

    res.status(201).json(task.toObject());
  } catch (error) {
    next(error);
  }
};

// @desc Update a task (ownership enforced); sends completion email on DONE transition
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, dueDate, location } = req.body;
    const wasNotDone = task.status !== 'DONE';

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || undefined;
    if (req.file) task.fileUrl = req.file.path;

    if (location !== undefined) {
      task.location = location;
      if (location) {
        try {
          task.weather = await getWeatherByCity(location);
        } catch (err) {
          console.error('Weather fetch failed:', err.message);
          task.weather = null;
        }
      } else {
        task.weather = null;
      }
    }

    await task.save();

    if (wasNotDone && task.status === 'DONE') {
     await sendTaskCompletedEmail(req.user, task);
    }

    res.json(task.toObject());
  } catch (error) {
    next(error);
  }
};

// @desc Delete a task (ownership enforced)
// @route DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', _id: task._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
