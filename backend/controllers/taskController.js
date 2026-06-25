const Task = require('../models/Task');
const Board = require('../models/Board');
const logActivity = require('../utils/logActivity');

const normalizeSubtasks = (subtasks = []) =>
  subtasks.map((st) => {
    const status = st.status || (st.completed ? 'done' : 'todo');
    return {
      ...st.toObject?.() ?? st,
      status,
      completed: status === 'done' || st.completed === true,
    };
  });

const deriveParentStatus = (subtasks) => {
  if (!subtasks?.length) return null;
  const allDone = subtasks.every((st) => st.status === 'done' || st.completed);
  const hasActive = subtasks.some((st) => st.status === 'in-progress');
  if (allDone) return 'done';
  if (hasActive) return 'in-progress';
  return 'todo';
};

const formatTask = (task) => {
  const obj = task.toObject ? task.toObject() : { ...task };
  const subtasks = normalizeSubtasks(obj.subtasks);
  const derived = deriveParentStatus(subtasks);
  return {
    ...obj,
    subtasks,
    status: subtasks.length > 0 && derived ? derived : obj.status,
  };
};

// @desc    Get tasks for a specific board
// @route   GET /api/tasks?boardId=xxx
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { boardId } = req.query;

    if (!boardId) {
      res.status(400);
      throw new Error('Please provide a boardId');
    }

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    if (board.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to access tasks for this board');
    }

    const tasks = await Task.find({ board: boardId, owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks.map(formatTask));
  } catch (error) {
    next(error);
  }
};

// @desc    Set task
// @route   POST /api/tasks
// @access  Private
const setTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, sortOrder, dueDate, estimatedEffort, assignee, subtasks, tags, comments, boardId } = req.body;

    if (!title || !boardId) {
      res.status(400);
      throw new Error('Please add a title and boardId');
    }

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    if (board.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to add tasks to this board');
    }

    const normalizedSubtasks = normalizeSubtasks(subtasks || []);
    const derivedStatus = deriveParentStatus(normalizedSubtasks) || status || 'todo';

    const task = await Task.create({
      title,
      description,
      status: derivedStatus,
      priority,
      sortOrder,
      dueDate,
      estimatedEffort,
      assignee,
      subtasks: normalizedSubtasks,
      tags: tags || [],
      comments: comments || [],
      board: boardId,
      owner: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      boardId,
      taskId: task._id,
      action: `Created task "${title}"`,
    });

    res.status(201).json(formatTask(task));
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updates = { ...req.body };
    delete updates.boardId;
    delete updates.board;
    delete updates.owner;

    if (updates.subtasks) {
      updates.subtasks = normalizeSubtasks(updates.subtasks);
      const derived = deriveParentStatus(updates.subtasks);
      if (derived) updates.status = derived;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });

    const actionType = req.body.status && req.body.status !== task.status
      ? `Moved task "${task.title}" to ${req.body.status}`
      : `Updated task "${task.title}"`;

    await logActivity({
      userId: req.user.id,
      boardId: task.board,
      taskId: task._id,
      action: actionType,
    });

    res.status(200).json(formatTask(updatedTask));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await logActivity({
      userId: req.user.id,
      boardId: task.board,
      taskId: task._id,
      action: `Deleted task "${task.title}"`,
    });

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  setTask,
  updateTask,
  deleteTask,
  formatTask,
  normalizeSubtasks,
  deriveParentStatus,
};
