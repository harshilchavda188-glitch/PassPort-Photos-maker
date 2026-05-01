import { Request, Response } from 'express';
import { enhanceToHD, getRecommendedSettings } from '../services/realESRGANService';

/**
 * POST /api/hd-enhance
 * Enhance image to HD quality using Real-ESRGAN style processing
 */
export const enhanceHD = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
      return;
    }

    // Get enhancement options from request
    const quality = (req.body.quality as 'standard' | 'hd' | 'ultra') || 'hd';
    const backgroundColor = req.body.bg_color || '#ffffff';

    console.log(`HD Enhancement requested: quality=${quality}`);

    // Get image metadata for recommendations
    const imageBuffer = req.file.buffer;
    
    // Apply HD enhancement
    const enhancedBuffer = await enhanceToHD(imageBuffer, quality);

    // Return the enhanced image as binary stream
    res.set('Content-Type', 'image/jpeg');
    res.end(enhancedBuffer, 'binary');
  } catch (error: any) {
    console.error('HD enhancement error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enhance image',
    });
  }
};

/**
 * POST /api/hd-enhance/batch
 * Enhance multiple images to HD quality
 */
export const enhanceHDBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({
        success: false,
        message: 'No image files uploaded',
      });
      return;
    }

    const quality = (req.body.quality as 'standard' | 'hd' | 'ultra') || 'hd';
    const files = req.files as Express.Multer.File[];

    console.log(`Batch HD enhancement: ${files.length} images, quality=${quality}`);

    const results: Buffer[] = [];
    for (const file of files) {
      try {
        const enhanced = await enhanceToHD(file.buffer, quality);
        results.push(enhanced);
      } catch (error) {
        console.error('Failed to enhance one image:', error);
        results.push(file.buffer); // Return original if enhancement fails
      }
    }

    res.json({
      success: true,
      count: results.length,
      message: `Successfully enhanced ${results.length} images`,
    });
  } catch (error: any) {
    console.error('Batch HD enhancement error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enhance images',
    });
  }
};

/**
 * GET /api/hd-enhance/recommend
 * Get recommended enhancement settings based on image size
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const width = parseInt(req.query.width as string);
    const height = parseInt(req.query.height as string);

    if (!width || !height) {
      res.status(400).json({
        success: false,
        message: 'Width and height parameters are required',
      });
      return;
    }

    const recommendations = getRecommendedSettings(width, height);

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recommendations',
    });
  }
};

export default {
  enhanceHD,
  enhanceHDBatch,
  getRecommendations,
};
