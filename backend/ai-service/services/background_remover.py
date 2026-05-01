from rembg import remove, new_session
from PIL import Image
import io
import time
import logging

logger = logging.getLogger(__name__)

# Global session cache to avoid reloading model on every request (MASSIVE speedup)
_REMBG_SESSION = None

def get_rembg_session():
    global _REMBG_SESSION
    if _REMBG_SESSION is None:
        logger.info("Initializing AI model session (u2net)...")
        _REMBG_SESSION = new_session("u2net")
    return _REMBG_SESSION

async def remove_background(image_data: bytes, bg_color: str = "#ffffff") -> dict:
    """
    Remove background using rembg (U²-Net/BiRefNet model)
    100% FREE - No API limits, no watermarks
    """
    start_time = time.time()
    
    try:
        # Open image
        input_image = Image.open(io.BytesIO(image_data))
        logger.info(f"Input image size: {input_image.size}")
        
        # Remove background using AI with cached session
        session = get_rembg_session()
        output_image = remove(
            input_image,
            session=session,
            alpha_matting=True,  # Smooth edges
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10
        )
        
        # Apply background color if not transparent
        if bg_color.lower() != "transparent":
            # Create colored background
            background = Image.new('RGBA', output_image.size, bg_color)
            # Composite with removed background
            output_image = Image.alpha_composite(background, output_image)
        
        # Convert to RGB for final output
        output_image = output_image.convert('RGB')
        
        # Save to bytes
        output_bytes = io.BytesIO()
        output_image.save(output_bytes, format='PNG', quality=85, optimize=True)
        output_bytes.seek(0)
        
        processing_time = time.time() - start_time
        logger.info(f"Background removal completed in {processing_time:.2f}s")
        
        return {
            "success": True,
            "image": output_bytes.read(),
            "format": "png",
            "width": output_image.width,
            "height": output_image.height,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        logger.error(f"Background removal failed: {str(e)}")
        raise Exception(f"Failed to remove background: {str(e)}")
