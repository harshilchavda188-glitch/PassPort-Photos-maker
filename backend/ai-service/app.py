from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uvicorn
import logging
from services.background_remover import remove_background
from services.upscaler import upscale_image
from services.passport_processor import create_passport_photo

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PhotoAI Pro - AI Image Processing Service",
    description="Professional AI-powered image processing for passport photos",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:3002", 
        "http://localhost:3003", 
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "PhotoAI Pro AI Service",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    from services.background_remover import _REMBG_SESSION
    return {
        "status": "ok",
        "models_loaded": _REMBG_SESSION is not None,
        "gpu_available": False,
        "cache_active": True
    }

@app.post("/api/ai/remove-background")
async def api_remove_background(
    file: UploadFile = File(...),
    bg_color: str = Form("#ffffff")
):
    """
    Remove background from image and replace with color
    Uses rembg with U²-Net/BiRefNet model (100% free, no API limits)
    """
    try:
        logger.info(f"Processing background removal for {file.filename}")
        image_data = await file.read()
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        result = await remove_background(image_data, bg_color)
        
        return Response(
            content=result["image"],
            media_type=f"image/{result['format']}",
            headers={
                "X-Width": str(result.get("width", 0)),
                "X-Height": str(result.get("height", 0)),
                "X-Processing-Time": str(result.get("processing_time", 0))
            }
        )
    except Exception as e:
        logger.error(f"Background removal error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/upscale")
async def api_upscale(
    file: UploadFile = File(...),
    scale: int = Form(2)
):
    """
    Upscale image using advanced algorithms
    Supports 2x and 4x upscaling with quality enhancement
    """
    try:
        logger.info(f"Upscaling image {file.filename} by {scale}x")
        image_data = await file.read()
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        if scale not in [2, 4]:
            raise HTTPException(status_code=400, detail="Scale must be 2 or 4")
        
        result = await upscale_image(image_data, scale)
        
        return Response(
            content=result["image"],
            media_type=f"image/{result['format']}",
            headers={
                "X-Original-Width": str(result.get("original_width", 0)),
                "X-Original-Height": str(result.get("original_height", 0)),
                "X-New-Width": str(result.get("new_width", 0)),
                "X-New-Height": str(result.get("new_height", 0)),
            }
        )
    except Exception as e:
        logger.error(f"Upscaling error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/passport-photo")
async def api_create_passport_photo(
    file: UploadFile = File(...),
    country_code: str = Form("IN"),
    bg_color: str = Form("#ffffff"),
    enhance: bool = Form(True)
):
    """
    Complete passport photo processing pipeline:
    1. Remove background (rembg)
    2. Detect and align face
    3. Enhance quality (upscaling + sharpening)
    4. Crop to passport size
    5. Apply background color
    """
    try:
        logger.info(f"Creating passport photo for {country_code} from {file.filename}")
        image_data = await file.read()
        
        if not image_data:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        result = await create_passport_photo(image_data, country_code, bg_color, enhance)
        
        return Response(
            content=result["image"],
            media_type=f"image/{result['format']}",
            headers={
                "X-Country": result.get("country", ""),
                "X-Width": str(result.get("width", 0)),
                "X-Height": str(result.get("height", 0)),
                "X-DPI": str(result.get("dpi", 300)),
                "X-Processing-Steps": str(result.get("steps", 0))
            }
        )
    except Exception as e:
        logger.error(f"Passport photo creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/enhance")
async def api_enhance_image(
    file: UploadFile = File(...),
    brightness: int = Form(0),
    contrast: int = Form(0),
    saturation: int = Form(0)
):
    """
    Enhance image with brightness, contrast, and saturation adjustments
    """
    try:
        from services.enhancer import enhance_image
        logger.info(f"Enhancing image {file.filename}")
        image_data = await file.read()
        
        result = await enhance_image(image_data, brightness, contrast, saturation)
        
        return Response(
            content=result["image"],
            media_type=f"image/{result['format']}"
        )
    except Exception as e:
        logger.error(f"Enhancement error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
