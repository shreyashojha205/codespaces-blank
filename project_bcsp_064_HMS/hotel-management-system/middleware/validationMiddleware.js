const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: { message: errors.array()[0].msg } });
    }
    return next();
  },
];

const validateRegister = [
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').isLength({ min: 2 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: { message: errors.array()[0].msg } });
    }
    return next();
  },
];

const validateBooking = [
  body('guestId').isInt({ gt: 0 }).withMessage('guestId must be a positive integer'),
  body('checkInDate').isISO8601().withMessage('checkInDate is required and must be a valid date'),
  body('checkOutDate').isISO8601().withMessage('checkOutDate is required and must be a valid date'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, error: { message: errors.array()[0].msg } });
    }

    const { checkInDate, checkOutDate } = req.body;
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(422).json({ success: false, error: { message: 'checkOutDate must be after checkInDate' } });
    }

    return next();
  },
];

module.exports = {
  validateLogin,
  validateRegister,
  validateBooking,
};
