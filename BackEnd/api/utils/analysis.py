"""
DeepFaceAnalyzer for real emotion-based depression detection.

Replaces the stub with:
1. Image and video emotion extraction using DeepFace
2. Depression prediction using a trained classifier
3. Handles video frame sampling for faster processing
"""

from typing import Any, Dict
import numpy as np
import cv2
from deepface import DeepFace
import joblib
import os

class DeepFaceAnalyzer:
    def __init__(self, clf_path: str = None):
        """
        Initialize the analyzer.
        :param clf_path: Path to a trained depression model (.pkl)
        """
        if clf_path is None:
            clf_path = os.path.join(os.path.dirname(__file__), "..", "models", "depression_model.pkl")
        if not os.path.exists(clf_path):
            raise FileNotFoundError(f"Depression model not found: {clf_path}")
        self.clf = joblib.load(clf_path)
        self.emotion_keys = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

    def extract_emotions_image(self, img_path: str) -> Dict[str, float]:
        """
        Extract emotions from an image.
        """
        try:
            result = DeepFace.analyze(img_path, actions=['emotion'], enforce_detection=False)
            return {k: float(result['emotion'].get(k, 0.0)) for k in self.emotion_keys}
        except Exception as e:
            print(f"Error analyzing image {img_path}: {e}")
            return {k: 0.0 for k in self.emotion_keys}

    def extract_emotions_video(self, video_path: str, frame_skip: int = 30) -> Dict[str, float]:
        """
        Extract averaged emotions from a video by sampling frames.
        :param frame_skip: Analyze every `frame_skip` frames
        """
        cap = cv2.VideoCapture(video_path)
        emotions_accum = []
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            if frame_count % frame_skip != 0:
                continue
            try:
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                emotions_accum.append([float(result['emotion'].get(k, 0.0)) for k in self.emotion_keys])
            except:
                continue

        cap.release()
        if emotions_accum:
            avg_emotions = np.mean(emotions_accum, axis=0)
            return dict(zip(self.emotion_keys, avg_emotions))
        else:
            return {k: 0.0 for k in self.emotion_keys}

    def predict_depression(self, emotions: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict depression risk using the trained model.
        :param emotions: Dict of emotion probabilities
        """
        features = np.array(list(emotions.values())).reshape(1, -1)
        try:
            pred = self.clf.predict(features)[0]
            conf = float(self.clf.predict_proba(features).max())
        except:
            pred, conf = "unknown", 0.0
        return {"diagnosis": pred, "confidence": conf}

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
        emotions = self.extract_emotions_video(file_path)
        depression = self.predict_depression(emotions)
        return {
            "type": "video",
            "file_path": file_path,
            "emotions": emotions,
            **depression
        }


# Example usage
if __name__ == "__main__":
    analyzer = DeepFaceAnalyzer()
    print(analyzer.analyze_image("test_image.jpg"))
    print(analyzer.analyze_video("test_video.mp4"))
