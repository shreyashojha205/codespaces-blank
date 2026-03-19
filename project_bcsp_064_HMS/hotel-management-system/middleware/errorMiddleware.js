const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || undefined,
    },
  });
};

module.exports = {
  errorHandler,
};
