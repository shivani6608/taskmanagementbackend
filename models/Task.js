const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: [1, 'Title is required'] },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
      default: 'PENDING',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },
    dueDate: { type: Date },
    location: { type: String, trim: true },
    weather: {
      temp: { type: Number },
      description: { type: String },
      icon: { type: String },
      cityName: { type: String },
    },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, status: 1, priority: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);