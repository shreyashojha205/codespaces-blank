const express = require('express');
const { login, register, logout } = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.post('/logout', logout);

module.exports = router;
