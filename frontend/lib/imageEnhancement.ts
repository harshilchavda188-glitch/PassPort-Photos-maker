import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Real-ESRGAN Style HD Enhancement (Server-side API)
 * Professional AI-powered super resolution
 * 2x or 4x upscaling with detail enhancement
 */
export const enhanceImageWithRealESRGAN = async (
  imageFile: Blob,
  quality: 'standard' | 'hd' | 'ultra' = 'hd'
): Promise<Blob> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile, 'image.jpg');
    formData.append('quality', quality);

    const response = await axios.post(
      `${API_URL}/hd-enhance`,
      formData,
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // 3 minutes
      }
    );

    return new Blob([response.data], { type: 'image/jpeg' });
  } catch (error: any) {
    console.error('Real-ESRGAN enhancement error:', error);
    const errorMsg = error.response?.data?.message || 'Failed to enhance image with Real-ESRGAN';
    throw new Error(errorMsg);
  }
};

/**
 * Get recommended enhancement settings
 */
export const getEnhancementRecommendations = async (
  width: number,
  height: number
): Promise<{ scale: number; quality: string }> => {
  try {
    const response = await axios.get(`${API_URL}/hd-enhance/recommend`, {
      params: { width, height },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return { scale: 2, quality: 'hd' };
  }
};

/**
 * FREE Image Enhancement using Canvas API
 * 100% Free - No external services needed!
 * HD Quality improvement with multiple enhancement techniques
 */

/**
 * Auto-enhance image (brightness, contrast, sharpness, saturation)
 * HD Quality mode for professional results
 * Optimized: single merged pass for contrast + saturation
 */
export const autoEnhanceImage = (
  canvas: HTMLCanvasElement
): ImageData => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const len = data.length;

  // Pass 1: Find min/max brightness for contrast stretching
  let min = 255, max = 0;
  for (let i = 0; i < len; i += 4) {
    const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (b < min) min = b;
    if (b > max) max = b;
  }

  const range = max - min;
  const contrastFactor = range > 0 ? 255 / range : 1;

  // Pass 2: Contrast + saturation in a single loop (faster than 3 separate passes)
  // Uses luminance-based saturation instead of full HSL conversion
  for (let i = 0; i < len; i += 4) {
    // Contrast stretch
    data[i] = Math.min(255, Math.max(0, (data[i] - min) * contrastFactor));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - min) * contrastFactor));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - min) * contrastFactor));

    // Saturation boost (luminance approximation, ~10x faster than HSL conversion)
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const satBoost = 1.2;
    data[i] = Math.min(255, Math.max(0, gray + satBoost * (r - gray)));
    data[i + 1] = Math.min(255, Math.max(0, gray + satBoost * (g - gray)));
    data[i + 2] = Math.min(255, Math.max(0, gray + satBoost * (b - gray)));
  }

  ctx.putImageData(imageData, 0, 0);
  return imageData;
};

// Helper: Sharpen image data directly
function sharpenImageData(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
  // Laplacian sharpening kernel that preserves brightness (sum = 1)
  const a = amount - 1;
  const kernel = [
    0, -a, 0,
    -a, 1 + 4 * a, -a,
    0, -a, 0
  ];

  const tempData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c;
            sum += tempData[idx] * kernel[ki++];
          }
        }

        const idx = (y * width + x) * 4 + c;
        data[idx] = Math.min(255, Math.max(0, sum));
      }
    }
  }
}

/**
 * Adjust brightness
 */
export const adjustBrightness = (
  canvas: HTMLCanvasElement,
  amount: number // -100 to 100
): ImageData => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + amount));     // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + amount)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + amount)); // B
  }

  ctx.putImageData(imageData, 0, 0);
  return imageData;
};

/**
 * Adjust contrast
 */
export const adjustContrast = (
  canvas: HTMLCanvasElement,
  amount: number // -100 to 100
): ImageData => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));     // R
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // G
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // B
  }

  ctx.putImageData(imageData, 0, 0);
  return imageData;
};

/**
 * Sharpen image
 */
export const sharpenImage = (
  canvas: HTMLCanvasElement,
  amount: number = 1.5
): void => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  sharpenImageData(data, width, height, amount);
  ctx.putImageData(imageData, 0, 0);
};

export default {
  enhanceImageWithRealESRGAN,
  getEnhancementRecommendations,
  autoEnhanceImage,
  adjustBrightness,
  adjustContrast,
  sharpenImage,
};
