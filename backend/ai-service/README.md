# PhotoAI Pro - AI Image Processing Service

Professional AI-powered image processing for passport photos using free, open-source tools.

## Features

- **Background Removal**: Uses `rembg` with U²-Net model (100% free, no API limits)
- **Face Detection & Alignment**: OpenCV Haar Cascades for automatic face centering
- **Image Upscaling**: Lanczos resampling + advanced sharpening (2x/4x)
- **Quality Enhancement**: Auto brightness, contrast, and saturation adjustment
- **Passport Photo Creation**: Complete pipeline for 12+ countries
- **Printable Sheets**: Generate multi-photo sheets for printing

## Setup

### Option 1: Direct Python Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

Service will start at: `http://localhost:8000`

### Option 2: Docker

```bash
# Build image
docker build -t photoai-pro-ai-service .

# Run container
docker run -p 8000:8000 photoai-pro-ai-service
```

## API Endpoints

### 1. Health Check
```
GET /
GET /health
```

### 2. Remove Background
```
POST /api/ai/remove-background
- file: Image file (required)
- bg_color: Background color (default: #ffffff)
```

### 3. Upscale Image
```
POST /api/ai/upscale
- file: Image file (required)
- scale: 2 or 4 (default: 2)
```

### 4. Create Passport Photo
```
POST /api/ai/passport-photo
- file: Image file (required)
- country_code: Country code (IN, US, GB, CA, etc.)
- bg_color: Background color (default: #ffffff)
- enhance: true/false (default: true)
```

### 5. Enhance Image
```
POST /api/ai/enhance
- file: Image file (required)
- brightness: -100 to 100
- contrast: -100 to 100
- saturation: -100 to 100
```

## Supported Countries

- India (IN): 35x45mm
- United States (US): 51x51mm (2x2 inches)
- United Kingdom (GB): 35x45mm
- Canada (CA): 50x70mm
- Australia (AU): 35x45mm
- Germany (DE): 35x45mm
- France (FR): 35x45mm
- Japan (JP): 35x45mm
- China (CN): 33x48mm
- Brazil (BR): 50x70mm
- Singapore (SG): 35x45mm
- UAE (AE): 43x55mm

## Processing Pipeline

When creating a passport photo, the service:

1. **Removes background** using rembg (AI-powered)
2. **Detects and aligns face** to center
3. **Enhances quality** with 2x upscaling and sharpening
4. **Crops to passport dimensions** based on country specs
5. **Applies background color** (white, blue, red, custom)

## Technologies Used

- **FastAPI**: High-performance Python web framework
- **rembg**: AI background removal (U²-Net model)
- **OpenCV**: Computer vision for face detection
- **Pillow**: Image processing and manipulation
- **NumPy**: Numerical computing

## Performance

- Background removal: ~2-5 seconds
- Upscaling (2x): ~1-3 seconds
- Full passport photo: ~5-10 seconds
- No API limits (completely free)

## Integration with Node.js Backend

The Node.js backend communicates with this AI service via HTTP:

```typescript
// Example: Call AI service from Node.js
const response = await axios.post(
  'http://localhost:8000/api/ai/passport-photo',
  formData,
  { responseType: 'arraybuffer' }
);
```

## Environment Variables

```env
# Optional: Configure service
PORT=8000
HOST=0.0.0.0
WORKERS=2
```

## Testing

```bash
# Test background removal
curl -X POST http://localhost:8000/api/ai/remove-background \
  -F "file=@test.jpg" \
  -F "bg_color=#ffffff" \
  --output result.png

# Test passport photo creation
curl -X POST http://localhost:8000/api/ai/passport-photo \
  -F "file=@test.jpg" \
  -F "country_code=IN" \
  -F "bg_color=#ffffff" \
  --output passport.png
```

## License

MIT License - Free for personal and commercial use

## Support

For issues or questions, please open a GitHub issue.
