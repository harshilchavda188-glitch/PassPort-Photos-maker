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
      `${API_URL}/api/hd-enhance`,
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
    const response = await axios.get(`${API_URL}/api/hd-enhance/recommend`, {
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
 */
export const autoEnhanceImage = (
  canvas: HTMLCanvasElement
): ImageData => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Step 1: Auto brightness and contrast
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    min = Math.min(min, brightness);
    max = Math.max(max, brightness);
  }

  // Enhance contrast (HD Quality)
  const range = max - min;
  const factor = range > 0 ? 255 / range : 1;

  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast enhancement
    data[i] = Math.min(255, Math.max(0, (data[i] - min) * factor));     // R
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - min) * factor)); // G
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - min) * factor)); // B
  }

  // Step 2: Increase saturation slightly for better colors
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert to HSL and increase saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    if (max !== min) {
      const s = l > 128 ? (max - min) / (510 - max - min) : (max - min) / (max + min);
      const saturationBoost = 1.2; // 20% boost
      const newS = Math.min(1, s * saturationBoost);
      
      // Convert back to RGB
      const hue = getHue(r, g, b, max, min);
      const rgb = hslToRgb(hue, newS, l / 255);
      
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
    }
  }

  // Step 3: Apply sharpening for HD quality
  sharpenImageData(data, canvas.width, canvas.height, 1.5);

  ctx.putImageData(imageData, 0, 0);
  return imageData;
};

// Helper: Get hue from RGB
function getHue(r: number, g: number, b: number, max: number, min: number): number {
  if (max === min) return 0;
  
  const d = max - min;
  let h = 0;
  
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  
  return h;
}

// Helper: Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

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
