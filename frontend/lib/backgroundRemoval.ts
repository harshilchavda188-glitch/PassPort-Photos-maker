// Background Removal - Two Options:
// 1. Remove.bg API (Server-side) - 50 FREE calls/month, then paid
// 2. Client-side Canvas API - 100% FREE, unlimited

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Remove background using Remove.bg API (Server-side)
 * Higher quality, AI-powered, professional results
 * 50 FREE calls per month
 */
export const removeBackgroundWithAPI = async (
  imageFile: Blob,
  backgroundColor: string = '#ffffff',
  size: string = 'auto'
): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile, 'image.jpg');
    formData.append('bg_color', backgroundColor);
    formData.append('size', size);

    const response = await axios.post(
      `${API_URL}/background-removal/remove`,
      formData,
      {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Remove.bg API error:', error);
    const errorMsg = error.response?.data?.message || 'Failed to remove background using API';
    throw new Error(errorMsg);
  }
};

/**
 * Remove background using API with base64 (Alternative method)
 */
export const removeBackgroundWithAPIBase64 = async (
  imageBase64: string,
  backgroundColor: string = '#ffffff',
  size: string = 'auto'
): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_URL}/background-removal/remove-base64`,
      {
        image_base64: imageBase64,
        bg_color: backgroundColor,
        size: size,
      }
    );

    return response.data.data.image;
  } catch (error: any) {
    console.error('Remove.bg API error:', error);
    const errorMsg = error.response?.data?.message || 'Failed to remove background using API';
    throw new Error(errorMsg);
  }
};

/**
 * Check Remove.bg API status and remaining credits
 */
export const checkRemoveBgStatus = async (): Promise<{ remaining: number; total: number }> => {
  try {
    const response = await axios.get(`${API_URL}/background-removal/status`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error checking API status:', error);
    return { remaining: 0, total: 0 };
  }
};

/**
 * Remove background using Advanced Canvas API (FREE - Client-side)
 * 100% Free - No API key required!
 * Runs entirely in the browser - no server costs!
 */
export const removeBackgroundClientSide = async (
  imageFile: Blob
): Promise<Blob> => {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Load image
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Sample background color from corners (more accurate)
    const cornerSize = Math.min(width, height) * 0.1; // 10% of image
    let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
    
    // Sample from all 4 corners
    const corners = [
      { x: 0, y: 0 },
      { x: width - cornerSize, y: 0 },
      { x: 0, y: height - cornerSize },
      { x: width - cornerSize, y: height - cornerSize }
    ];

    for (const corner of corners) {
      for (let y = corner.y; y < corner.y + cornerSize; y++) {
        for (let x = corner.x; x < corner.x + cornerSize; x++) {
          const i = (y * width + x) * 4;
          bgR += data[i];
          bgG += data[i + 1];
          bgB += data[i + 2];
          bgCount++;
        }
      }
    }

    bgR = Math.round(bgR / bgCount);
    bgG = Math.round(bgG / bgCount);
    bgB = Math.round(bgB / bgCount);

    console.log('Detected background color:', `RGB(${bgR}, ${bgG}, ${bgB})`);

    // Advanced background removal with color distance
    const threshold = 60; // Color distance threshold
    const softness = 20; // Edge softness for smoother edges

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );

        // Smooth transition (anti-aliasing)
        if (distance < threshold) {
          // Background - make transparent
          data[i + 3] = 0;
        } else if (distance < threshold + softness) {
          // Edge - partial transparency (smoother edges)
          const alpha = ((distance - threshold) / softness) * 255;
          data[i + 3] = Math.round(alpha);
        }
        // else: Keep pixel fully visible
      }
    }

    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  } catch (error: any) {
    console.error('Background removal error:', error);
    throw new Error('Failed to remove background');
  }
};

export default {
  removeBackgroundClientSide,
  removeBackgroundWithAPI,
  removeBackgroundWithAPIBase64,
  checkRemoveBgStatus,
};

/**
 * Remove blur and enhance clarity (Anti-Blur)
 * Uses unsharp masking technique for professional results
 */
export const removeBlurAndSharpen = async (
  imageFile: Blob,
  sharpenAmount: number = 2.0
): Promise<Blob> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    // Advanced sharpening using unsharp mask
    // Create blurred version
    const blurredData = new Uint8ClampedArray(data);
    applyGaussianBlur(blurredData, width, height, 1.5);

    // Apply unsharp mask: sharpened = original + amount * (original - blurred)
    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const original = data[i + c];
        const blurred = blurredData[i + c];
        const sharpened = original + sharpenAmount * (original - blurred);
        data[i + c] = Math.min(255, Math.max(0, sharpened));
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  } catch (error: any) {
    console.error('Sharpening error:', error);
    throw new Error('Failed to remove blur');
  }
};

// Helper: Apply Gaussian blur
function applyGaussianBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): void {
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = Math.ceil(radius * 2) + 1;
  const kernel: number[] = [];
  
  // Create Gaussian kernel
  const sigma = radius / 2;
  let sum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - Math.floor(kernelSize / 2);
    const weight = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel.push(weight);
    sum += weight;
  }
  
  // Normalize kernel
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }
  
  // Apply horizontal blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let k = 0; k < kernelSize; k++) {
        const px = Math.min(width - 1, Math.max(0, x + k - Math.floor(kernelSize / 2)));
        const idx = (y * width + px) * 4;
        r += tempData[idx] * kernel[k];
        g += tempData[idx + 1] * kernel[k];
        b += tempData[idx + 2] * kernel[k];
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }
  
  // Copy for vertical pass
  tempData.set(data);
  
  // Apply vertical blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let k = 0; k < kernelSize; k++) {
        const py = Math.min(height - 1, Math.max(0, y + k - Math.floor(kernelSize / 2)));
        const idx = (py * width + x) * 4;
        r += tempData[idx] * kernel[k];
        g += tempData[idx + 1] * kernel[k];
        b += tempData[idx + 2] * kernel[k];
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }
}
