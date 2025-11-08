#!/usr/bin/env python3
"""
DeepFace Diagnostic Script
Tests DeepFace installation and emotion detection capabilities
"""

import os
import sys
import numpy as np
from PIL import Image

def test_imports():
    """Test if required packages are installed"""
    print("Testing imports...")
    try:
        import tensorflow as tf
        print(f"✅ TensorFlow {tf.__version__} installed")
    except ImportError as e:
        print(f"❌ TensorFlow not installed: {e}")
        return False
    
    try:
        from deepface import DeepFace
        print(f"✅ DeepFace imported successfully")
    except ImportError as e:
        print(f"❌ DeepFace not installed: {e}")
        return False
    
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__} installed")
    except ImportError as e:
        print(f"❌ OpenCV not installed: {e}")
        return False
    
    return True

def create_test_image():
    """Create a simple test image with a face-like pattern"""
    # Create a simple colored rectangle as test image
    img = Image.new('RGB', (200, 200), color='white')
    img.save('test_image.jpg')
    print("✅ Created test_image.jpg")
    return 'test_image.jpg'

def test_deepface_emotion_detection(image_path):
    """Test DeepFace emotion detection"""
    print(f"\nTesting DeepFace emotion detection on {image_path}...")
    
    try:
        from deepface import DeepFace
        
        # Test basic analysis
        print("Running DeepFace.analyze...")
        result = DeepFace.analyze(
            image_path, 
            actions=['emotion'], 
            enforce_detection=False,
            detector_backend='opencv'
        )
        
        print(f"✅ DeepFace analysis successful!")
        print(f"Result type: {type(result)}")
        
        if isinstance(result, list):
            result = result[0]
        
        if 'emotion' in result:
            emotions = result['emotion']
            print(f"Detected emotions: {emotions}")
            
            # Check if we got valid emotion scores
            total_score = sum(emotions.values())
            print(f"Total emotion score: {total_score}")
            
            if total_score > 0:
                print("✅ Emotion detection working!")
                return True
            else:
                print("⚠️ Emotion scores are all zero")
                return False
        else:
            print("❌ No emotion data in result")
            print(f"Available keys: {list(result.keys())}")
            return False
            
    except Exception as e:
        print(f"❌ DeepFace emotion detection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_real_face_image():
    """Test with a more realistic face-like image"""
    print("\nTesting with enhanced test image...")
    
    # Create a more face-like test image
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    img.fill(255)  # White background
    
    # Draw simple face features
    cv2 = __import__('cv2')
    
    # Face outline (circle)
    cv2.circle(img, (150, 150), 100, (200, 180, 160), -1)
    
    # Eyes
    cv2.circle(img, (130, 130), 10, (0, 0, 0), -1)
    cv2.circle(img, (170, 130), 10, (0, 0, 0), -1)
    
    # Nose
    cv2.line(img, (150, 140), (150, 160), (100, 80, 60), 3)
    
    # Mouth (smile)
    cv2.ellipse(img, (150, 180), (20, 10), 0, 0, 180, (100, 80, 60), 2)
    
    cv2.imwrite('face_test.jpg', img)
    print("✅ Created face_test.jpg")
    
    return test_deepface_emotion_detection('face_test.jpg')

def main():
    """Main diagnostic function"""
    print("🔍 DeepFace Diagnostic Tool")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Missing dependencies. Install with:")
        print("pip install deepface tensorflow opencv-python")
        return
    
    # Create test image
    test_img = create_test_image()
    
    # Test emotion detection
    success = test_deepface_emotion_detection(test_img)
    
    if not success:
        print("\n🔧 Trying with face-like image...")
        success = test_with_real_face_image()
    
    if success:
        print("\n✅ DeepFace emotion detection is working!")
        print("The issue might be with specific image formats or content.")
    else:
        print("\n❌ DeepFace emotion detection is not working.")
        print("Try the following solutions:")
        print("1. Reinstall deepface: pip uninstall deepface && pip install deepface")
        print("2. Download models manually:")
        print("   python -c 'from deepface import DeepFace; DeepFace.build_model(\"Emotion\")'")
        print("3. Check TensorFlow GPU compatibility if using GPU")
    
    # Cleanup
    for file in ['test_image.jpg', 'face_test.jpg']:
        if os.path.exists(file):
            os.remove(file)
            print(f"🧹 Cleaned up {file}")

if __name__ == "__main__":
    main()
