/**
 * FREE Face Detection using Canvas API (Simple & Reliable)
 * 100% Free - Runs entirely in browser!
 * No external dependencies needed
 */

/**
 * Simple face detection (center-based approximation)
 * For production, you can integrate a proper ML model later
 */
export const detectFace = async (
  imageElement: HTMLImageElement
): Promise<{ x: number; y: number; width: number; height: number } | null> => {
  try {
    // Create canvas to analyze image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return null;

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple skin color detection algorithm
    // Skin pixels typically have RGB values in certain ranges
    let skinPixelCount = 0;
    let skinCenterX = 0;
    let skinCenterY = 0;

    for (let y = 0; y < canvas.height; y += 4) { // Skip pixels for performance
      for (let x = 0; x < canvas.width; x += 4) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple skin color detection
        const isSkin = 
          r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) > 15 &&
          Math.abs(r - g) > 15 &&
          r - b > 15;

        if (isSkin) {
          skinPixelCount++;
          skinCenterX += x;
          skinCenterY += y;
        }
      }
    }

    if (skinPixelCount < 100) {
      // Not enough skin pixels detected, return center
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: canvas.width * 0.6,
        height: canvas.height * 0.7,
      };
    }

    // Calculate center of detected skin region
    skinCenterX /= skinPixelCount;
    skinCenterY /= skinPixelCount;

    // Estimate face size (roughly 40% of image width)
    const faceWidth = canvas.width * 0.4;
    const faceHeight = canvas.height * 0.5;

    return {
      x: skinCenterX,
      y: skinCenterY,
      width: faceWidth,
      height: faceHeight,
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};

/**
 * Load face detection models (no-op for Canvas API)
 */
export const loadFaceDetectionModels = async (): Promise<void> => {
  // No models needed for Canvas API approach
  console.log('Face detection ready (Canvas API)');
  return Promise.resolve();
};

/**
 * Get face center coordinates
 */
export const getFaceCenter = (
  detection: { x: number; y: number; width: number; height: number }
): { x: number; y: number } => {
  return {
    x: detection.x,
    y: detection.y,
  };
};

/**
 * Auto-crop image to passport size with face centering
 */
export const autoCropToPassport = async (
  imageElement: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): Promise<ImageData | null> => {
  const detection = await detectFace(imageElement);
  
  if (!detection) {
    console.warn('No face detected, using center crop');
    return null;
  }

  const faceCenter = getFaceCenter(detection);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) return null;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Calculate crop area centered on face
  const sourceX = Math.max(0, faceCenter.x - targetWidth / 2);
  const sourceY = Math.max(0, faceCenter.y - targetHeight / 2);
  const sourceWidth = Math.min(targetWidth, imageElement.width - sourceX);
  const sourceHeight = Math.min(targetHeight, imageElement.height - sourceY);

  // Draw cropped image
  ctx.drawImage(
    imageElement,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return ctx.getImageData(0, 0, targetWidth, targetHeight);
};

export default {
  loadFaceDetectionModels,
  detectFace,
  getFaceCenter,
  autoCropToPassport,
};
