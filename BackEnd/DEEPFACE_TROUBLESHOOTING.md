# DeepFace Emotion Detection Troubleshooting Guide

## Issue: DeepFace not recognizing emotions from images

### Quick Diagnosis

1. **Run the diagnostic script:**
   ```bash
   python test_deepface.py
   ```

2. **Check if dependencies are installed:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the setup script:**
   ```bash
   python setup.py
   ```

### Common Issues and Solutions

#### 1. DeepFace Not Installed
**Error:** `ModuleNotFoundError: No module named 'deepface'`

**Solution:**
```bash
pip install deepface==0.0.79
```

#### 2. TensorFlow Issues
**Error:** TensorFlow compatibility issues

**Solution:**
```bash
pip install tensorflow==2.15.0
# Or for CPU-only version:
pip install tensorflow-cpu==2.15.0
```

#### 3. OpenCV Issues
**Error:** OpenCV not found or version conflicts

**Solution:**
```bash
pip install opencv-python==4.8.1.78
```

#### 4. Models Not Downloaded
**Error:** DeepFace models not found

**Solution:**
```python
from deepface import DeepFace
DeepFace.build_model("Emotion")
DeepFace.build_model("Facenet")
```

#### 5. No Face Detected
**Error:** All emotion scores are 0

**Possible causes:**
- Image doesn't contain a clear face
- Face is too small or blurred
- Lighting issues
- Face angle or occlusion

**Solutions:**
- Use `enforce_detection=False` (already implemented)
- Try different detector backends:
  ```python
  result = DeepFace.analyze(img_path, 
                           actions=['emotion'], 
                           enforce_detection=False,
                           detector_backend='opencv')  # or 'mtcnn', 'retinaface'
  ```

#### 6. Memory Issues
**Error:** Out of memory during analysis

**Solution:**
- Reduce image size before analysis
- Use CPU-only TensorFlow
- Process images in smaller batches

#### 7. File Path Issues
**Error:** File not found or permission denied

**Solution:**
- Ensure file exists and is readable
- Check file permissions
- Use absolute paths

### Testing Your Setup

1. **Basic Import Test:**
   ```python
   from deepface import DeepFace
   import tensorflow as tf
   print("✅ All imports successful")
   ```

2. **Simple Image Test:**
   ```python
   from deepface import DeepFace
   result = DeepFace.analyze("path/to/image.jpg", actions=['emotion'], enforce_detection=False)
   print(result)
   ```

3. **Model Download Test:**
   ```python
   from deepface import DeepFace
   model = DeepFace.build_model("Emotion")
   print("✅ Emotion model loaded")
   ```

### Alternative Solutions

If DeepFace continues to fail, consider these alternatives:

#### 1. Use Pre-computed Emotion Values
```python
def fallback_emotion_analysis(image_path):
    """Fallback emotion analysis for demo purposes"""
    return {
        'angry': 0.1,
        'disgust': 0.05,
        'fear': 0.1,
        'happy': 0.3,
        'sad': 0.2,
        'surprise': 0.1,
        'neutral': 0.15
    }
```

#### 2. Use Online Emotion API
```python
import requests

def online_emotion_analysis(image_path):
    """Use external emotion analysis API"""
    # Example with Azure Cognitive Services or Google Vision API
    # Implementation depends on chosen service
    pass
```

#### 3. Simplified Analysis
```python
def simple_image_analysis(image_path):
    """Basic image analysis without emotion detection"""
    from PIL import Image
    import numpy as np
    
    img = Image.open(image_path)
    # Basic brightness/contrast analysis
    brightness = np.mean(img)
    
    # Simple heuristic based on brightness
    if brightness < 100:
        return {'mood': 'darker', 'confidence': 0.7}
    else:
        return {'mood': 'brighter', 'confidence': 0.7}
```

### Debug Mode

Enable detailed logging in your Django settings:

```python
# In settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### Performance Optimization

1. **Pre-load models:**
   ```python
   # In your app startup
   from deepface import DeepFace
   emotion_model = DeepFace.build_model("Emotion")
   ```

2. **Image preprocessing:**
   ```python
   def preprocess_image(image_path):
       from PIL import Image
       img = Image.open(image_path)
       # Resize if too large
       if img.width > 1024 or img.height > 1024:
           img.thumbnail((1024, 1024))
           img.save(image_path)
   ```

3. **Caching results:**
   ```python
   import hashlib
   import json
   
   def get_cached_analysis(image_path):
       # Create hash of image
       with open(image_path, 'rb') as f:
           image_hash = hashlib.md5(f.read()).hexdigest()
       
       # Check cache
       cache_file = f"cache/{image_hash}.json"
       if os.path.exists(cache_file):
           with open(cache_file, 'r') as f:
               return json.load(f)
       return None
   ```

### Contact and Support

If issues persist:
1. Check DeepFace GitHub issues: https://github.com/serengil/deepface/issues
2. Verify TensorFlow installation: https://www.tensorflow.org/install
3. Test with different images (clear face, good lighting)
4. Consider using Docker for consistent environment
