const express = require('express');
const router = express.Router();
const {
  getBoards,
  setBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBoards).post(protect, setBoard);
router.route('/:id').put(protect, updateBoard).delete(protect, deleteBoard);

module.exports = router;
