const express = require('express');
const {
  createBooking,
  checkIn,
  checkOut,
  listBookings,
} = require('../controllers/bookingController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { ensureRole } = require('../middleware/roleMiddleware');
const { validateBooking } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(ensureAuthenticated);

// Any authenticated user can create a booking (guest or staff)
router.post('/', validateBooking, createBooking);

// Receptionist / Manager can see all bookings
router.get('/', ensureRole(['Receptionist', 'Manager']), listBookings);

router.put('/:id/checkin', ensureRole(['Receptionist', 'Manager']), checkIn);
router.put('/:id/checkout', ensureRole(['Receptionist', 'Manager']), checkOut);

module.exports = router;
