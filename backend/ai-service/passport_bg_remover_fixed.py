from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image
import base64
import time
import logging

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FIXED: Connects to FREE FastAPI AI service (port 8000) - NO Remove.bg API!
AI_SERVICE_URL = "http://127.0.0.1:8000"

@app.route('/')
def home():
    return "🚀 Passport Photo AI Service - FIXED (100% FREE)"

@app.route('/removebg', methods=['POST'])
def remove_bg():
    """
    FIXED VERSION:
    - Uses FREE FastAPI AI service (rembg + face detection + passport crop)
    - NO API keys required
    - Professional passport-ready output
    """
    start_time = time.time()
    
    try:
        # Get image from request
        img_file = request.files['image']
        image_data = img_file.read()
        
        if not image_data or len(image_data) == 0:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Optimize: Compress large images
        img = Image.open(BytesIO(image_data))
        max_size = 2000
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.width * ratio), int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85, optimize=True)
            image_data = buffered.getvalue()
        
        # Get parameters (now optional - defaults work)
        country_code = request.form.get('country_code', 'IN')
        bg_color = request.form.get('bg_color', '#ffffff')
        width = int(request.form.get('width', 413))  # 35mm @ 300dpi
        height = int(request.form.get('height', 531))  # 45mm @ 300dpi
        
        logger.info(f"Processing passport photo: {country_code}, BG: {bg_color}")
        
        # FIXED: Call FREE FastAPI passport pipeline (rembg + face + crop)
        files = {'file': ('input.jpg', image_data, 'image/jpeg')}
        data = {
            'country_code': country_code,
            'bg_color': bg_color,
            'enhance': 'true'
        }
        
        response = requests.post(
            f"{AI_SERVICE_URL}/api/ai/passport-photo",
            files=files,
            data=data,
            timeout=60  # Longer timeout for full pipeline
        )
        
        if response.status_code != 200:
            error_msg = response.text[:200]
            logger.error(f'AI Service Error: {response.status_code} - {error_msg}')
            return jsonify({
                'success': False,
                'error': f'AI processing failed: {response.status_code}',
                'details': error_msg
            }), 500
        
        # Extract image from response headers/metadata
        img_bytes = response.content
        img_pil = Image.open(BytesIO(img_bytes))
        
        # Encode as base64 for frontend
        buffered = BytesIO()
        img_pil.save(buffered, format="JPEG", quality=95, optimize=True)
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ FIXED SUCCESS: {processing_time:.2f}s - FREE processing!")
        
        return jsonify({
            'success': True,
            'image': img_str,
            'width': img_pil.width,
            'height': img_pil.height,
            'bg_color': bg_color,
            'country_code': country_code,
            'processing_time': round(processing_time, 2),
            'service': 'FREE AI Pipeline (rembg + face detection)'
        })
        
    except requests.exceptions.Timeout:
        logger.error('AI Service Timeout')
        return jsonify({'success': False, 'error': 'Processing timeout - complex image?'}), 504
    except Exception as e:
        logger.error(f'Processing Error: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("FIXED Passport Photo Service (FREE) - Port 5003")
    print("Connects to FastAPI AI service on port 8000")
    app.run(debug=False, port=5003, host='0.0.0.0', threaded=True)
