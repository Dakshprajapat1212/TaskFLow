const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      default: 'todo',
    },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    sortOrder: {
      type: Number,
      default: () => Date.now(),
    },
    dueDate: {
      type: Date,
    },
    estimatedEffort: {
      type: String,
    },
    assignee: {
      type: String,
      trim: true,
    },
    subtasks: [subtaskSchema],
    tags: [{ type: String, trim: true }],
    comments: [
      {
        text: { type: String, required: true },
        author: { type: String, default: 'You' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
