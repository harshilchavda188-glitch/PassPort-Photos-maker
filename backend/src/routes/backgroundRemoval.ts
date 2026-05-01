import express, { Request, Response } from 'express';
import multer from 'multer';
import * as backgroundRemovalService from '../services/backgroundRemovalService';
import { removeBackground as multiRemoveBackground, getAvailableTools, BGTool } from '../services/multiBackgroundRemovalService';
import fs from 'fs';
import path from 'path';

const { removeBackground, checkApiStatus } = backgroundRemovalService;

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB secure limit
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
 * POST /api/background-removal/remove
 * Remove background from uploaded image using Remove.bg API
 * Advanced implementation with temp file handling
 */
router.post('/remove', upload.single('image'), async (req: Request, res: Response) => {
  try {
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    // Get parameters from request
    const backgroundColor = req.body.bg_color || '#ffffff';
    const size = req.body.size || 'auto';
    const tool = req.body.tool as BGTool | undefined;

    console.log(`Background removal requested with tool: ${tool || 'default'}`);

    // Process image with selected tool (or use multi-tool service)
    let processedImage: Buffer;
    
    if (tool && tool !== 'removebg') {
      // Use multi-tool service for non-Remove.bg tools
      const result = await multiRemoveBackground(
        req.file.buffer,
        backgroundColor,
        tool
      );
      processedImage = result.image;
    } else {
      // Use original Remove.bg service
      processedImage = await removeBackground(
        req.file.buffer,
        backgroundColor,
        size
      );
    }

    // Send file as binary stream (Fastest)
    res.set('Content-Type', 'image/png');
    res.set('X-Processing-Tool', tool || 'local');
    res.send(processedImage);
  } catch (error: any) {
    console.warn('BG removal error (suppressed spam):', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Background removal failed',
    });
  }
});

/**
 * GET /api/background-removal/status
 * Check Remove.bg API account status and remaining credits
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await checkApiStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.warn('API status error (suppressed):', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check API status',
    });
  }
});

/**
 * GET /api/background-removal/tools
 * Get available background removal tools
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const tools = getAvailableTools();
    res.json({
      success: true,
      data: tools,
    });
  } catch (error: any) {
    console.warn('Tools error (suppressed):', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get available tools',
    });
  }
});

/**
 * POST /api/background-removal/remove-base64
 * Remove background from base64 encoded image
 */
router.post('/remove-base64', async (req: Request, res: Response) => {
  try {
    const { image_base64, bg_color, size } = req.body;

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

    // Convert base64 to buffer
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Process image
    const processedImage = await removeBackground(
      imageBuffer,
      bg_color || '#ffffff',
      size || 'auto'
    );

    // Convert back to base64
    const base64Result = processedImage.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Result}`;

    res.json({
      success: true,
      data: {
        image: dataUrl,
      },
    });
  } catch (error: any) {
    console.warn('Base64 BG removal error (suppressed):', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Background removal failed',
    });
  }
});

export default router;
