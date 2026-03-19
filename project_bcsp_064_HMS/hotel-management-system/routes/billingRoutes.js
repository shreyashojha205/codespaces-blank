const express = require('express');
const { calculateBilling, getBills, payBill } = require('../controllers/billingController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(ensureAuthenticated);

// Any authenticated user can calculate a bill for their booking (Guest)
router.get('/:bookingId', calculateBilling);

// Manager can list bills and mark paid
router.get('/', ensureRole(['Manager']), getBills);
router.put('/:id/pay', ensureRole(['Manager']), payBill);

module.exports = router;
