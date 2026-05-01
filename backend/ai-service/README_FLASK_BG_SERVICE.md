# Flask Background Removal Service

This Flask service provides background removal functionality using the Remove.bg API for the PhotoAI Pro passport photo maker.

## Features

- ✅ Remove background from images using Remove.bg API
- ✅ Apply custom background colors (default: blue #3AA0F5 for passport photos)
- ✅ Resize images to custom dimensions (default: 300x300)
- ✅ Return processed images as base64-encoded JPEG
- ✅ Support for custom API keys

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements_flask.txt
```

### 2. Run the Service

**Option 1: Using the startup script (Windows)**
```bash
start-flask-bg-service.bat
```

**Option 2: Manual start**
```bash
cd backend/ai-service
python passport_bg_remover.py
```

The service will start on `http://localhost:5003`

## API Endpoint

### POST `/removebg`

Remove background from an image and apply a new background color.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`

**Form Data:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `image` | File | Yes | - | The image file to process |
| `api_key` | String | No | Built-in key | Your Remove.bg API key (optional) |
| `bg_color` | String | No | `#3AA0F5` | Background color in hex format |
| `width` | Integer | No | `300` | Output image width in pixels |
| `height` | Integer | No | `300` | Output image height in pixels |

**Response:**
```json
{
  "success": true,
  "image": "base64_encoded_image_string",
  "width": 300,
  "height": 300,
  "bg_color": "#3AA0F5"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Background removal API failed"
}
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:5003/removebg \
  -F "image=@photo.jpg" \
  -F "bg_color=#FFFFFF" \
  -F "width=400" \
  -F "height=500"
```

### Using JavaScript (Frontend)

```javascript
const formData = new FormData();
formData.append('image', imageFile, 'photo.jpg');
formData.append('bg_color', '#FFFFFF');
formData.append('width', '400');
formData.append('height', '500');

const response = await axios.post('http://localhost:5003/removebg', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

if (response.data.success) {
  const imageUrl = `data:image/jpeg;base64,${response.data.image}`;
  // Use the image URL
}
```

## Integration with PhotoAI Pro

This service is integrated into the PhotoAI Pro editor page (`/editor`). The editor uses a fallback chain:

1. **First:** Try Flask background removal service (this service)
2. **Second:** Fallback to FastAI service (`/api/ai/remove-background`)
3. **Third:** Fallback to client-side background removal

This ensures maximum reliability and uptime.

## Configuration

### Environment Variables

Add to your frontend `.env.local`:

```env
NEXT_PUBLIC_FLASK_BG_SERVICE_URL=http://localhost:5003
```

### Default API Key

The service includes a built-in Remove.bg API key: `LuT4n9QngxmNskcj5WXydu4F`

You can override this by:
1. Passing `api_key` in the form data
2. Modifying the default in `passport_bg_remover.py`

## Dependencies

- **Flask** 3.0.0 - Web framework
- **requests** 2.31.0 - HTTP client for Remove.bg API
- **Pillow** 10.1.0 - Image processing

## Notes

- The service runs on port 5003 by default
- Images are returned as base64-encoded JPEG strings
- Background removal requires internet connection (Remove.bg API)
- Free tier of Remove.bg API has limitations (50 calls/month)
- For production use, get your own API key from https://www.remove.bg/api

## Troubleshooting

### Service won't start
- Make sure Python 3.7+ is installed
- Install dependencies: `pip install -r requirements_flask.txt`
- Check if port 5001 is available

### Background removal fails
- Check your internet connection
- Verify the Remove.bg API key is valid
- Check API usage limits on your Remove.bg account

### Images not processing
- Ensure the image format is supported (JPG, PNG, etc.)
- Check that the image file is not corrupted
- Verify the image size is within API limits
