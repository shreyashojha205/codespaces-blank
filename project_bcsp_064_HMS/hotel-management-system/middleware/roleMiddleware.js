const ensureRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
  }

  const { role } = req.session.user;
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Insufficient permissions' },
    });
  }

  return next();
};

module.exports = {
  ensureRole,
};
