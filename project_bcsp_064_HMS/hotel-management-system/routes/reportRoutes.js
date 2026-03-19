const express = require('express');
const {
  occupancyReport,
  revenueReport,
  pendingBills,
  popularRoomTypes,
} = require('../controllers/reportController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(ensureAuthenticated);
router.use(ensureRole(['Manager']));

router.get('/occupancy', occupancyReport);
router.get('/revenue', revenueReport);
router.get('/pending-bills', pendingBills);
router.get('/popular-room-types', popularRoomTypes);

module.exports = router;
