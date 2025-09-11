# api/utils/inference.py
import joblib
import os

# Load once when server starts
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "depression_model.pkl")
VEC_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "emotion_encoder.pkl")

try:
    clf = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
except Exception as e:
    print(f"Error loading diagnosis model: {e}")
    clf, vectorizer = None, None

def diagnose_text(user_text: str):
    """Diagnose depression/anxiety likelihood from user text"""
    if not clf or not vectorizer:
        return {"error": "Model not loaded"}

    vec = vectorizer.transform([user_text])
    prediction = clf.predict(vec)[0]
    confidence = float(clf.predict_proba(vec).max())

    return {
        "diagnosis": str(prediction),   # e.g., "no_risk", "moderate", "severe"
        "confidence": confidence
    }
