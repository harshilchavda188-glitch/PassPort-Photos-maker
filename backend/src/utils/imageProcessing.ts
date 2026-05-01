// Utility functions for image processing

/**
 * Convert mm to pixels based on DPI
 */
export const mmToPixels = (mm: number, dpi: number = 300): number => {
  const inches = mm / 25.4;
  return Math.round(inches * dpi);
};

/**
 * Convert inches to pixels based on DPI
 */
export const inchesToPixels = (inches: number, dpi: number = 300): number => {
  return Math.round(inches * dpi);
};

/**
 * Calculate aspect ratio
 */
export const getAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * Validate image dimensions
 */
export const validateImageSize = (
  width: number,
  height: number,
  minPixels: number = 600,
  maxPixels: number = 4000
): boolean => {
  return (
    width >= minPixels &&
    height >= minPixels &&
    width <= maxPixels &&
    height <= maxPixels
  );
};

/**
 * Generate grid layout for photo sheet
 */
export const generateGridLayout = (
  copies: number,
  photoWidth: number,
  photoHeight: number,
  margin: number = 10
): { rows: number; cols: number; positions: Array<{ x: number; y: number }> } => {
  // Simple grid calculation
  const cols = Math.ceil(Math.sqrt(copies));
  const rows = Math.ceil(copies / cols);
  
  const positions: Array<{ x: number; y: number }> = [];
  
  for (let i = 0; i < copies; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: col * (photoWidth + margin) + margin,
      y: row * (photoHeight + margin) + margin,
    });
  }
  
  return { rows, cols, positions };
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url: string): string => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};
