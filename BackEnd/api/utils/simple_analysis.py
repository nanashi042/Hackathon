"""
Simple Emotion Analysis without DeepFace dependencies
Provides fallback emotion detection for demo purposes
"""

import os
from typing import Any, Dict
import joblib

class SimpleEmotionAnalyzer:
    """Simple emotion analyzer that works without DeepFace"""
    
    def __init__(self, clf_path: str = None):
        """
        Initialize the analyzer.
        :param clf_path: Path to a trained depression model (.pkl)
        """
        self.clf = None
        self.emotion_keys = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        
        # Try to load the depression model if available
        if clf_path is None:
            clf_path = os.path.join(os.path.dirname(__file__), "..", "models", "depression_model.pkl")
        
        if os.path.exists(clf_path):
            try:
                self.clf = joblib.load(clf_path)
                print(f"✅ Loaded depression model from {clf_path}")
            except Exception as e:
                print(f"⚠️ Could not load depression model: {e}")
        else:
            print(f"⚠️ Depression model not found at {clf_path}")
    
    def extract_emotions_image(self, img_path: str) -> Dict[str, float]:
        """
        Extract emotions from an image using fallback method.
        """
        print(f"📸 Analyzing image: {img_path}")
        
        # Check if file exists
        if not os.path.exists(img_path):
            print(f"⚠️ Image file not found: {img_path}")
            return self._get_default_emotions()
        
        # Check file size
        file_size = os.path.getsize(img_path)
        if file_size == 0:
            print(f"⚠️ Image file is empty: {img_path}")
            return self._get_default_emotions()
        
        print(f"📊 File size: {file_size} bytes")
        
        # For demo purposes, return varied emotions based on file size
        # This simulates different emotion patterns
        emotions = self._get_varied_emotions(file_size)
        print(f"🎭 Generated emotions: {emotions}")
        
        return emotions
    
    def _get_default_emotions(self) -> Dict[str, float]:
        """Get default neutral emotions"""
        return {
            'angry': 0.05,
            'disgust': 0.02,
            'fear': 0.03,
            'happy': 0.15,
            'sad': 0.10,
            'surprise': 0.05,
            'neutral': 0.60
        }
    
    def _get_varied_emotions(self, file_size: int) -> Dict[str, float]:
        """Generate varied emotions based on file size for demo"""
        # Use file size to create some variation
        size_factor = (file_size % 1000) / 1000.0
        
        emotions = {
            'angry': max(0.01, 0.1 - size_factor * 0.08),
            'disgust': max(0.01, 0.05 - size_factor * 0.03),
            'fear': max(0.01, 0.08 - size_factor * 0.05),
            'happy': max(0.1, 0.3 + size_factor * 0.1),
            'sad': max(0.05, 0.2 - size_factor * 0.1),
            'surprise': max(0.02, 0.1 + size_factor * 0.05),
            'neutral': max(0.3, 0.5 - size_factor * 0.1)
        }
        
        # Normalize to sum to 1
        total = sum(emotions.values())
        return {k: v / total for k, v in emotions.items()}
    
    def predict_depression(self, emotions: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict depression risk using the trained model or fallback.
        """
        if self.clf is not None:
            try:
                import numpy as np
                features = np.array(list(emotions.values())).reshape(1, -1)
                pred = self.clf.predict(features)[0]
                conf = float(self.clf.predict_proba(features).max())
                return {"diagnosis": pred, "confidence": conf}
            except Exception as e:
                print(f"⚠️ Model prediction failed: {e}")
        
        # Fallback prediction based on emotion patterns
        return self._fallback_depression_prediction(emotions)
    
    def _fallback_depression_prediction(self, emotions: Dict[str, float]) -> Dict[str, Any]:
        """Fallback depression prediction based on emotion ratios"""
        # Simple heuristic: higher sad/fear, lower happy = higher risk
        sad_score = emotions.get('sad', 0.0)
        fear_score = emotions.get('fear', 0.0)
        happy_score = emotions.get('happy', 0.0)
        angry_score = emotions.get('angry', 0.0)
        
        # Calculate risk score
        risk_score = (sad_score + fear_score + angry_score * 0.5) - (happy_score * 0.8)
        risk_score = max(0, min(1, risk_score))  # Clamp between 0 and 1
        
        # Determine diagnosis
        if risk_score > 0.7:
            diagnosis = "high_risk"
        elif risk_score > 0.4:
            diagnosis = "moderate_risk"
        else:
            diagnosis = "low_risk"
        
        return {
            "diagnosis": diagnosis,
            "confidence": risk_score
        }
    
    def analyze_image(self, file_path: str) -> Dict[str, Any]:
        """
        Analyze an image for emotions and depression risk.
        """
        emotions = self.extract_emotions_image(file_path)
        depression = self.predict_depression(emotions)
        
        return {
            "type": "image",
            "file_path": file_path,
            "emotions": emotions,
            **depression
        }
    
    def analyze_video(self, file_path: str) -> Dict[str, Any]:
        """
        Analyze a video for emotions and depression risk.
        """
        # For simplicity, treat video same as image for now
        emotions = self.extract_emotions_image(file_path)
        depression = self.predict_depression(emotions)
        
        return {
            "type": "video",
            "file_path": file_path,
            "emotions": emotions,
            **depression
        }

# Create a global instance for easy import
simple_analyzer = SimpleEmotionAnalyzer()
