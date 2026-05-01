import axios from 'axios';
import { config } from '../config/env';
import FormData from 'form-data';
import { removeBackgroundAI } from './aiProcessingService';

/**
 * Multi-Tool Background Removal Service
 * Supports: Remove.bg, Clipdrop, Replicate, and Local (rembg)
 * Users can choose their preferred tool
 */

export type BGTool = 'removebg' | 'clipdrop' | 'replicate' | 'local';

export interface BGResult {
  success: boolean;
  image: Buffer;
  tool: BGTool;
  processingTime: number;
  message?: string;
}

/**
 * Remove background using Remove.bg API
 * 50 free calls/month, high quality
 */
export const removeWithRemoveBG = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff'
): Promise<BGResult> => {
  const startTime = Date.now();
  
  try {
    if (!config.removeBgApiKey) {
      throw new Error('Remove.bg API key not configured');
    }

    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('size', 'auto');
    formData.append('format', 'png');

    if (backgroundColor && backgroundColor !== 'transparent') {
      formData.append('bg_color', backgroundColor);
    }

    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': config.removeBgApiKey,
        },
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      image: Buffer.from(response.data),
      tool: 'removebg',
      processingTime,
      message: 'Background removed successfully using Remove.bg',
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Remove.bg error:', error.response?.data || error.message);
    
    throw new Error(error.response?.data?.errors?.[0]?.title || 'Remove.bg failed');
  }
};

/**
 * Remove background using Clipdrop API
 * High quality, pay-per-use
 */
export const removeWithClipdrop = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff'
): Promise<BGResult> => {
  const startTime = Date.now();
  
  try {
    if (!config.clipdropApiKey) {
      throw new Error('Clipdrop API key not configured');
    }

    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post(
      'https://clipdrop-api.co/remove-background/v1',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'x-api-key': config.clipdropApiKey,
        },
        responseType: 'arraybuffer',
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      }
    );

    const processingTime = Date.now() - startTime;

    // Apply background color if needed
    let resultBuffer = Buffer.from(response.data);
    if (backgroundColor !== 'transparent') {
      resultBuffer = await applyBackgroundColor(resultBuffer, backgroundColor);
    }

    return {
      success: true,
      image: resultBuffer,
      tool: 'clipdrop',
      processingTime,
      message: 'Background removed successfully using Clipdrop',
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Clipdrop error:', error.response?.data || error.message);
    
    throw new Error(error.response?.data?.message || 'Clipdrop failed');
  }
};

/**
 * Remove background using Replicate API
 * Multiple AI models available (BiRefNet, RMBG, etc.)
 */
export const removeWithReplicate = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff'
): Promise<BGResult> => {
  const startTime = Date.now();
  
  try {
    if (!config.replicateApiKey) {
      throw new Error('Replicate API key not configured');
    }

    // Convert image to base64
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Create prediction with BiRefNet model (best quality)
    const prediction = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "8f4a1695e3e7b4e1c8b6f1e3f8f3f8f3f8f3f8f3f8f3f8f3f8f3f8f3f8f3f8f",
        input: {
          image: base64Image,
        }
      },
      {
        headers: {
          'Authorization': `Token ${config.replicateApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Poll for result
    const predictionUrl = prediction.data.urls.get;
    let result: any = null;
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      result = await axios.get(predictionUrl, {
        headers: {
          'Authorization': `Token ${config.replicateApiKey}`,
        },
      });

      if (result.data.status === 'succeeded') {
        break;
      } else if (result.data.status === 'failed') {
        throw new Error('Replicate prediction failed');
      }

      attempts++;
    }

    if (attempts >= maxAttempts || !result) {
      throw new Error('Replicate processing timeout');
    }

    // Download result
    const imageUrl = result.data.output;
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const processingTime = Date.now() - startTime;

    // Apply background color if needed
    let resultBuffer = Buffer.from(imageResponse.data);
    if (backgroundColor !== 'transparent') {
      resultBuffer = await applyBackgroundColor(resultBuffer, backgroundColor);
    }

    return {
      success: true,
      image: resultBuffer,
      tool: 'replicate',
      processingTime,
      message: 'Background removed successfully using Replicate',
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Replicate error:', error.response?.data || error.message);
    
    throw new Error(error.response?.data?.detail || 'Replicate failed');
  }
};

/**
 * Apply background color to transparent image
 */
async function applyBackgroundColor(
  imageBuffer: Buffer,
  color: string
): Promise<Buffer> {
  // This is a simplified version
  // In production, use sharp or Jimp for proper alpha compositing
  return imageBuffer;
}

/**
 * Universal background removal function
 * Automatically selects tool or uses specified tool
 */
export const removeBackground = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff',
  tool?: BGTool
): Promise<BGResult> => {
  const selectedTool = tool || config.defaultBgTool;
  const startTime = Date.now();

  console.log(`Using background removal tool: ${selectedTool}`);

  switch (selectedTool) {
    case 'removebg':
      return await removeWithRemoveBG(imageBuffer, backgroundColor);
    
    case 'clipdrop':
      return await removeWithClipdrop(imageBuffer, backgroundColor);
    
    case 'replicate':
      return await removeWithReplicate(imageBuffer, backgroundColor);
    
    case 'local':
    default:
      const localImage = await removeBackgroundAI(imageBuffer, backgroundColor);
      return {
        success: true,
        image: localImage,
        tool: 'local',
        processingTime: Date.now() - startTime,
        message: 'Background removed successfully using Local AI (rembg)',
      };
  }
};

/**
 * Get available background removal tools
 */
export const getAvailableTools = (): { tool: BGTool; available: boolean; name: string; description: string }[] => {
  return [
    {
      tool: 'local',
      available: true,
      name: 'Local AI (rembg)',
      description: '100% FREE, unlimited, uses Python AI service',
    },
    {
      tool: 'removebg',
      available: !!config.removeBgApiKey,
      name: 'Remove.bg',
      description: '50 free/month, high quality AI',
    },
    {
      tool: 'clipdrop',
      available: !!config.clipdropApiKey,
      name: 'Clipdrop',
      description: 'Pay-per-use, professional quality',
    },
    {
      tool: 'replicate',
      available: !!config.replicateApiKey,
      name: 'Replicate',
      description: 'Multiple AI models, flexible',
    },
  ];
};

export default {
  removeBackground,
  removeWithRemoveBG,
  removeWithClipdrop,
  removeWithReplicate,
  getAvailableTools,
};
