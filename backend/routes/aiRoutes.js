const express = require('express');
const router = express.Router();
const { suggestEstimate, suggestSubtasks, categorizeTask, parseNaturalLanguage } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/suggest', protect, suggestEstimate);
router.post('/subtasks', protect, suggestSubtasks);
router.post('/categorize', protect, categorizeTask);
router.post('/parse', protect, parseNaturalLanguage);

module.exports = router;
