// DEPRECATED: Cloudinary is optional (has paid plans)
// Using LOCAL STORAGE instead (100% FREE)
// See: localStorageService.ts for the FREE alternative

// This file is kept for reference only
// To use Cloudinary (optional), uncomment and add API keys to .env

/*
import cloudinary from 'cloudinary';
import { config } from '../config/env';

// Configure Cloudinary (OPTIONAL - Not required)
cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'passport-photos'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};
*/

// Using LOCAL STORAGE (100% FREE - No API key needed)
export { uploadToLocal as uploadToCloudinary } from './localStorageService';
export { deleteFromLocal as deleteFromCloudinary } from './localStorageService';
