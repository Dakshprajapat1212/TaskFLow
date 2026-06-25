const Activity = require('../models/Activity');
const Board = require('../models/Board');

const getActivities = async (req, res, next) => {
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
      throw new Error('Not authorized');
    }

    const activities = await Activity.find({ board: boardId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
