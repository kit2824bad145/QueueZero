const express = require('express');
const {
  joinQueue,
  getMyActiveToken,
  cancelMyToken,
  getMyHistory,
} = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('customer'));

router.post('/join', joinQueue);
router.get('/my-token', getMyActiveToken);
router.get('/history', getMyHistory);
router.put('/:id/cancel', cancelMyToken);

module.exports = router;
