import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(__dirname, '../../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload file to local storage (100% FREE)
 */
export const uploadToLocal = async (
  fileBuffer: Buffer,
  originalName: string,
  folder: string = 'passport-photos'
): Promise<string> => {
  try {
    // Create folder if it doesn't exist
    const folderPath = path.join(UPLOAD_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(folderPath, fileName);

    // Save file
    fs.writeFileSync(filePath, fileBuffer);

    // Return file path
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error('Local upload error:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Delete file from local storage
 */
export const deleteFromLocal = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

/**
 * Get file from local storage
 */
export const getFileFromLocal = (filePath: string): Buffer | null => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    return null;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

export default {
  uploadToLocal,
  deleteFromLocal,
  getFileFromLocal,
};
