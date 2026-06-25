const Board = require('../models/Board');

// @desc    Get boards
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user.id });
    res.status(200).json(boards);
  } catch (error) {
    next(error);
  }
};

// @desc    Set board
// @route   POST /api/boards
// @access  Private
const setBoard = async (req, res, next) => {
  try {
    if (!req.body.title) {
      res.status(400);
      throw new Error('Please add a title field');
    }

    const board = await Board.create({
      title: req.body.title,
      description: req.body.description || '',
      owner: req.user.id,
    });

    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Make sure the logged in user matches the board owner
    if (board.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedBoard = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedBoard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      res.status(404);
      throw new Error('Board not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Make sure the logged in user matches the board owner
    if (board.owner.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await board.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoards,
  setBoard,
  updateBoard,
  deleteBoard,
};
