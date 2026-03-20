require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
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
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const sessionStore = new session.MemoryStore();

app.use(
  session({
    ...sessionConfig,
    store: sessionStore,
  })
);

// --- AGGRESSIVE DEBUG LOGGING ---
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`);
  console.log(`  -> Cookies received by Express:`, req.headers.cookie || 'NONE');
  console.log(`  -> Session ID:`, req.session ? req.session.id : 'UNDEFINED');
  console.log(`  -> Session User:`, req.session && req.session.user ? !!req.session.user : 'NO_USER');
  next();
});
// --------------------------------

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session && req.session.user ? req.session.user : null;
  next();
});

// Protect and render views dynamically
app.get('/views/:page', (req, res, next) => {
  let page = req.params.page;
  if (page.endsWith('.html')) page = page.replace('.html', '');

  const openPaths = ['login', 'register'];
  if (!openPaths.includes(page) && (!req.session || !req.session.user)) {
    return res.redirect('/');
  }

  res.render(page);
});

// Removed static views middleware

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// Fallback route for minimal HTML entrypoints
app.get('/', (req, res) => {
  res.render('login');
});

// Error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HMS server listening on http://localhost:${port}`);
});
