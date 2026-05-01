import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  removeBgApiKey: process.env.REMOVE_BG_API_KEY || '',
  clipdropApiKey: process.env.CLIPDROP_API_KEY || '',
  replicateApiKey: process.env.REPLICATE_API_KEY || '',
  defaultBgTool: (process.env.DEFAULT_BG_TOOL as 'removebg' | 'clipdrop' | 'replicate' | 'local') || 'local',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIdPro: process.env.STRIPE_PRICE_ID_PRO || '',
    priceIdEnterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
};
