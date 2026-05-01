import { Request, Response } from 'express';
import {
  removeBackgroundAI,
  upscaleImageAI,
  createPassportPhotoAI,
  enhanceImageAI,
  checkAIServiceHealth,
} from '../services/aiProcessingService';

/**
 * POST /api/ai/remove-background
 * Remove background using AI service (rembg)
 */
export const removeBackground = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
      return;
    }

    const backgroundColor = req.body.bg_color || '#ffffff';

    console.log('AI background removal requested');

    const processedImage = await removeBackgroundAI(req.file.buffer, backgroundColor);

    res.set('Content-Type', 'image/png');
    res.send(processedImage);
  } catch (error: any) {
    console.error('AI background removal error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove background',
    });
  }
};

/**
 * POST /api/ai/upscale
 * Upscale image using AI service
 */
export const upscaleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
      return;
    }

    const scale = parseInt(req.body.scale) || 2;

    console.log(`AI upscaling requested: ${scale}x`);

    const processedImage = await upscaleImageAI(req.file.buffer, scale);

    res.set('Content-Type', 'image/png');
    res.send(processedImage);
  } catch (error: any) {
    console.error('AI upscaling error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upscale image',
    });
  }
};

/**
 * POST /api/ai/passport-photo
 * Create professional passport photo using complete AI pipeline
 */
export const createPassportPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
      return;
    }

    const countryCode = req.body.country_code || 'IN';
    const backgroundColor = req.body.bg_color || '#ffffff';
    const enhance = req.body.enhance !== 'false';

    console.log(`AI passport photo creation: ${countryCode}, enhance=${enhance}`);

    const result = await createPassportPhotoAI(
      req.file.buffer,
      countryCode,
      backgroundColor,
      enhance
    );

    res.set('Content-Type', 'image/png');
    res.set('X-Country', result.country);
    res.set('X-Width', result.width.toString());
    res.set('X-Height', result.height.toString());
    res.set('X-DPI', result.dpi.toString());
    res.send(result.image);
  } catch (error: any) {
    console.error('AI passport photo creation error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create passport photo',
    });
  }
};

/**
 * POST /api/ai/enhance
 * Enhance image with manual adjustments
 */
export const enhanceImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
      return;
    }

    const brightness = parseInt(req.body.brightness) || 0;
    const contrast = parseInt(req.body.contrast) || 0;
    const saturation = parseInt(req.body.saturation) || 0;

    console.log(`AI enhancement: brightness=${brightness}, contrast=${contrast}, saturation=${saturation}`);

    const processedImage = await enhanceImageAI(
      req.file.buffer,
      brightness,
      contrast,
      saturation
    );

    res.set('Content-Type', 'image/png');
    res.send(processedImage);
  } catch (error: any) {
    console.error('AI enhancement error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enhance image',
    });
  }
};

/**
 * GET /api/ai/health
 * Check AI service health
 */
export const checkHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const isHealthy = await checkAIServiceHealth();

    if (isHealthy) {
      res.json({
        success: true,
        status: 'healthy',
        message: 'AI service is running',
      });
    } else {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        message: 'AI service is not available',
      });
    }
  } catch (error: any) {
    console.error('AI health check error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Health check failed',
    });
  }
};

export default {
  removeBackground,
  upscaleImage,
  createPassportPhoto,
  enhanceImage,
  checkHealth,
};
