const express = require('express');
const {
  getWaitingList,
  getServingList,
  callNextToken,
  completeToken,
  skipToken,
  adminCancelToken,
  getStatistics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/queue', getWaitingList);
router.get('/serving', getServingList);
router.get('/statistics', getStatistics);
router.post('/queue/:serviceId/call-next', callNextToken);
router.put('/queue/:id/complete', completeToken);
router.put('/queue/:id/skip', skipToken);
router.put('/queue/:id/cancel', adminCancelToken);

module.exports = router;
