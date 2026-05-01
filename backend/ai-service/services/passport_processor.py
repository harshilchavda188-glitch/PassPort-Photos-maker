from .background_remover import remove_background
from .upscaler import upscale_image
from utils.face_detector import detect_and_align_face
from utils.image_utils import crop_to_passport_size, mm_to_pixels
import cv2
import numpy as np
from PIL import Image
import io
import time
import logging
import numpy as np  # already imported, but ensure

logger = logging.getLogger(__name__)

# Country passport photo specifications
COUNTRY_SPECS = {
    "IN": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.75, "name": "India"},
    "US": {"width_mm": 51, "height_mm": 51, "dpi": 300, "head_height_pct": 0.69, "name": "United States"},
    "GB": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "United Kingdom"},
    "CA": {"width_mm": 50, "height_mm": 70, "dpi": 300, "head_height_pct": 0.75, "name": "Canada"},
    "AU": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "Australia"},
    "DE": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "Germany"},
    "FR": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "France"},
    "JP": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "Japan"},
    "CN": {"width_mm": 33, "height_mm": 48, "dpi": 300, "head_height_pct": 0.75, "name": "China"},
    "BR": {"width_mm": 50, "height_mm": 70, "dpi": 300, "head_height_pct": 0.75, "name": "Brazil"},
    "SG": {"width_mm": 35, "height_mm": 45, "dpi": 300, "head_height_pct": 0.72, "name": "Singapore"},
    "AE": {"width_mm": 43, "height_mm": 55, "dpi": 300, "head_height_pct": 0.75, "name": "UAE"},
}

async def create_passport_photo(
    image_data: bytes,
    country_code: str = "IN",
    bg_color: str = "#ffffff",
    enhance: bool = True
) -> dict:
    """
    Complete passport photo processing pipeline:
    1. Remove background using rembg
    2. Detect and align face
    3. Enhance quality (upscaling + sharpening)
    4. Crop to passport dimensions
    5. Apply background color
    
    Returns professional passport-ready photo
    """
    start_time = time.time()
    steps_completed = 0
    
    try:
        # Get country specifications
        specs = COUNTRY_SPECS.get(country_code, COUNTRY_SPECS["IN"])
        logger.info(f"Creating passport photo for {specs['name']} ({country_code})")
        
        # Step 1: Remove background
        logger.info("Step 1: Removing background...")
        bg_result = await remove_background(image_data, "transparent")
        img_data = bg_result["image"]
        steps_completed += 1
        
        # Step 2: Detect and align face
        logger.info("Step 2: Detecting and aligning face...")
        img_array = cv2.imdecode(np.frombuffer(img_data, np.uint8), cv2.IMREAD_UNCHANGED)
        
        # Convert RGBA to RGB if needed
        if img_array.shape[2] == 4:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        
        try:
            aligned_img = detect_and_align_face(img_array)
            logger.info("Face detection successful")
        except Exception as face_error:
            logger.warning(f"Face detection failed ({str(face_error)}), using center crop fallback")
            height, width = img_array.shape[:2]
            crop_size = min(width, height) // 2 * 2  # Even dimensions
            start_x = (width - crop_size) // 2
            start_y = (height - crop_size) // 2
            aligned_img = img_array[start_y:start_y+crop_size, start_x:start_x+crop_size]
        steps_completed += 1
        
        # Step 3: Enhance quality if requested
        if enhance:
            logger.info("Step 3: Enhancing image quality...")
            _, encoded = cv2.imencode('.png', aligned_img)
            upscale_result = await upscale_image(encoded.tobytes(), scale=2)
            aligned_img = cv2.imdecode(np.frombuffer(upscale_result["image"], np.uint8), cv2.IMREAD_COLOR)
            steps_completed += 1
        
        # Step 4: Crop to passport size
        logger.info("Step 4: Cropping to passport dimensions...")
        target_width_px = mm_to_pixels(specs["width_mm"], specs["dpi"])
        target_height_px = mm_to_pixels(specs["height_mm"], specs["dpi"])
        
        cropped = crop_to_passport_size(
            aligned_img,
            target_width_px,
            target_height_px,
            specs["head_height_pct"]
        )
        steps_completed += 1
        
        # Step 5: Apply background color
        logger.info("Step 5: Applying background color...")
        if bg_color.lower() != "transparent":
            pil_img = Image.fromarray(cropped)
            # Create colored background
            background = Image.new('RGB', pil_img.size, bg_color)
            # Handle transparency if present
            if pil_img.mode == 'RGBA':
                background.paste(pil_img, mask=pil_img.split()[3])
            else:
                background.paste(pil_img)
            cropped = np.array(background)
        steps_completed += 1
        
        # Compress with PIL for optimal size
        pil_img = Image.fromarray(cropped)
        output_bytes = io.BytesIO()
        pil_img.save(output_bytes, format='PNG', quality=85, optimize=True)
        encoded = np.frombuffer(output_bytes.getvalue(), np.uint8)
        
        processing_time = time.time() - start_time
        logger.info(f"Passport photo created in {processing_time:.2f}s ({steps_completed} steps)")
        
        return {
            "success": True,
            "image": encoded.tobytes(),
            "format": "png",
            "width": cropped.shape[1],
            "height": cropped.shape[0],
            "country": country_code,
            "country_name": specs["name"],
            "dpi": specs["dpi"],
            "dimensions_mm": f"{specs['width_mm']}x{specs['height_mm']}",
            "steps": steps_completed,
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        logger.error(f"Passport photo creation failed: {str(e)}")
        raise Exception(f"Failed to create passport photo: {str(e)}")

def get_country_info(country_code: str) -> dict:
    """Get passport photo specifications for a country"""
    specs = COUNTRY_SPECS.get(country_code, COUNTRY_SPECS["IN"])
    width_px = mm_to_pixels(specs["width_mm"], specs["dpi"])
    height_px = mm_to_pixels(specs["height_mm"], specs["dpi"])
    
    return {
        "country_code": country_code,
        "country_name": specs["name"],
        "width_mm": specs["width_mm"],
        "height_mm": specs["height_mm"],
        "width_px": width_px,
        "height_px": height_px,
        "dpi": specs["dpi"],
        "head_height_percentage": int(specs["head_height_pct"] * 100)
    }
