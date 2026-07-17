const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { env } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');
const path = require('path');
const { LOCAL_DIR } = require('./modules/uploads/storage');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const accountRoutes = require('./modules/account/account.routes');
const settingsRoutes = require('./modules/settings/settings.routes');
const customersRoutes = require('./modules/customers/customers.routes');
const supportRoutes = require('./modules/support/support.routes');

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  // CORS: in development allow any local origin (localhost / 127.0.0.1 / private LAN IPs
  // like 172.x, 192.168.x, 10.x) so Vite's --host and phones on the same network work.
  // In production, only the explicit CORS_ORIGINS allowlist is accepted.
  const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(origin);
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / same-origin / mobile apps
      if (env.corsOrigins.includes(origin)) return cb(null, true);
      if (env.nodeEnv !== 'production' && isLocalOrigin(origin)) return cb(null, true);
      return cb(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  // Serve locally-stored uploads (payment screenshots, product images) when not using S3.
  // Set CORP to cross-origin so the storefront/admin (different port) can display them.
  app.use('/uploads', (req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); }, express.static(LOCAL_DIR));

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.get('/ready', (req, res) => res.json({ ready: true }));

  const v1 = express.Router();
  v1.use(apiLimiter);
  v1.use('/auth', authRoutes);
  v1.use('/products', productRoutes);
  v1.use('/orders', orderRoutes);
  v1.use('/analytics', analyticsRoutes);
  v1.use('/uploads', uploadRoutes);
  v1.use('/account', accountRoutes);
  v1.use('/settings', settingsRoutes);
  v1.use('/customers', customersRoutes);
  v1.use('/support', supportRoutes);
  app.use('/api/v1', v1);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
