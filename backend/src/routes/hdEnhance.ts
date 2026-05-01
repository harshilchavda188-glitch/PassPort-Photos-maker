import express from 'express';
import path from 'path';
import multer from 'multer';
import { enhanceHD, enhanceHDBatch, getRecommendations } from '../controllers/hdEnhanceController';

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
 * POST /api/hd-enhance
 * Enhance single image to HD quality
 */
router.post('/', upload.single('image'), enhanceHD);

/**
 * POST /api/hd-enhance/batch
 * Enhance multiple images to HD quality
 */
router.post('/batch', upload.array('images', 10), enhanceHDBatch);

/**
 * GET /api/hd-enhance/recommend
 * Get recommended settings for image
 */
router.get('/recommend', getRecommendations);

export default router;
