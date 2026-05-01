'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import axios from 'axios';

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

export default function SimplePassportMaker() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    
    try {
      setProcessingStep('🚀 Removing background with local AI (rembg)...');
      
      // Convert data URL to blob
      const blob = await fetch(image).then((r) => r.blob());
      
      // Create form data for the local FastAPI service
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');
      formData.append('bg_color', '#3AA0F5'); // Blue background

      // Call local FastAPI AI service (port 8000) — 100% FREE, no API key
      const response = await axios.post(`${AI_SERVICE_URL}/api/ai/remove-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        timeout: 120000, // 2 minute timeout for AI processing
      });

      setProcessingStep('✅ Done! Compositing blue background...');

      // Convert blob response to data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImage(reader.result as string);
        setProcessingStep('✅ Passport photo ready!');
        setLoading(false);
      };
      reader.readAsDataURL(response.data);

    } catch (err: any) {
      console.error('Processing error:', err);
      
      // Friendly error messages
      let message = 'Failed to process image. Please try again.';
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        message = '❌ Cannot connect to AI service. Make sure the Python AI service is running:\n\ncd backend/ai-service\npython -m uvicorn app:app --reload --port 8000';
      } else if (err.response?.data) {
        message = err.response.data.detail || err.message;
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
      setProcessingStep('');
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `passport-photo-blue-bg.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setImage(null);
    setProcessedImage(null);
    setError(null);
    setProcessingStep('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Passport-Size-Image-Maker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Upload any image (JPG/JPEG) with any background - we'll automatically remove it and add a blue background for your perfect passport photo!
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">⚡ Fast & Simple</span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">🎨 Auto Blue BG</span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">📸 600x600px</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                📤 Upload Your Photo
              </h2>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {image ? (
                  <div>
                    <img
                      src={image}
                      alt="Uploaded"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      ✅ Image uploaded! Click below to process.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Click to Upload Photo
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG or JPEG only (not PNG)
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Any background will be removed automatically
                    </p>
                  </div>
                )}
              </div>

              {/* Free AI Service Badge */}
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                      100% Free Local AI — No API Key Needed!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      Uses rembg AI running on your machine. Make sure the AI service is started.
                    </p>
                  </div>
                </div>
              </div>

              {/* Process Button */}
              {image && !processedImage && (
                <button
                  onClick={processImage}
                  disabled={loading}
                  className="w-full mt-4 btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '✨ Create Passport Photo'
                  )}
                </button>
              )}

              {/* Processing Status */}
              {processingStep && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    {processingStep}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    ❌ {error}
                  </p>
                </div>
              )}

              {/* Reset Button */}
              {(image || processedImage) && (
                <button
                  onClick={resetForm}
                  className="w-full mt-3 btn-outline py-2"
                >
                  🔄 Start Over
                </button>
              )}
            </div>

            {/* Result Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                📸 Your Passport Photo
              </h2>

              {processedImage ? (
                <div>
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4">
                    <img
                      src={processedImage}
                      alt="Passport Photo"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={downloadImage}
                      className="w-full btn-primary text-lg py-3"
                    >
                      ⬇️ Download Passport Photo
                    </button>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✅ <strong>Ready to use!</strong>
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        • Size: 600x600 pixels<br/>
                        • Background: Blue (#3AA0F5)<br/>
                        • Format: JPEG<br/>
                        • Perfect for passport/visa applications
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-lg">Your passport photo will appear here</p>
                  <p className="text-sm mt-2">Upload and process an image to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Fast Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get your passport photo in just 3-5 seconds with our optimized AI service
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Auto Blue Background
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Any background is automatically removed and replaced with professional blue color
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Perfect Size
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Output is 600x600 pixels - ideal for passport, visa, and ID applications
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              📋 How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Upload</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload any JPG/JPEG image (not PNG)
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Process</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click "Create Passport Photo" button
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Auto BG</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Background removed & blue added automatically
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">4️⃣</span>
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Download</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download your perfect passport photo
                </p>
              </div>
            </div>
          </div>

          {/* How to Start AI Service */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-300">
              🚀 How to Start the AI Service (First Time)
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1.</span>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Open a new terminal/command prompt
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2.</span>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Navigate to the AI service folder:</p>
                  <code className="block bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-200 px-3 py-2 rounded text-xs font-mono">
                    cd backend/ai-service
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3.</span>
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Start the service:</p>
                  <code className="block bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-200 px-3 py-2 rounded text-xs font-mono">
                    python -m uvicorn app:app --reload --port 8000
                  </code>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                🎁 <strong>100% Free:</strong> Uses rembg AI locally — unlimited usage, no accounts needed
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                💡 <strong>Tip:</strong> First run may take a minute to download the AI model (~170 MB)
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
