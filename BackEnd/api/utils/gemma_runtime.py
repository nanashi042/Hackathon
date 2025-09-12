"""
Lightweight Gemma ONNX Runtime for Production Inference

This module provides fast, efficient inference using a pre-trained Gemma ONNX model.
Replaces the heavy training script with a production-ready runtime.
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
import numpy as np

try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("Warning: onnxruntime not available. Install with: pip install onnxruntime")

try:
    from transformers import AutoTokenizer
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: transformers not available. Install with: pip install transformers")


class GemmaONNXGenerator:
    """
    Lightweight Gemma generator using ONNX runtime for fast inference.
    """
    
    def __init__(self, model_path: Optional[str] = None, tokenizer_path: Optional[str] = None):
        """
        Initialize the ONNX-based Gemma generator.
        
        Args:
            model_path: Path to the ONNX model file
            tokenizer_path: Path to the tokenizer (if different from model_path)
        """
        if not ONNX_AVAILABLE:
            raise ImportError("onnxruntime is required. Install with: pip install onnxruntime")
        if not TRANSFORMERS_AVAILABLE:
            raise ImportError("transformers is required. Install with: pip install transformers")
        
        # Set default paths
        if model_path is None:
            models_dir = Path(__file__).resolve().parents[1] / "models"
            model_path = models_dir / "gemma2b_deepface.onnx"
        
        if tokenizer_path is None:
            tokenizer_path = Path(__file__).resolve().parents[1] / "models"
        
        self.model_path = Path(model_path)
        self.tokenizer_path = Path(tokenizer_path)
        
        # Initialize components
        self._load_tokenizer()
        self._load_onnx_model()
        
    def _load_tokenizer(self):
        """Load the tokenizer from the model directory."""
        try:
            # Try to load from the model directory first
            if (self.tokenizer_path / "tokenizer.json").exists():
                self.tokenizer = AutoTokenizer.from_pretrained(str(self.tokenizer_path))
            else:
                # Fallback to a compatible tokenizer
                print("Warning: Using fallback tokenizer. For best results, save tokenizer with the model.")
                self.tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
                
            # Ensure PAD token exists
            if self.tokenizer.pad_token is None:
                if self.tokenizer.eos_token is not None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                else:
                    self.tokenizer.add_special_tokens({"pad_token": "[PAD]"})
                    
        except Exception as e:
            print(f"Error loading tokenizer: {e}")
            # Ultimate fallback
            self.tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def _load_onnx_model(self):
        """Load the ONNX model for inference."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"ONNX model not found: {self.model_path}")
        
        try:
            # Configure ONNX runtime for optimal performance
            providers = ['CPUExecutionProvider']
            if ort.get_available_providers():
                if 'CUDAExecutionProvider' in ort.get_available_providers():
                    providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
                elif 'DmlExecutionProvider' in ort.get_available_providers():
                    providers = ['DmlExecutionProvider', 'CPUExecutionProvider']
            
            self.session = ort.InferenceSession(str(self.model_path), providers=providers)
            self.input_name = self.session.get_inputs()[0].name
            self.output_name = self.session.get_outputs()[0].name
            
        except Exception as e:
            raise RuntimeError(f"Failed to load ONNX model: {e}")
    
    def generate(self, prompt: str, max_length: int = 100, temperature: float = 0.7, 
                top_p: float = 0.9, do_sample: bool = True) -> str:
        """
        Generate text using the ONNX model.
        
        Args:
            prompt: Input text prompt
            max_length: Maximum length of generated text
            temperature: Sampling temperature (higher = more random)
            top_p: Nucleus sampling parameter
            do_sample: Whether to use sampling
            
        Returns:
            Generated text
        """
        try:
            # Tokenize input
            inputs = self.tokenizer(
                prompt,
                return_tensors="np",
                padding=True,
                truncation=True,
                max_length=512  # Reasonable input limit
            )
            
            input_ids = inputs["input_ids"].astype(np.int64)
            attention_mask = inputs["attention_mask"].astype(np.int64)
            
            # Generate tokens iteratively
            generated_ids = input_ids.copy()
            
            for _ in range(max_length - input_ids.shape[1]):
                # Prepare inputs for ONNX model
                onnx_inputs = {
                    self.input_name: generated_ids
                }
                
                # Run ONNX inference
                outputs = self.session.run([self.output_name], onnx_inputs)
                logits = outputs[0]
                
                # Get next token probabilities
                next_token_logits = logits[0, -1, :]  # Last token logits
                
                if do_sample:
                    # Apply temperature and top-p sampling
                    next_token_logits = next_token_logits / temperature
                    
                    # Top-p filtering
                    sorted_logits = np.sort(next_token_logits)[::-1]
                    cumulative_probs = np.cumsum(np.exp(sorted_logits))
                    cutoff = np.where(cumulative_probs >= top_p)[0]
                    if len(cutoff) > 0:
                        next_token_logits[next_token_logits < sorted_logits[cutoff[0]]] = -float('inf')
                    
                    # Sample from the filtered distribution
                    probs = np.exp(next_token_logits - np.max(next_token_logits))
                    probs = probs / np.sum(probs)
                    next_token = np.random.choice(len(probs), p=probs)
                else:
                    # Greedy decoding
                    next_token = np.argmax(next_token_logits)
                
                # Stop if we hit EOS token
                if next_token == self.tokenizer.eos_token_id:
                    break
                
                # Append new token
                new_token = np.array([[next_token]], dtype=np.int64)
                generated_ids = np.concatenate([generated_ids, new_token], axis=1)
            
            # Decode generated text
            generated_text = self.tokenizer.decode(generated_ids[0], skip_special_tokens=True)
            
            # Remove the original prompt from the output
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            
            return generated_text
            
        except Exception as e:
            print(f"Error during generation: {e}")
            return "I'm sorry, I'm having trouble generating a response right now. Please try again."
    
    def generate_emotion_advice(self, emotions: Dict[str, float], diagnosis: str) -> str:
        """
        Generate personalized advice based on emotion analysis and diagnosis.
        
        Args:
            emotions: Dictionary of emotion scores
            diagnosis: Depression risk diagnosis
            
        Returns:
            Generated advice text
        """
        # Create a structured prompt for emotion-based advice
        emotion_str = ", ".join([f"{k}: {v:.2f}" for k, v in emotions.items() if v > 0.1])
        prompt = f"Emotions detected: {emotion_str}. Depression risk: {diagnosis}. Provide supportive, practical advice:"
        
        return self.generate(prompt, max_length=150, temperature=0.8)
    
    def generate_chat_response(self, user_message: str) -> str:
        """
        Generate a conversational response to user input.
        
        Args:
            user_message: User's message
            
        Returns:
            Generated response
        """
        # Create a conversational prompt
        prompt = f"User: {user_message}\nAssistant:"
        
        return self.generate(prompt, max_length=100, temperature=0.7)


# Global instance for easy import
try:
    gemma = GemmaONNXGenerator()
    print("✅ Gemma ONNX runtime loaded successfully")
except Exception as e:
    print(f"❌ Failed to load Gemma ONNX runtime: {e}")
    # Create a fallback generator that returns helpful messages
    class FallbackGenerator:
        def generate(self, prompt: str) -> str:
            return "I'm currently unavailable. Please ensure the Gemma ONNX model is properly set up."
        
        def generate_emotion_advice(self, emotions: Dict[str, float], diagnosis: str) -> str:
            return "I'm here to support you. Please try again later."
        
        def generate_chat_response(self, user_message: str) -> str:
            return "I'm currently unavailable. Please try again later."
    
    gemma = FallbackGenerator()
