import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def detect_and_align_face(image: np.ndarray) -> np.ndarray:
    """
    Detect face and align it to center of image
    Uses OpenCV's Haar Cascade for fast face detection
    """
    try:
        # Convert to grayscale for detection
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Load Haar Cascade for face detection
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        # Detect faces
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) == 0:
            logger.warning("No face detected, returning original image")
            return image
        
        # Get the largest face (most likely the main subject)
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = face
        
        # Calculate face center
        face_center_x = x + w // 2
        face_center_y = y + h // 2
        
        # Calculate image center
        img_height, img_width = image.shape[:2]
        img_center_x = img_width // 2
        img_center_y = img_height // 2
        
        # Calculate shift to center the face
        shift_x = img_center_x - face_center_x
        shift_y = img_center_y - face_center_y
        
        # Apply translation to center the face
        M = np.float32([[1, 0, shift_x], [0, 1, shift_y]])
        aligned = cv2.warpAffine(image, M, (img_width, img_height))
        
        logger.info(f"Face detected at ({x}, {y}), centered with shift ({shift_x}, {shift_y})")
        return aligned
        
    except Exception as e:
        logger.error(f"Face alignment failed: {str(e)}")
        return image

def detect_face_landmarks(image: np.ndarray) -> dict:
    """
    Detect face landmarks (eyes, nose, mouth)
    Returns coordinates for precise alignment
    """
    try:
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Load Haar Cascades
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        
        # Detect face
        faces = face_cascade.detectMultiScale(gray, 1.1, 5)
        
        if len(faces) == 0:
            return {"success": False, "message": "No face detected"}
        
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = face
        
        # Detect eyes within face region
        roi_gray = gray[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 5)
        
        landmarks = {
            "success": True,
            "face": {"x": x, "y": y, "width": w, "height": h},
            "face_center": {"x": x + w//2, "y": y + h//2},
            "eyes": [],
            "head_size": w * h
        }
        
        for (ex, ey, ew, eh) in eyes[:2]:  # Get first 2 eyes
            landmarks["eyes"].append({
                "x": x + ex + ew//2,
                "y": y + ey + eh//2,
                "width": ew,
                "height": eh
            })
        
        return landmarks
        
    except Exception as e:
        logger.error(f"Face landmark detection failed: {str(e)}")
        return {"success": False, "message": str(e)}
