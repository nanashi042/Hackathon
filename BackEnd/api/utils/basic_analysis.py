"""
Basic Emotion Analysis without any external dependencies
Pure Python implementation for demo purposes
"""

import os
import json
from typing import Any, Dict

class BasicEmotionAnalyzer:
    """Basic emotion analyzer with no external dependencies"""
    
    def __init__(self):
        """Initialize the basic analyzer"""
        self.emotion_keys = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        print("✅ Basic emotion analyzer initialized (no dependencies)")
    
    def extract_emotions_image(self, img_path: str) -> Dict[str, float]:
        """ 
        Extract emotions from an image using basic file analysis.
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
        
        # Generate emotions based on file characteristics
        emotions = self._generate_emotions_from_file(img_path, file_size)
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
    
    def _generate_emotions_from_file(self, file_path: str, file_size: int) -> Dict[str, float]:
        """Generate emotions based on file characteristics"""
        # Use file size and name to create variation
        filename = os.path.basename(file_path)
        
        # Create hash-like value from filename for consistency
        filename_hash = sum(ord(c) for c in filename) % 100
        size_factor = (file_size % 1000) / 1000.0
        
        # Combine factors for emotion generation
        base_factor = (filename_hash / 100.0 + size_factor) / 2.0
        
        # Generate emotions with some variation
        emotions = {
            'angry': max(0.01, 0.08 - base_factor * 0.05),
            'disgust': max(0.01, 0.04 - base_factor * 0.02),
            'fear': max(0.01, 0.06 - base_factor * 0.03),
            'happy': max(0.1, 0.25 + base_factor * 0.15),
            'sad': max(0.05, 0.15 - base_factor * 0.08),
            'surprise': max(0.02, 0.08 + base_factor * 0.05),
            'neutral': max(0.3, 0.45 - base_factor * 0.1)
        }
        
        # Normalize to sum to approximately 1
        total = sum(emotions.values())
        return {k: v / total for k, v in emotions.items()}
    
    def predict_depression(self, emotions: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict depression risk using basic emotion analysis.
        """
        # Simple heuristic based on emotion patterns
        sad_score = emotions.get('sad', 0.0)
        fear_score = emotions.get('fear', 0.0)
        happy_score = emotions.get('happy', 0.0)
        angry_score = emotions.get('angry', 0.0)
        neutral_score = emotions.get('neutral', 0.0)
        
        # Calculate risk indicators
        negative_emotions = sad_score + fear_score + (angry_score * 0.7)
        positive_emotions = happy_score + (neutral_score * 0.3)
        
        # Risk score calculation
        if positive_emotions > 0:
            risk_ratio = negative_emotions / (negative_emotions + positive_emotions)
        else:
            risk_ratio = 1.0  # High risk if no positive emotions
        
        # Determine diagnosis
        if risk_ratio > 0.7:
            diagnosis = "high_risk"
            confidence = risk_ratio
        elif risk_ratio > 0.4:
            diagnosis = "moderate_risk"
            confidence = risk_ratio
        else:
            diagnosis = "low_risk"
            confidence = 1.0 - risk_ratio
        
        return {
            "diagnosis": diagnosis,
            "confidence": confidence
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
        # For basic analyzer, treat video same as image
        emotions = self.extract_emotions_image(file_path)
        depression = self.predict_depression(emotions)
        
        return {
            "type": "video",
            "file_path": file_path,
            "emotions": emotions,
            **depression
        }

# Create a global instance
basic_analyzer = BasicEmotionAnalyzer()
