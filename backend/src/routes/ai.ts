import express from 'express';
import path from 'path';
import multer from 'multer';
import {
  removeBackground,
  upscaleImage,
  createPassportPhoto,
  enhanceImage,
  checkHealth,
} from '../controllers/aiController';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') && 
        ['.jpg','.jpeg','.png','.webp'].includes(
          path.extname(file.originalname).toLowerCase()
        )) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG/PNG/WEBP images (10MB max)'));
    }
  },
});

/**
 * POST /api/ai/remove-background
 * Remove background using AI service (rembg)
 */
router.post('/remove-background', upload.single('image'), removeBackground);

/**
 * POST /api/ai/upscale
 * Upscale image using AI service
 */
router.post('/upscale', upload.single('image'), upscaleImage);

/**
 * POST /api/ai/passport-photo
 * Create professional passport photo
 */
router.post('/passport-photo', upload.single('image'), createPassportPhoto);

/**
 * POST /api/ai/enhance
 * Enhance image with manual adjustments
 */
router.post('/enhance', upload.single('image'), enhanceImage);

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', checkHealth);

export default router;
