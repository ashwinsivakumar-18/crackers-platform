const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { env } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/products/product.routes');
const orderRoutes = require('./modules/orders/order.routes');
const crmRoutes = require('./modules/crm/crm.routes');
const campaignRoutes = require('./modules/campaigns/campaign.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const accountRoutes = require('./modules/account/account.routes');
const settingsRoutes = require('./modules/settings/settings.routes');

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.get('/ready', (req, res) => res.json({ ready: true }));

  const v1 = express.Router();
  v1.use(apiLimiter);
  v1.use('/auth', authRoutes);
  v1.use('/products', productRoutes);
  v1.use('/orders', orderRoutes);
  v1.use('/crm', crmRoutes);
  v1.use('/campaigns', campaignRoutes);
  v1.use('/analytics', analyticsRoutes);
  v1.use('/uploads', uploadRoutes);
  v1.use('/account', accountRoutes);
  v1.use('/settings', settingsRoutes);
  app.use('/api/v1', v1);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
