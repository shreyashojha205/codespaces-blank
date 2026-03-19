require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const rateLimit = require('express-rate-limit');
const { redisClient } = require('./config/redis');
const { sessionConfig } = require('./config/session');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  session({
    ...sessionConfig,
    store: new RedisStore({ client: redisClient }),
  })
);

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Protect view access so only authenticated sessions can access dashboards
app.use('/views', (req, res, next) => {
  const openPaths = ['/login.html', '/register.html'];
  if (openPaths.includes(req.path)) {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res.redirect('/');
  }

  return next();
});
app.use('/views', express.static(path.join(__dirname, 'views')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// Fallback route for minimal HTML entrypoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HMS server listening on http://localhost:${port}`);
});
