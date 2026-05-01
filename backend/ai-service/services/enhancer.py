from PIL import Image, ImageEnhance
import io
import time
import logging

logger = logging.getLogger(__name__)

async def enhance_image(
    image_data: bytes,
    brightness: int = 0,
    contrast: int = 0,
    saturation: int = 0
) -> dict:
    """
    Enhance image with manual adjustments
    brightness: -100 to 100
    contrast: -100 to 100
    saturation: -100 to 100
    """
    start_time = time.time()
    
    try:
        input_image = Image.open(io.BytesIO(image_data))
        
        # Apply brightness
        if brightness != 0:
            factor = 1.0 + (brightness / 100.0)
            enhancer = ImageEnhance.Brightness(input_image)
            input_image = enhancer.enhance(factor)
        
        # Apply contrast
        if contrast != 0:
            factor = 1.0 + (contrast / 100.0)
            enhancer = ImageEnhance.Contrast(input_image)
            input_image = enhancer.enhance(factor)
        
        # Apply saturation
        if saturation != 0:
            factor = 1.0 + (saturation / 100.0)
            enhancer = ImageEnhance.Color(input_image)
            input_image = enhancer.enhance(factor)
        
        # Save
        output_bytes = io.BytesIO()
        input_image.save(output_bytes, format='PNG', quality=95)
        output_bytes.seek(0)
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "image": output_bytes.read(),
            "format": "png",
            "width": input_image.width,
            "height": input_image.height,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        logger.error(f"Image enhancement failed: {str(e)}")
        raise Exception(f"Failed to enhance image: {str(e)}")
