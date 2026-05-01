'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { removeBackgroundClientSide, removeBlurAndSharpen } from '@/lib/backgroundRemoval';
import { detectFace, loadFaceDetectionModels } from '@/lib/faceDetection';
import { autoEnhanceImage, enhanceImageWithRealESRGAN } from '@/lib/imageEnhancement';
import { passportSizes, PassportSize, getDimensions } from '@/lib/passportSizes';
import axios from 'axios';

// Helper: Apply Gaussian blur for HD sharpening
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

// Helper: Apply edge enhancement for photo clarity
function applyEdgeEnhancement(data: Uint8ClampedArray, width: number, height: number, amount: number): void {
  const tempData = new Uint8ClampedArray(data);
  
  // Edge enhancement kernel (Laplacian) that preserves brightness (sum = 1)
  const a = amount - 1;
  const kernel = [
    0, -a, 0,
    -a, 1 + 4 * a, -a,
    0, -a, 0
  ];
  
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

// Helper: Apply local contrast enhancement
function applyLocalContrast(data: Uint8ClampedArray, width: number, height: number, factor: number): void {
  // Simple local contrast: enhance differences from local average
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let y = halfWindow; y < height - halfWindow; y++) {
    for (let x = halfWindow; x < width - halfWindow; x++) {
      for (let c = 0; c < 3; c++) {
        // Calculate local average
        let localSum = 0;
        let count = 0;
        
        for (let dy = -halfWindow; dy <= halfWindow; dy++) {
          for (let dx = -halfWindow; dx <= halfWindow; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4 + c;
            localSum += data[idx];
            count++;
          }
        }
        
        const localAvg = localSum / count;
        const idx = (y * width + x) * 4 + c;
        
        // Enhance contrast: pixel = average + factor * (pixel - average)
        const enhanced = localAvg + factor * (data[idx] - localAvg);
        data[idx] = Math.min(255, Math.max(0, enhanced));
      }
    }
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
const FLASK_BG_SERVICE_URL = process.env.NEXT_PUBLIC_FLASK_BG_SERVICE_URL || 'http://localhost:5003';

function EditorContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'passport'; // 'passport' or 'hd'
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<PassportSize | null>(null);
  
  // Feature states
  const [qualityMode, setQualityMode] = useState<'standard' | 'hd' | 'ultra'>('hd');
  const [removeBackground, setRemoveBackground] = useState(mode === 'passport');
  const [antiBlur, setAntiBlur] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showBgOptions, setShowBgOptions] = useState(false);
  const [photoCount, setPhotoCount] = useState<number>(6); // Number of photos per sheet
  const [bgRemovalTool, setBgRemovalTool] = useState<'local' | 'removebg' | 'clipdrop' | 'replicate'>('local');
  
  // Background color presets
  const bgColors = [
    { name: 'White', value: '#ffffff', category: 'standard' },
    { name: 'Black', value: '#000000', category: 'standard' },
    { name: 'Light Blue', value: '#4A90E2', category: 'passport' },
    { name: 'Navy Blue', value: '#1E3A8A', category: 'passport' },
    { name: 'Royal Blue', value: '#2563EB', category: 'passport' },
    { name: 'Red', value: '#DC2626', category: 'passport' },
    { name: 'Dark Red', value: '#991B1B', category: 'passport' },
    { name: 'Light Gray', value: '#D1D5DB', category: 'neutral' },
    { name: 'Gray', value: '#6B7280', category: 'neutral' },
    { name: 'Dark Gray', value: '#374151', category: 'neutral' },
    { name: 'Cream', value: '#FEF3C7', category: 'neutral' },
    { name: 'Beige', value: '#F5F5DC', category: 'neutral' },
    { name: 'Light Pink', value: '#FCE7F3', category: 'custom' },
    { name: 'Light Green', value: '#D1FAE5', category: 'custom' },
    { name: 'Transparent', value: 'transparent', category: 'special' },
  ];
  
  // Custom dimensions state
  const [useCustomDimensions, setUseCustomDimensions] = useState(false);
  const [customWidth, setCustomWidth] = useState(35); // mm
  const [customHeight, setCustomHeight] = useState(45); // mm
  const [customDPI, setCustomDPI] = useState(300);
  
  // Crop state
  const [showCropTool, setShowCropTool] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isCropping, setIsCropping] = useState(false);
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFaceDetectionModels();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      let currentImage = image;

      // ==========================================
      // FEATURE 1: BACKGROUND REMOVAL (Enhanced)
      // ==========================================
      if (removeBackground) {
        setProcessingStep('🎨 Removing background with AI...');
        try {
          const blob = await fetch(image).then((r) => r.blob());
          const formData = new FormData();
          formData.append('image', blob, 'photo.jpg');
          formData.append('bg_color', backgroundColor);
          formData.append('tool', 'local'); // Default to free local tool

          const response = await axios.post(`${API_URL}/api/background-removal/remove`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: 'blob',
          });

          const processedBlob = new Blob([response.data], { type: 'image/png' });
          currentImage = URL.createObjectURL(processedBlob);
          console.log('✅ Background removal successful');
        } catch (err) {
          console.warn('❌ Backend BG removal failed, using client-side fallback:', err);
          const blob = await fetch(image).then((r) => r.blob());
          const removedBg = await removeBackgroundClientSide(blob);
          currentImage = URL.createObjectURL(removedBg);
        }
      }

      // ==========================================
      // FEATURE 2: HD PHOTO QUALITY ENHANCEMENT
      // ==========================================
      setProcessingStep('✨ Enhancing photo quality to HD...');
      
      // Apply HD upscaling and AI enhancement
      let aiEnhanced = false;
      if (qualityMode === 'hd' || qualityMode === 'ultra') {
        try {
          setProcessingStep(`🚀 AI ${qualityMode.toUpperCase()} Enhancement in progress...`);
          const blob = await fetch(currentImage).then(r => r.blob());
          const enhancedBlob = await enhanceImageWithRealESRGAN(blob, qualityMode);
          currentImage = URL.createObjectURL(enhancedBlob);
          aiEnhanced = true;
          console.log('✅ Backend AI enhancement successful');
        } catch (error) {
          console.error('AI Enhancement failed, falling back to client-side:', error);
          // Fallback to client-side scaling if backend fails
        }
      }

      // Load image into canvas for final processing/sizing
      const imgElement = new Image();
      imgElement.src = currentImage;
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });

      // Create canvas for final output
      const canvas = document.createElement('canvas');
      
      // If we already enhanced via backend, scale is 1 (image is already upsized)
      // Otherwise, we do client-side scaling
      let scale = 1;
      
      if (!aiEnhanced) {
        if (qualityMode === 'hd') scale = 2;
        if (qualityMode === 'ultra') scale = 4;
        
        // Safety limit: Don't exceed 8000px in any dimension
        const maxDim = 8000;
        if (imgElement.width * scale > maxDim || imgElement.height * scale > maxDim) {
          scale = Math.min(maxDim / imgElement.width, maxDim / imgElement.height);
          console.log(`⚠️ Scaling limited to ${scale.toFixed(2)}x to prevent memory error`);
        }
      }
      
      canvas.width = Math.floor(imgElement.width * scale);
      canvas.height = Math.floor(imgElement.height * scale);
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      
      // High-quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
      
      // ==========================================
      // STEP 1: REMOVE BLUR & SHARPEN (Anti-Blur)
      // ==========================================
      if (antiBlur) {
        setProcessingStep('🔧 Removing blur & sharpening image...');
        
        // Get image data for blur removal
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Apply advanced deblurring based on quality mode
        const sharpenStrength = qualityMode === 'ultra' ? 1.8 : qualityMode === 'hd' ? 1.5 : 1.2;
        
        // Multi-pass sharpening for maximum clarity
        for (let pass = 0; pass < (qualityMode === 'ultra' ? 2 : 1); pass++) {
          // Create blurred version for unsharp masking
          const blurredData = new Uint8ClampedArray(data);
          applyGaussianBlur(blurredData, width, height, 0.8);
          
          // Apply sharpening: sharpened = original + amount * (original - blurred)
          for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
              const original = data[i + c];
              const blurred = blurredData[i + c];
              const sharpened = original + sharpenStrength * (original - blurred);
              data[i + c] = Math.min(255, Math.max(0, sharpened));
            }
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        console.log(`✅ Blur removal complete (${sharpenStrength}x sharpening)`);
      }
      
      // ==========================================
      // STEP 2: HD ENHANCEMENT (Brightness, Contrast, Saturation)
      // ==========================================
      setProcessingStep('🎨 Applying HD enhancement...');
      
      // Apply HD enhancement (brightness, contrast, saturation, sharpening)
      autoEnhanceImage(canvas);
      
      // ==========================================
      // STEP 3: ADDITIONAL CLARITY BOOST
      // ==========================================
      if (antiBlur) {
        setProcessingStep('💎 Boosting photo clarity...');
        
        // Get image data again after auto-enhance
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // Apply edge enhancement for passport photo clarity
        applyEdgeEnhancement(data, width, height, 1.2);
        
        // Increase local contrast for better face details
        applyLocalContrast(data, width, height, 1.1);
        
        ctx.putImageData(imageData, 0, 0);
        console.log('✅ Clarity boost applied');
      }
      
      // Apply background color if needed
      if (removeBackground && backgroundColor !== 'transparent') {
        setProcessingStep('🎨 Applying background color...');
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
        
        // Fill with background color
        tempCtx.fillStyle = backgroundColor;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw processed image on top
        tempCtx.drawImage(canvas, 0, 0);
        
        // Replace canvas content
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }

      // Final HD output
      const enhancedUrl = canvas.toDataURL('image/png', 1.0);
      setProcessedImage(enhancedUrl);
      setProcessingStep('✅ Clear HD Photo Ready!');
      console.log(`✅ HD Enhancement complete: ${canvas.width}x${canvas.height}px (${qualityMode.toUpperCase()})`);
      console.log('✅ Photo is now sharp and clear!');
    } catch (error) {
      console.error('Processing error:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (format: 'png' | 'jpg' | 'pdf') => {
    if (!processedImage && !image) return;

    const downloadUrl = processedImage || image!;
    const link = document.createElement('a');
    link.href = downloadUrl;

    if (format === 'pdf') {
      import('jspdf').then(({ jsPDF }) => {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        
        const dims = getCurrentDimensions();
        const img = new Image();
        img.src = downloadUrl;
        img.onload = () => {
          // Center the photo on A4
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const x = (pageWidth - dims.width) / 2;
          const y = (pageHeight - dims.height) / 2;
          
          doc.addImage(img, 'JPEG', x, y, dims.width, dims.height);
          doc.save(`passport-photo-${dims.width}x${dims.height}.pdf`);
        };
      });
      return;
    }

    // Get current dimensions for filename
    const dims = getCurrentDimensions();
    const dimString = `${dims.width}x${dims.height}${dims.unit}`;
    
    link.download = `passport-photo-${dimString}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate a sheet with multiple passport photos
  const generatePhotoSheet = async () => {
    if (!processedImage && !image) return;

    try {
      setLoading(true);
      setProcessingStep('Generating photo sheet...');

      const sourceImage = processedImage || image!;
      const img = new Image();
      img.src = sourceImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Get dimensions based on selected country or default
      let photoWidth = 200; // Default width in pixels
      let photoHeight = 250; // Default height in pixels

      if (selectedCountry) {
        // Convert mm/inch to pixels (assuming 300 DPI for print quality)
        const dpi = 300;
        if (selectedCountry.unit === 'mm') {
          photoWidth = Math.round((selectedCountry.width / 25.4) * dpi);
          photoHeight = Math.round((selectedCountry.height / 25.4) * dpi);
        } else {
          photoWidth = Math.round(selectedCountry.width * dpi);
          photoHeight = Math.round(selectedCountry.height * dpi);
        }
      }

      // Calculate grid layout
      const cols = photoCount <= 4 ? 2 : photoCount <= 9 ? 3 : 4;
      const rows = Math.ceil(photoCount / cols);
      
      // Sheet dimensions (with margins)
      const margin = 50;
      const gap = 20;
      const sheetWidth = margin * 2 + cols * photoWidth + (cols - 1) * gap;
      const sheetHeight = margin * 2 + rows * photoHeight + (rows - 1) * gap;

      // Create sheet canvas
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = sheetWidth;
      sheetCanvas.height = sheetHeight;
      const sheetCtx = sheetCanvas.getContext('2d', { willReadFrequently: true })!;

      // Fill white background
      sheetCtx.fillStyle = '#ffffff';
      sheetCtx.fillRect(0, 0, sheetWidth, sheetHeight);

      // Place photos in grid
      for (let i = 0; i < photoCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = margin + col * (photoWidth + gap);
        const y = margin + row * (photoHeight + gap);

        // Draw photo
        sheetCtx.drawImage(img, x, y, photoWidth, photoHeight);

        // Add border
        sheetCtx.strokeStyle = '#e0e0e0';
        sheetCtx.lineWidth = 1;
        sheetCtx.strokeRect(x, y, photoWidth, photoHeight);
      }

      // Convert to download URL
      const sheetUrl = sheetCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = sheetUrl;
      link.download = `passport-photos-${photoCount}-sheet.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProcessingStep('Sheet downloaded!');
    } catch (error) {
      console.error('Sheet generation error:', error);
      alert('Failed to generate photo sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Crop image function
  const cropImage = () => {
    if (!image) return;

    const imgElement = new Image();
    imgElement.src = image;
    imgElement.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

      // Calculate crop coordinates (percentage to pixels)
      const cropX = (cropArea.x / 100) * imgElement.width;
      const cropY = (cropArea.y / 100) * imgElement.height;
      const cropW = (cropArea.width / 100) * imgElement.width;
      const cropH = (cropArea.height / 100) * imgElement.height;

      canvas.width = cropW;
      canvas.height = cropH;

      ctx.drawImage(imgElement, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const croppedUrl = canvas.toDataURL('image/png');
      setImage(croppedUrl);
      setProcessedImage(null);
      setShowCropTool(false);
    };
  };

  // Get current dimensions (custom or preset)
  const getCurrentDimensions = () => {
    if (useCustomDimensions) {
      return {
        width: customWidth,
        height: customHeight,
        dpi: customDPI,
        unit: 'mm' as const,
      };
    }
    return selectedCountry || passportSizes[0];
  };

  // Reset crop area
  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PhotoAI Pro - Editor
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Choose your tool and start creating professional photos
        </p>

        {/* Tool Selector */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tool 1: Passport Photo Maker */}
            <a
              href="/editor?mode=passport"
              className={`block p-6 rounded-2xl border-2 transition-all hover:shadow-xl ${
                mode === 'passport'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📷</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Passport Photo Maker
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Create perfect passport, visa, and ID photos for 50+ countries
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>✓ AI Background Removal</li>
                    <li>✓ 50+ Country Standards</li>
                    <li>✓ Multi-Photo Sheets (2,4,6,8,10)</li>
                  </ul>
                </div>
              </div>
            </a>

            {/* Tool 2: Simple Passport Maker */}
            <a
              href="/simple-passport"
              className="block p-6 rounded-2xl border-2 border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 hover:shadow-xl transition-all hover:border-cyan-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Simple Passport Maker
                    </h3>
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                      FAST
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Quick & easy! Upload JPG, auto blue background in 3-5 seconds
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>✓ Super Fast (3-5 seconds)</li>
                    <li>✓ Auto Blue Background</li>
                    <li>✓ 600x600px Output</li>
                  </ul>
                </div>
              </div>
            </a>

            {/* Tool 3: HD Photo Enhancer */}
            <a
              href="/editor?mode=hd"
              className={`block p-6 rounded-2xl border-2 transition-all hover:shadow-xl ${
                mode === 'hd'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-purple-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    HD Photo Enhancer
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Enhance any photo to HD quality with AI sharpening
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <li>✓ Remove Blur & Sharpen</li>
                    <li>✓ Auto Brightness & Contrast</li>
                    <li>✓ HD Quality Enhancement</li>
                  </ul>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload Photo</h2>

            {!image ? (
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  Click to upload your photo
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <img src={image} alt="Original" className="w-full rounded-lg shadow-md" />
                <Button
                  onClick={() => {
                    setImage(null);
                    setProcessedImage(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Change Photo
                </Button>
              </div>
            )}

            {image && (
              <div className="mt-6 space-y-4">
                {/* Quality Selection */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Quality Mode</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setQualityMode('standard')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        qualityMode === 'standard'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">Standard</div>
                      <div className="text-xs text-gray-500">Fast</div>
                    </button>
                    <button
                      onClick={() => setQualityMode('hd')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        qualityMode === 'hd'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">HD</div>
                      <div className="text-xs text-gray-500">Recommended</div>
                    </button>
                    <button
                      onClick={() => setQualityMode('ultra')}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        qualityMode === 'ultra'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-sm font-semibold">Ultra HD</div>
                      <div className="text-xs text-gray-500">Best</div>
                    </button>
                  </div>
                </div>

                {/* Passport Dimensions Control */}
                {mode === 'passport' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Photo Dimensions</h3>
                    
                    {/* Auto/Manual Toggle */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setUseCustomDimensions(false)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          !useCustomDimensions
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Auto (Country)
                      </button>
                      <button
                        onClick={() => setUseCustomDimensions(true)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          useCustomDimensions
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        Manual
                      </button>
                    </div>

                    {/* Auto Mode - Country Selection */}
                    {!useCustomDimensions && (
                      <select
                        value={selectedCountry?.countryCode || ''}
                        onChange={(e) => {
                          const country = passportSizes.find(p => p.countryCode === e.target.value);
                          setSelectedCountry(country || null);
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:border-blue-500 focus:outline-none"
                      >
                        {passportSizes.map((size) => (
                          <option key={size.countryCode} value={size.countryCode}>
                            {size.country} - {size.width}x{size.height}{size.unit}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Manual Mode - Custom Dimensions */}
                    {useCustomDimensions && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Width (mm)</label>
                            <input
                              type="number"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(Number(e.target.value))}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                              min="10"
                              max="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Height (mm)</label>
                            <input
                              type="number"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(Number(e.target.value))}
                              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                              min="10"
                              max="100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">DPI</label>
                          <select
                            value={customDPI}
                            onChange={(e) => setCustomDPI(Number(e.target.value))}
                            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
                          >
                            <option value={150}>150 DPI (Draft)</option>
                            <option value={300}>300 DPI (Standard)</option>
                            <option value={600}>600 DPI (High Quality)</option>
                          </select>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Output: {Math.round((customWidth / 25.4) * customDPI)} x {Math.round((customHeight / 25.4) * customDPI)} pixels
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Crop Tool Toggle */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Crop Photo</h3>
                  <button
                    onClick={() => setShowCropTool(!showCropTool)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                  >
                    {showCropTool ? 'Hide Crop Tool' : 'Show Crop Tool'}
                  </button>
                  
                  {/* Crop Controls */}
                  {showCropTool && (
                    <div className="mt-3 space-y-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium mb-1">X Position: {cropArea.x}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cropArea.x}
                          onChange={(e) => setCropArea({...cropArea, x: Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Y Position: {cropArea.y}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={cropArea.y}
                          onChange={(e) => setCropArea({...cropArea, y: Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Width: {cropArea.width}%</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={cropArea.width}
                          onChange={(e) => setCropArea({...cropArea, width: Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Height: {cropArea.height}%</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={cropArea.height}
                          onChange={(e) => setCropArea({...cropArea, height: Number(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={cropImage}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          Apply Crop
                        </button>
                        <button
                          onClick={resetCrop}
                          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Removal Toggle */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Background Removal</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-14 h-8 rounded-full transition-colors ${
                          removeBackground ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          removeBackground ? 'transform translate-x-6' : ''
                        }`}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium">
                      {removeBackground ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {/* Anti-Blur Toggle */}
                <div>
                  <h3 className="text-xl font-semibold mb-2">Anti-Blur / Sharpen</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={antiBlur}
                        onChange={(e) => setAntiBlur(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-14 h-8 rounded-full transition-colors ${
                          antiBlur ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      ></div>
                      <div
                        className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          antiBlur ? 'transform translate-x-6' : ''
                        }`}
                      ></div>
                    </div>
                    <span className="ml-3 text-sm font-medium">
                      {antiBlur ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Removes blur and enhances photo clarity
                  </p>
                </div>

                {/* Background Color Picker */}
                {removeBackground && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Background Color</h3>
                    
                    {/* Color Categories */}
                    <div className="space-y-4">
                      {/* Standard Colors */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Standard</p>
                        <div className="grid grid-cols-5 gap-2">
                          {bgColors.filter(c => c.category === 'standard').map((bg) => (
                            <button
                              key={bg.value}
                              onClick={() => setBackgroundColor(bg.value)}
                              className={`group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                backgroundColor === bg.value
                                  ? 'border-blue-600 ring-2 ring-blue-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                              style={{ backgroundColor: bg.value === 'transparent' ? 'transparent' : bg.value }}
                              title={bg.name}
                            >
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded">
                                {bg.name}
                              </span>
                              {bg.value === 'transparent' && (
                                <div className="w-full h-full flex items-center justify-center text-lg">
                                  ∅
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Passport Colors */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Passport Official</p>
                        <div className="grid grid-cols-5 gap-2">
                          {bgColors.filter(c => c.category === 'passport').map((bg) => (
                            <button
                              key={bg.value}
                              onClick={() => setBackgroundColor(bg.value)}
                              className={`group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                backgroundColor === bg.value
                                  ? 'border-blue-600 ring-2 ring-blue-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                              style={{ backgroundColor: bg.value }}
                              title={bg.name}
                            >
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded">
                                {bg.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Neutral Colors */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Neutral</p>
                        <div className="grid grid-cols-5 gap-2">
                          {bgColors.filter(c => c.category === 'neutral').map((bg) => (
                            <button
                              key={bg.value}
                              onClick={() => setBackgroundColor(bg.value)}
                              className={`group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                backgroundColor === bg.value
                                  ? 'border-blue-600 ring-2 ring-blue-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                              style={{ backgroundColor: bg.value }}
                              title={bg.name}
                            >
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded">
                                {bg.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Colors */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Custom & Special</p>
                        <div className="grid grid-cols-5 gap-2">
                          {bgColors.filter(c => c.category === 'custom' || c.category === 'special').map((bg) => (
                            <button
                              key={bg.value}
                              onClick={() => setBackgroundColor(bg.value)}
                              className={`group relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                                backgroundColor === bg.value
                                  ? 'border-blue-600 ring-2 ring-blue-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              } ${bg.value === 'transparent' ? 'border-dashed' : ''}`}
                              style={{ backgroundColor: bg.value === 'transparent' ? 'transparent' : bg.value }}
                              title={bg.name}
                            >
                              <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded">
                                {bg.name}
                              </span>
                              {bg.value === 'transparent' && (
                                <div className="w-full h-full flex items-center justify-center text-lg">
                                  ∅
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Input */}
                      <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                        <p className="text-sm font-medium mb-2">Custom Color</p>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-white dark:bg-gray-700"
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>

                      {/* Current Color Display */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{bgColors.find(c => c.value === backgroundColor)?.name || 'Custom'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{backgroundColor}</p>
                          </div>
                          {backgroundColor === 'transparent' && (
                            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              Transparent
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Country Standards - Only for Passport Mode */}
                {mode === 'passport' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Country Standards</h3>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                      value={selectedCountry?.countryCode || ''}
                      onChange={(e) => {
                        const country = passportSizes.find((c) => c.countryCode === e.target.value);
                        setSelectedCountry(country || null);
                      }}
                    >
                      <option value="">Select Country</option>
                      {passportSizes.map((country) => (
                        <option key={country.countryCode} value={country.countryCode}>
                          {country.country} ({getDimensions(country)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Photo Count Selection - Only for Passport Mode */}
                {mode === 'passport' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Number of Photos per Sheet</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {[2, 4, 6, 8, 10].map((count) => (
                        <button
                          key={count}
                          onClick={() => setPhotoCount(count)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            photoCount === count
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <div className="text-sm font-semibold">{count}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Generate a printable sheet with {photoCount} passport photos
                    </p>
                  </div>
                )}

                <Button onClick={processImage} disabled={loading} className="w-full">
                  {loading ? processingStep : '✨ Process with AI'}
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Preview</h2>

            {processedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img src={processedImage} alt="Processed" className="w-full rounded-lg shadow-md" />
                  {selectedCountry && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {selectedCountry.country}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Button onClick={() => downloadImage('png')} className="w-full">
                    Download PNG
                  </Button>
                  <Button onClick={() => downloadImage('jpg')} variant="outline" className="w-full">
                    Download JPG
                  </Button>
                  <Button onClick={() => downloadImage('pdf')} variant="outline" className="w-full">
                    Download PDF
                  </Button>
                </div>

                {mode === 'passport' && (
                  <Button onClick={generatePhotoSheet} variant="outline" className="w-full mt-3">
                    📄 Download {photoCount}-Photo Sheet
                  </Button>
                )}

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-200 text-center">
                    ✅ Photo processed successfully! Ready to download.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {image ? 'Click "Process with AI" to start' : 'Upload a photo to begin'}
                </p>
              </div>
            )}

            {selectedCountry && (
              <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  {selectedCountry.country} Requirements
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>📐 Size: {getDimensions(selectedCountry)}</li>
                  <li>
                    📏 Width: {selectedCountry.width}
                    {selectedCountry.unit === 'inch' ? '"' : 'mm'}
                  </li>
                  <li>
                    📏 Height: {selectedCountry.height}
                    {selectedCountry.unit === 'inch' ? '"' : 'mm'}
                  </li>
                  <li>🎨 Background: {selectedCountry.background}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Features Section - Mode Specific */}
        <div className="mt-12 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            {mode === 'passport' ? 'Passport Photo Features' : 'HD Enhancement Features'}
          </h2>
          {mode === 'passport' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Background Removal</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered background removal with perfect edges for passport compliance
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="text-xl font-semibold mb-2">Face Detection</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Automatic face detection and smart cropping to country standards
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-xl font-semibold mb-2">Multi-Photo Sheets</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate printable sheets with 2, 4, 6, 8, or 10 passport photos
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-xl font-semibold mb-2">HD Enhancement</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Auto-enhance brightness, contrast, and saturation for professional quality
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Anti-Blur & Sharpen</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Remove blur and enhance clarity with advanced unsharp masking
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-semibold mb-2">Background Options</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optional background removal and custom color selection
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Editor...</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
