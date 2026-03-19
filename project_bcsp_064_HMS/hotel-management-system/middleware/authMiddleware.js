const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: { message: 'Authentication required' },
  });
};

const ensureGuest = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'Guest') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: { message: 'Guest access only' },
  });
};

module.exports = {
  ensureAuthenticated,
  ensureGuest,
};
