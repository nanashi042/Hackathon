import os
from typing import Dict
from dotenv import load_dotenv
load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Install with: pip install google-generativeai")


class GeminiGenerator:
    def __init__(self, model_name: str = None, api_key: str = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not GEMINI_AVAILABLE:
            raise ImportError("google-generativeai is required. Install with: pip install google-generativeai")
        if not self.api_key:
            raise EnvironmentError("GEMINI_API_KEY is not set")
        genai.configure(api_key=self.api_key)
        if model_name:
            self.model_name = model_name
        else:
            try:
                available = genai.list_models()
                self.model_name = next(
                    (m.name for m in available if "generateContent" in m.supported_generation_methods),
                    "gemini-1.5-flash",
                )
            except Exception:
                self.model_name = "gemini-1.5-flash"
        self.client = genai.GenerativeModel(self.model_name)

    def generate(self, prompt: str, max_length: int = 300, temperature: float = 0.7, top_p: float = 0.95, do_sample: bool = True) -> str:
        try:
            generation_config = {"temperature": float(temperature), "top_p": float(top_p)}
            response = self.client.generate_content(prompt, generation_config=generation_config)
            text = getattr(response, "text", None) or "".join(getattr(response, "candidates", []) or [])
            return text.strip() or ""
        except Exception as e:
            print(f"Gemini generation error: {e}")
            return "I'm sorry, I'm having trouble generating a response right now. Please try again."

    def generate_emotion_advice(self, emotions: Dict[str, float], diagnosis: str) -> str:
        emotion_str = ", ".join([f"{k}: {v:.2f}" for k, v in emotions.items() if v > 0.1])
        prompt = (
            "You are a warm, supportive assistant. "
            f"Emotions detected: {emotion_str}. Depression risk: {diagnosis}. "
            "Write 2-3 short, practical, non-clinical suggestions in a gentle tone."
        )
        return self.generate(prompt, max_length=200, temperature=0.8)

    def generate_chat_response(self, user_message: str) -> str:
        prompt = (
            "You are an empathetic assistant. Keep responses concise and supportive.\n"
            f"User: {user_message}\nAssistant:"
        )
        return self.generate(prompt, max_length=200, temperature=0.7)


try:
    gemma = GeminiGenerator()
    print("✅ Gemini runtime loaded successfully")
except Exception as e:
    print(f"❌ Failed to initialize Gemini runtime: {e}")

    class FallbackGenerator:
        def generate(self, prompt: str) -> str:
            return "I'm currently unavailable. Please ensure GEMINI_API_KEY is set and the service is reachable."

        def generate_emotion_advice(self, emotions: Dict[str, float], diagnosis: str) -> str:
            return "I'm here to support you. Please try again later."

        def generate_chat_response(self, user_message: str) -> str:
            return "I'm currently unavailable. Please try again later."

    gemma = FallbackGenerator()
