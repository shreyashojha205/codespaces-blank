const bcrypt = require('bcrypt');
const { query } = require('../config/db');

const SALT_ROUNDS = 12;

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' },
      });
    }

    // Try guest login first
    const guests = await query('SELECT GuestID, Email, PasswordHash FROM Guests WHERE Email = ?', [email]);
    if (guests.length) {
      const guest = guests[0];
      const match = await bcrypt.compare(password, guest.PasswordHash);
      if (!match) {
        return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
      }

      req.session.user = {
        id: guest.GuestID,
        email: guest.Email,
        role: 'Guest',
      };
      return res.json({ success: true, data: { role: 'Guest' } });
    }

    // Fallback: staff login (Receptionist / Manager)
    const staffs = await query('SELECT StaffID, Email, PasswordHash, Role FROM Staff WHERE Email = ?', [email]);
    if (staffs.length) {
      const staff = staffs[0];
      const match = await bcrypt.compare(password, staff.PasswordHash);
      if (!match) {
        return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
      }

      req.session.user = {
        id: staff.StaffID,
        email: staff.Email,
        role: staff.Role,
      };
      return res.json({ success: true, data: { role: staff.Role } });
    }

    return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
  } catch (err) {
    return next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields' },
      });
    }

    const existing = await query('SELECT GuestID FROM Guests WHERE Email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email is already registered' },
      });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const registrationDate = new Date().toISOString().slice(0, 10);

    await query(
      'INSERT INTO Guests (FirstName, LastName, Email, PasswordHash, Phone, RegistrationDate, Address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashed, phone || null, registrationDate, address || null]
    );

    return res.status(201).json({
      success: true,
      data: { message: 'Registration successful' },
    });
  } catch (err) {
    return next(err);
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: { message: 'Could not log out' } });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, data: { message: 'Logged out' } });
  });
};

module.exports = {
  login,
  register,
  logout,
};
