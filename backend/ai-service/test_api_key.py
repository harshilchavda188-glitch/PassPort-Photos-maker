# Test Remove.bg API Key
# This script tests if your API key is working

import requests
from PIL import Image
from io import BytesIO

# Your API key
API_KEY = 'LuT4n9QngxmNskcj5WXydu4F'

print("🧪 Testing Remove.bg API Key...")
print(f"🔑 API Key: {API_KEY[:10]}...{API_KEY[-5:]}")
print()

# Create a simple test image (100x100 red square)
print("📸 Creating test image...")
test_image = Image.new('RGB', (100, 100), color='red')
buffered = BytesIO()
test_image.save(buffered, format="JPEG")
img_bytes = buffered.getvalue()
print("✅ Test image created")
print()

# Send to Remove.bg API
print("📡 Sending to Remove.bg API...")
try:
    response = requests.post(
        'https://api.remove.bg/v1.0/removebg',
        files={'image_file': img_bytes},
        data={'size': 'auto'},
        headers={'X-Api-Key': API_KEY},
        timeout=30
    )
    
    print(f"📊 Response Status: {response.status_code}")
    print()
    
    if response.status_code == 200:
        print("✅ SUCCESS! API key is working!")
        print(f"📏 Image size: {len(response.content)} bytes")
        print()
        print("🎉 Your Remove.bg API is ready to use!")
    else:
        print("❌ FAILED! API key may be invalid or expired")
        print(f"📄 Error: {response.content.decode('utf-8', errors='ignore')}")
        print()
        print("💡 Get a free API key from: https://www.remove.bg/api")
        
except requests.exceptions.Timeout:
    print("❌ TIMEOUT! API request took too long")
    print("💡 Check your internet connection")
    
except Exception as e:
    print(f"❌ ERROR: {str(e)}")

print()
input("Press Enter to exit...")
