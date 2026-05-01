from PIL import Image, ImageEnhance, ImageFilter
import io
import time
import logging
import cv2
import numpy as np

logger = logging.getLogger(__name__)

async def upscale_image(image_data: bytes, scale: int = 2) -> dict:
    """
    Upscale image using advanced algorithms (simulated Real-ESRGAN)
    Uses Lanczos resampling + sharpening for professional quality
    """
    start_time = time.time()
    
    try:
        # Open image
        input_image = Image.open(io.BytesIO(image_data))
        original_width, original_height = input_image.size
        logger.info(f"Original size: {original_width}x{original_height}")
        
        # Calculate new dimensions
        new_width = original_width * scale
        new_height = original_height * scale
        
        # High-quality upscaling using Lanczos
        upscaled = input_image.resize(
            (new_width, new_height),
            Image.Resampling.LANCZOS
        )
        
        # Convert to OpenCV for advanced processing
        img_array = np.array(upscaled)
        img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Apply unsharp mask for sharpening (Native OpenCV - very fast)
        gaussian = cv2.GaussianBlur(img_cv, (0, 0), 2.0)
        img_cv = cv2.addWeighted(img_cv, 1.5, gaussian, -0.5, 0)
        
        # Fast Denoising using Bilateral Filter (Much faster than NLMeans)
        # d=5, sigmaColor=75, sigmaSpace=75
        img_cv = cv2.bilateralFilter(img_cv, 5, 75, 75)
        
        # Convert back to PIL
        img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
        result_image = Image.fromarray(img_rgb)
        
        # Enhance color and contrast
        enhancer = ImageEnhance.Contrast(result_image)
        result_image = enhancer.enhance(1.1)
        
        enhancer = ImageEnhance.Color(result_image)
        result_image = enhancer.enhance(1.05)
        
        # Save to bytes
        output_bytes = io.BytesIO()
        result_image.save(output_bytes, format='PNG', quality=95)
        output_bytes.seek(0)
        
        processing_time = time.time() - start_time
        logger.info(f"Upscaling completed in {processing_time:.2f}s")
        
        return {
            "success": True,
            "image": output_bytes.read(),
            "format": "png",
            "original_width": original_width,
            "original_height": original_height,
            "new_width": new_width,
            "new_height": new_height,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        logger.error(f"Upscaling failed: {str(e)}")
        raise Exception(f"Failed to upscale image: {str(e)}")

async def enhance_quality(image_data: bytes, quality: str = "hd") -> dict:
    """
    Enhance image quality with multiple improvements
    """
    start_time = time.time()
    
    try:
        input_image = Image.open(io.BytesIO(image_data))
        
        # Apply enhancements based on quality level
        if quality == "standard":
            sharpen_amount = 1.2
            contrast_amount = 1.1
        elif quality == "hd":
            sharpen_amount = 1.5
            contrast_amount = 1.2
        else:  # ultra
            sharpen_amount = 2.0
            contrast_amount = 1.3
        
        # Sharpen
        enhancer = ImageEnhance.Sharpness(input_image)
        enhanced = enhancer.enhance(sharpen_amount)
        
        # Contrast
        enhancer = ImageEnhance.Contrast(enhanced)
        enhanced = enhancer.enhance(contrast_amount)
        
        # Brightness
        enhancer = ImageEnhance.Brightness(enhanced)
        enhanced = enhancer.enhance(1.05)
        
        # Color
        enhancer = ImageEnhance.Color(enhanced)
        enhanced = enhancer.enhance(1.1)
        
        # Save
        output_bytes = io.BytesIO()
        enhanced.save(output_bytes, format='PNG', quality=95)
        output_bytes.seek(0)
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "image": output_bytes.read(),
            "format": "png",
            "width": enhanced.width,
            "height": enhanced.height,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        logger.error(f"Quality enhancement failed: {str(e)}")
        raise Exception(f"Failed to enhance image: {str(e)}")
