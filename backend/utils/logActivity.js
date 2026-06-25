const Activity = require('../models/Activity');

const logActivity = async ({ userId, boardId, taskId, action }) => {
  try {
    await Activity.create({
      user: userId,
      board: boardId,
      task: taskId,
      action,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
