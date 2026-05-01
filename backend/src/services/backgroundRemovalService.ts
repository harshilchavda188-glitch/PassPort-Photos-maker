import aiProcessingService from './aiProcessingService';
import fs from 'fs';
import path from 'path';

/**
 * FREE Local Background Removal using rembg + FastAPI
 * Professional AI-powered (U2Net model)
 * UNLIMITED calls - 100% free, no API keys needed
 */

export const removeBackground = async (
  imageBuffer: Buffer,
  backgroundColor: string = '#ffffff',
  size: string = 'auto'
): Promise<Buffer> => {
  try {
    // Direct call to local FREE AI service
    return await aiProcessingService.removeBackgroundAI(imageBuffer, backgroundColor);
  } catch (error: any) {
    console.error('Local AI background removal error:', error.message);
    throw new Error(`Background removal failed: ${error.message}`);
  }
};

/**
 * Status for local AI service - UNLIMITED credits
 */
export const checkApiStatus = async (): Promise<{ remaining: number; total: number; service?: string }> => {
  return {
    remaining: Infinity,
    total: Infinity,
    service: 'Local rembg AI (unlimited)'
  };
};

/**
 * Batch processing
 */
export const removeBackgroundBatch = async (
  images: Buffer[],
  backgroundColor: string = '#ffffff'
): Promise<Buffer[]> => {
  const results: Buffer[] = [];
  
  for (const image of images) {
    try {
      const processed = await removeBackground(image, backgroundColor);
      results.push(processed);
    } catch (error) {
      console.error('Batch processing failed for image:', error);
      results.push(image);
    }
  }
  
  return results;
};

export default {
  removeBackground,
  checkApiStatus,
  removeBackgroundBatch,
};
