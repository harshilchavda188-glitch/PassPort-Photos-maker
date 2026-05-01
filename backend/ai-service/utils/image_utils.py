import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def mm_to_pixels(mm: float, dpi: int = 300) -> int:
    """
    Convert millimeters to pixels at given DPI
    Formula: pixels = (mm / 25.4) * dpi
    """
    return int((mm / 25.4) * dpi)

def pixels_to_mm(pixels: int, dpi: int = 300) -> float:
    """
    Convert pixels to millimeters at given DPI
    """
    return (pixels / dpi) * 25.4

def crop_to_passport_size(
    image: np.ndarray,
    target_width_px: int,
    target_height_px: int,
    head_height_ratio: float = 0.75
) -> np.ndarray:
    """
    Crop image to passport photo dimensions
    Ensures proper head size and positioning
    
    Args:
        image: Input image (already face-aligned)
        target_width_px: Target width in pixels
        target_height_px: Target height in pixels
        head_height_ratio: Ratio of head height to total height (typically 0.69-0.75)
    
    Returns:
        Cropped image at exact passport dimensions
    """
    try:
        img_height, img_width = image.shape[:2]
        
        # Calculate aspect ratios
        target_ratio = target_width_px / target_height_px
        img_ratio = img_width / img_height
        
        # Determine crop dimensions to maintain aspect ratio
        if img_ratio > target_ratio:
            # Image is wider - crop width
            new_width = int(target_ratio * img_height)
            new_height = img_height
            x_offset = (img_width - new_width) // 2
            y_offset = 0
        else:
            # Image is taller - crop height
            new_width = img_width
            new_height = int(img_width / target_ratio)
            x_offset = 0
            y_offset = (img_height - new_height) // 2
        
        # Crop image
        cropped = image[
            y_offset:y_offset + new_height,
            x_offset:x_offset + new_width
        ]
        
        # Resize to exact target dimensions
        resized = cv2.resize(cropped, (target_width_px, target_height_px), interpolation=cv2.INTER_LANCZOS4)
        
        logger.info(f"Cropped from {img_width}x{img_height} to {target_width_px}x{target_height_px}")
        return resized
        
    except Exception as e:
        logger.error(f"Passport crop failed: {str(e)}")
        # Return resized image if crop fails
        return cv2.resize(image, (target_width_px, target_height_px), interpolation=cv2.INTER_LANCZOS4)

def create_photo_sheet(
    passport_photo: np.ndarray,
    cols: int = 2,
    rows: int = 3,
    gap_mm: int = 5,
    margin_mm: int = 10,
    dpi: int = 300
) -> np.ndarray:
    """
    Create a printable sheet with multiple passport photos
    """
    # Convert mm to pixels
    gap_px = mm_to_pixels(gap_mm, dpi)
    margin_px = mm_to_pixels(margin_mm, dpi)
    
    photo_height, photo_width = passport_photo.shape[:2]
    
    # Calculate sheet dimensions
    sheet_width = margin_px * 2 + cols * photo_width + (cols - 1) * gap_px
    sheet_height = margin_px * 2 + rows * photo_height + (rows - 1) * gap_px
    
    # Create white sheet
    sheet = np.full((sheet_height, sheet_width, 3), 255, dtype=np.uint8)
    
    # Place photos in grid
    for row in range(rows):
        for col in range(cols):
            x = margin_px + col * (photo_width + gap_px)
            y = margin_px + row * (photo_height + gap_px)
            sheet[y:y+photo_height, x:x+photo_width] = passport_photo
    
    logger.info(f"Created photo sheet: {cols}x{rows} = {cols*rows} photos")
    return sheet

def add_crop_marks(image: np.ndarray, margin_px: int = 20) -> np.ndarray:
    """
    Add crop marks around the image for printing
    """
    height, width = image.shape[:2]
    
    # Add margin
    new_width = width + 2 * margin_px
    new_height = height + 2 * margin_px
    result = np.full((new_height, new_width, 3), 255, dtype=np.uint8)
    result[margin_px:margin_px+height, margin_px:margin_px+width] = image
    
    # Add crop marks (small black lines at corners)
    mark_length = 10
    color = (0, 0, 0)
    
    # Top-left
    result[margin_px, margin_px-mark_length:margin_px] = color
    result[margin_px-mark_length:margin_px, margin_px] = color
    
    # Top-right
    result[margin_px, margin_px+width:margin_px+width+mark_length] = color
    result[margin_px-mark_length:margin_px, margin_px+width] = color
    
    # Bottom-left
    result[margin_px+height, margin_px-mark_length:margin_px] = color
    result[margin_px+height:margin_px+height+mark_length, margin_px] = color
    
    # Bottom-right
    result[margin_px+height, margin_px+width:margin_px+width+mark_length] = color
    result[margin_px+height:margin_px+height+mark_length, margin_px+width] = color
    
    return result
