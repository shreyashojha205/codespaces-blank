const session = require('express-session');

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: (parseInt(process.env.SESSION_TTL_SECONDS, 10) || 86400) * 1000,
  },
};

module.exports = {
  sessionConfig,
};
