import sharp from 'sharp';
import axios from 'axios';
import FormData from 'form-data';
import { createCanvas, ImageData } from '@napi-rs/canvas';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Real-ESRGAN Style HD Enhancement
 * Professional AI-like super resolution using advanced algorithms
 * Provides 2x, 4x upscaling with detail enhancement
 */

interface EnhancementOptions {
  scale: number;           // 2x or 4x upscaling
  denoise: boolean;        // Reduce noise
  sharpen: boolean;        // Enhance details
  enhance: boolean;        // Auto color/brightness
}

/**
 * Apply Real-ESRGAN style enhancement
 * Uses advanced upscaling + sharpening + noise reduction
 */
export const applyRealESRGANEnhancement = async (
  imageBuffer: Buffer,
  options: EnhancementOptions = {
    scale: 2,
    denoise: true,
    sharpen: true,
    enhance: true,
  }
): Promise<Buffer> => {
  try {
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to read image dimensions');
    }

    const originalWidth = metadata.width;
    const originalHeight = metadata.height;
    const newWidth = originalWidth * options.scale;
    const newHeight = originalHeight * options.scale;

    console.log(`Upscaling: ${originalWidth}x${originalHeight} -> ${newWidth}x${newHeight}`);

    // Step 1: AI Upscaling via Python service (Real-ESRGAN / AI Model)
    try {
      console.log(`🚀 Using AI Microservice for ${options.scale}x upscale...`);
      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('scale', options.scale.toString());

      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/api/ai/upscale`,
        formData,
        {
          responseType: 'arraybuffer',
          headers: { ...formData.getHeaders() },
          timeout: 300000, // 5 minutes
        }
      );
      
      image = sharp(Buffer.from(aiResponse.data));
      console.log('✅ AI Microservice upscaling successful');
    } catch (aiError: any) {
      console.warn('⚠️ AI Microservice failed, falling back to sharp Lanczos3:', aiError.message);
      // Fallback: High-quality upscaling using Lanczos3
      image = image.resize({
        width: newWidth,
        height: newHeight,
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
      });
    }

    // Step 2: Apply detail enhancement using sharp's native fast filters
    if (options.sharpen) {
      image = image.sharpen({
        sigma: 1.0,
        m1: 1.5,
        m2: 2.5,
      });
    }

    if (options.denoise) {
      image = image.blur(0.5);
    }

    if (options.enhance) {
      image = image.modulate({
        brightness: 1.05,
        saturation: 1.1,
      });
      
      const contrastFactor = 1.2;
      image = image.linear(contrastFactor, -(128 * contrastFactor) + 128);
    }

    // Step 3: Convert back to buffer
    const resultBuffer = await image
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    console.log(`✅ Enhancement complete. Final size: ${(resultBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    return resultBuffer;
  } catch (error: any) {
    console.error('Real-ESRGAN enhancement error:', error.message);
    throw new Error('Failed to apply HD enhancement');
  }
};

// Professional sharpening, denoising and auto-enhancement are now handled by sharp's native filters
// within the main applyRealESRGANEnhancement function for maximum performance.

/**
 * Multi-step HD Enhancement Pipeline
 * Simulates Real-ESRGAN quality with traditional algorithms
 */
export const enhanceToHD = async (
  imageBuffer: Buffer,
  quality: 'standard' | 'hd' | 'ultra' = 'hd'
): Promise<Buffer> => {
  try {
    const options = {
      standard: { scale: 2, denoise: false, sharpen: true, enhance: true },
      hd: { scale: 2, denoise: true, sharpen: true, enhance: true },
      ultra: { scale: 4, denoise: true, sharpen: true, enhance: true },
    };

    return await applyRealESRGANEnhancement(imageBuffer, options[quality]);
  } catch (error: any) {
    console.error('HD enhancement error:', error.message);
    throw new Error('Failed to enhance image to HD');
  }
};

/**
 * Get recommended settings based on input image size
 */
export const getRecommendedSettings = (width: number, height: number) => {
  const megapixels = (width * height) / 1000000;

  if (megapixels < 1) {
    // Very small image - use 4x upscaling
    return { scale: 4, quality: 'ultra' as const };
  } else if (megapixels < 2) {
    // Small image - use 2x upscaling with full enhancement
    return { scale: 2, quality: 'ultra' as const };
  } else {
    // Already decent size - use 2x with HD quality
    return { scale: 2, quality: 'hd' as const };
  }
};

export default {
  applyRealESRGANEnhancement,
  enhanceToHD,
  getRecommendedSettings,
};
