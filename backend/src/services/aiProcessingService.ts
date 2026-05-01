import axios from 'axios';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * AI Processing Service
 * Communicates with Python AI microservice for advanced image processing
 * Uses rembg, OpenCV, and advanced algorithms (100% free, no API limits)
 */

/**
 * Remove background using AI service (rembg)
 */
export const removeBackgroundAI = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff'
): Promise<Buffer> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('bg_color', backgroundColor);

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/remove-background`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 300000, // 5 minutes
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('AI background removal error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to remove background using AI service');
  }
};

/**
 * Upscale image using AI service
 */
export const upscaleImageAI = async (
  imageBuffer: Buffer,
  scale: number = 2
): Promise<Buffer> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('scale', scale.toString());

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/upscale`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 300000, // 5 minutes
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('AI upscaling error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to upscale image using AI service');
  }
};

/**
 * Create professional passport photo using complete AI pipeline
 */
export const createPassportPhotoAI = async (
  imageBuffer: Buffer,
  countryCode: string,
  backgroundColor: string,
  enhance: boolean = true
): Promise<{
  image: Buffer;
  width: number;
  height: number;
  country: string;
  dpi: number;
}> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('country_code', countryCode);
    formData.append('bg_color', backgroundColor);
    formData.append('enhance', enhance.toString());

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/passport-photo`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 300000, // 5 minutes
      }
    );

    // Get metadata from response headers
    const width = parseInt(response.headers['x-width'] || '0');
    const height = parseInt(response.headers['x-height'] || '0');
    const country = response.headers['x-country'] || countryCode;
    const dpi = parseInt(response.headers['x-dpi'] || '300');

    return {
      image: Buffer.from(response.data),
      width,
      height,
      country,
      dpi,
    };
  } catch (error: any) {
    console.error('AI passport photo creation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to create passport photo using AI service');
  }
};

/**
 * Enhance image with manual adjustments
 */
export const enhanceImageAI = async (
  imageBuffer: Buffer,
  brightness: number = 0,
  contrast: number = 0,
  saturation: number = 0
): Promise<Buffer> => {
  try {
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('brightness', brightness.toString());
    formData.append('contrast', contrast.toString());
    formData.append('saturation', saturation.toString());

    const response = await axios.post(
      `${AI_SERVICE_URL}/api/ai/enhance`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 300000, // 5 minutes
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('AI enhancement error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Failed to enhance image using AI service');
  }
};

/**
 * Check if AI service is available
 */
export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('AI service health check failed:', error);
    return false;
  }
};

export default {
  removeBackgroundAI,
  upscaleImageAI,
  createPassportPhotoAI,
  enhanceImageAI,
  checkAIServiceHealth,
};
