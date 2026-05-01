import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import logger from './utils/logger';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { config } from './config/env';
import rateLimit from 'express-rate-limit';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Handle fatal errors
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  config.frontendUrl
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200, // Increased limit for testing
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
import authRoutes from './routes/auth';
import backgroundRemovalRoutes from './routes/backgroundRemoval';
import hdEnhanceRoutes from './routes/hdEnhance';
import aiRoutes from './routes/ai';

app.use('/api/auth', authRoutes);
app.use('/api/background-removal', backgroundRemovalRoutes);
app.use('/api/hd-enhance', hdEnhanceRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = config.port;
const server = app.listen(PORT, () => {
  const mode = process.env.NODE_ENV || 'development';
  logger.info(`Server running in ${mode} mode on port ${PORT}`);
});

server.timeout = 300000;
server.keepAliveTimeout = 300000;

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
