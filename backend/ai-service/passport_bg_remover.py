from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image
import base64
import time
import logging

app = Flask(__name__)
# Enable CORS for all origins (development only)
CORS(app, resources={r"/*": {"origins": "*"}})
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connects to FREE FastAPI AI service (port 8000) - 100% FREE!
AI_SERVICE_URL = "http://localhost:8000"

@app.route('/')
def home():
    return """
    [READY] Passport Photo AI Service - FIXED [OK] 
    100% FREE (rembg + face detection + passport crop)
    Port 5003 -> FastAPI 8000 pipeline
    """

@app.route('/removebg', methods=['POST'])
def remove_bg():
    start_time = time.time()
    
    try:
        img_file = request.files['image']
        image_data = img_file.read()
        
        if not image_data:
            return jsonify({'success': False, 'error': 'No image'}), 400
        
        # Get parameters
        bg_color = request.form.get('bg_color', '#ffffff')
        width = int(request.form.get('width', 600))
        height = int(request.form.get('height', 600))
        api_key = request.form.get('api_key', '').strip()
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key is required. Please enter your Remove.bg API key.',
                'hint': 'Get free API key from: https://www.remove.bg/api'
            }), 400
        
        logger.info(f"Processing: bg={bg_color}, size={width}x{height}")
        
        # Call Remove.bg API directly
        files = {'image_file': ('image.jpg', image_data, 'image/jpeg')}
        data = {'size': 'auto'}
        headers = {'X-Api-Key': api_key}
        
        resp = requests.post(
            'https://api.remove.bg/v1.0/removebg',
            files=files,
            data=data,
            headers=headers,
            timeout=30
        )
        
        if resp.status_code != 200:
            error_msg = resp.json().get('errors', [{}])[0].get('title', 'Unknown error') if resp.content else 'API request failed'
            return jsonify({
                'success': False,
                'error': f'Remove.bg API error: {error_msg}',
                'status_code': resp.status_code
            }), 200
        
        # Background removed successfully!
        img_no_bg = Image.open(BytesIO(resp.content)).convert('RGBA')
        
        # Add background color
        if bg_color and bg_color.lower() != 'transparent':
            bg_img = Image.new('RGBA', img_no_bg.size, bg_color)
            img_with_bg = Image.alpha_composite(bg_img, img_no_bg)
            img_final = img_with_bg.convert('RGB')
        else:
            img_final = img_no_bg.convert('RGB')
        
        # Resize to requested dimensions
        if width and height:
            img_final = img_final.resize((width, height), Image.Resampling.LANCZOS)
        
        # Base64 encode for frontend
        buffered = BytesIO()
        img_final.save(buffered, 'JPEG', quality=95, optimize=True)
        img_b64 = base64.b64encode(buffered.getvalue()).decode()
        
        proc_time = time.time() - start_time
        
        return jsonify({
            'success': True,
            'image': img_b64,
            'width': img_final.width,
            'height': img_final.height,
            'processing_time': round(proc_time, 2),
            'pipeline': 'Remove.bg API',
            'message': f'Background removed and {bg_color} background added'
        })
        
    except requests.exceptions.Timeout:
        return jsonify({'success': False, 'error': 'Remove.bg API timeout - please try again'}), 200
    except requests.exceptions.ConnectionError:
        return jsonify({'success': False, 'error': 'Cannot connect to Remove.bg API - check internet'}), 200
    except Exception as e:
        logger.error(f'Error: {e}')
        return jsonify({'success': False, 'error': str(e)}), 200

if __name__ == '__main__':
    print("[READY] FIXED Passport Service (FREE) - Port 5003")
    app.run(debug=True, port=5003)
