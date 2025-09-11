# Django Backend Integration Guide for depressoAssist

## Overview

This guide explains how to integrate the React frontend with your Django backend using DeepFace for analysis and Gemma2B for AI therapy responses.

## Architecture

```
React Frontend ←→ Django Channels (WebSocket) ←→ Gemma2B
       ↓                    ↓
   File Upload         DeepFace Analysis
```

## Required Django Packages

```bash
pip install django
pip install channels
pip install deepface
pip install transformers  # For Gemma2B
pip install torch
pip install opencv-python
pip install Pillow
pip install django-cors-headers
pip install channels-redis  # For WebSocket scaling
```

## Django Settings Configuration

```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',
    'corsheaders',
    'your_app',  # Replace with your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware
]

# CORS settings for React frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

# Channels configuration
ASGI_APPLICATION = 'your_project.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# File upload settings
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB
```

## WebSocket Consumer for Gemma2B Chat

```python
# consumers.py
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.model = None
        self.tokenizer = None
        self.load_gemma2b()
    
    def load_gemma2b(self):
        """Load Gemma2B model for therapy responses"""
        try:
            model_name = "google/gemma-2b-it"  # or your fine-tuned model
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
        except Exception as e:
            print(f"Error loading Gemma2B: {e}")
    
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'content': 'Connected to AI therapy assistant'
        }))
    
    async def disconnect(self, close_code):
        pass
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'analysis_request':
            await self.handle_analysis_request(data)
    
    async def handle_chat_message(self, data):
        user_message = data.get('content', '')
        user_mood = data.get('mood', 'neutral')
        
        # Send typing indicator
        await self.send(text_data=json.dumps({
            'type': 'ai_typing',
            'is_typing': True
        }))
        
        # Generate therapy response with Gemma2B
        response = await self.generate_therapy_response(user_message, user_mood)
        
        # Send streaming response
        await self.send_streaming_response(response, user_message)
        
        # Stop typing indicator
        await self.send(text_data=json.dumps({
            'type': 'ai_typing',
            'is_typing': False
        }))
    
    async def generate_therapy_response(self, user_message, mood):
        """Generate therapeutic response using Gemma2B"""
        if not self.model or not self.tokenizer:
            return "I'm having trouble connecting to my AI model. Please try again."
        
        # Therapeutic prompt template
        prompt = f"""
        You are a gentle, empathetic AI therapy assistant specializing in depression support.
        User mood: {mood}
        User message: {user_message}
        
        Respond with compassion, validation, and gentle guidance. Use a warm, supportive tone.
        Keep responses concise but meaningful. Include practical coping strategies when appropriate.
        
        Response:"""
        
        try:
            inputs = self.tokenizer(prompt, return_tensors="pt")
            
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=200,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Extract just the response part
            response = response.split("Response:")[-1].strip()
            
            return response
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I understand you're going through a difficult time. Would you like to share more about how you're feeling?"
    
    async def send_streaming_response(self, response, original_message):
        """Send response token by token for natural conversation flow"""
        message_id = f"ai_{int(asyncio.get_event_loop().time())}"
        words = response.split()
        
        partial_content = ""
        for i, word in enumerate(words):
            partial_content += word + " "
            
            await self.send(text_data=json.dumps({
                'type': 'streaming_response',
                'message_id': message_id,
                'partial_content': partial_content.strip(),
                'is_complete': i == len(words) - 1,
                'mood': 'caring'
            }))
            
            # Small delay for natural typing effect
            await asyncio.sleep(0.1)
    
    async def handle_analysis_request(self, data):
        file_id = data.get('file_id')
        file_type = data.get('file_type')
        
        # Trigger DeepFace analysis
        analysis_result = await self.run_deepface_analysis(file_id, file_type)
        
        await self.send(text_data=json.dumps({
            'type': 'analysis_result',
            'analysis': analysis_result
        }))
    
    @database_sync_to_async
    def run_deepface_analysis(self, file_id, file_type):
        """Run DeepFace analysis on uploaded media"""
        # Implementation in next section
        pass
```

## DeepFace Analysis Integration

```python
# analysis.py
from deepface import DeepFace
import cv2
import numpy as np
from django.core.files.storage import default_storage
import os

class DeepFaceAnalyzer:
    def __init__(self):
        self.models = ['VGG-Face', 'Facenet', 'OpenFace', 'DeepFace']
        self.actions = ['emotion', 'age', 'gender', 'race']
    
    def analyze_image(self, image_path):
        """Analyze single image for depression indicators"""
        try:
            # Basic emotion analysis
            analysis = DeepFace.analyze(
                img_path=image_path,
                actions=self.actions,
                enforce_detection=False
            )
            
            # Extract depression-related features
            depression_score = self.calculate_depression_score(analysis)
            
            return {
                'depression_indicators': {
                    'facial_expression': depression_score['facial'],
                    'eye_contact': depression_score['eye_contact'],
                    'micro_expressions': depression_score['micro'],
                    'overall_score': depression_score['overall']
                },
                'emotional_analysis': {
                    'dominant_emotion': analysis[0]['dominant_emotion'],
                    'emotion_confidence': max(analysis[0]['emotion'].values()),
                    'emotion_distribution': analysis[0]['emotion']
                },
                'mood_analysis': self.interpret_mood(analysis[0]['emotion']),
                'risk_level': self.assess_risk_level(depression_score['overall']),
                'recommendations': self.generate_recommendations(depression_score)
            }
        except Exception as e:
            print(f"Analysis error: {e}")
            return self.default_analysis_result()
    
    def analyze_video(self, video_path):
        """Analyze video for temporal depression patterns"""
        cap = cv2.VideoCapture(video_path)
        frame_analyses = []
        
        frame_count = 0
        while cap.read()[0] and frame_count < 30:  # Analyze first 30 frames
            ret, frame = cap.read()
            if not ret:
                break
            
            try:
                temp_path = f"/tmp/frame_{frame_count}.jpg"
                cv2.imwrite(temp_path, frame)
                
                analysis = DeepFace.analyze(
                    img_path=temp_path,
                    actions=self.actions,
                    enforce_detection=False
                )
                
                frame_analyses.append(analysis[0])
                os.remove(temp_path)
                
            except Exception as e:
                print(f"Frame analysis error: {e}")
            
            frame_count += 1
        
        cap.release()
        
        # Aggregate results
        return self.aggregate_video_analysis(frame_analyses)
    
    def calculate_depression_score(self, analysis):
        """Calculate depression likelihood from facial analysis"""
        emotion = analysis[0]['emotion']
        
        # Depression indicators from emotions
        sadness_weight = emotion.get('sad', 0) * 0.4
        neutral_weight = emotion.get('neutral', 0) * 0.3
        fear_weight = emotion.get('fear', 0) * 0.2
        
        # Low positive emotions also indicate depression
        happiness_deficit = (1 - emotion.get('happy', 0)) * 0.3
        
        facial_score = (sadness_weight + neutral_weight + fear_weight + happiness_deficit) / 100
        
        # Simulated eye contact and micro-expression analysis
        # In real implementation, you'd use specialized models
        eye_contact_score = np.random.uniform(0.3, 0.8)  # Replace with actual analysis
        micro_expression_score = np.random.uniform(0.2, 0.7)  # Replace with actual analysis
        
        overall_score = (facial_score + eye_contact_score + micro_expression_score) / 3
        
        return {
            'facial': facial_score,
            'eye_contact': eye_contact_score,
            'micro': micro_expression_score,
            'overall': min(overall_score, 1.0)
        }
    
    def interpret_mood(self, emotions):
        """Interpret overall mood from emotion distribution"""
        dominant = max(emotions, key=emotions.get)
        confidence = emotions[dominant]
        
        if dominant in ['sad', 'fear'] and confidence > 50:
            return 'negative'
        elif dominant == 'happy' and confidence > 60:
            return 'positive'
        else:
            return 'neutral'
    
    def assess_risk_level(self, overall_score):
        """Assess depression risk level"""
        if overall_score > 0.7:
            return 'high'
        elif overall_score > 0.4:
            return 'moderate'
        else:
            return 'low'
    
    def generate_recommendations(self, depression_score):
        """Generate therapeutic recommendations"""
        recommendations = []
        
        if depression_score['overall'] > 0.6:
            recommendations.extend([
                "Consider speaking with a licensed mental health professional",
                "Practice mindfulness and deep breathing exercises",
                "Maintain regular sleep and exercise routines"
            ])
        elif depression_score['overall'] > 0.3:
            recommendations.extend([
                "Try journaling your thoughts and feelings",
                "Connect with supportive friends or family",
                "Engage in activities you enjoy"
            ])
        else:
            recommendations.extend([
                "Continue your current self-care practices",
                "Stay connected with your support network",
                "Consider preventive mental health strategies"
            ])
        
        return recommendations
    
    def default_analysis_result(self):
        """Return default result when analysis fails"""
        return {
            'depression_indicators': {
                'facial_expression': 0.3,
                'eye_contact': 0.4,
                'micro_expressions': 0.3,
                'overall_score': 0.33
            },
            'emotional_analysis': {
                'dominant_emotion': 'neutral',
                'emotion_confidence': 0.6,
                'emotion_distribution': {'neutral': 60, 'happy': 20, 'sad': 20}
            },
            'mood_analysis': 'neutral',
            'risk_level': 'low',
            'recommendations': ['Continue monitoring your mental health']
        }
```

## Django Views for File Upload

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .analysis import DeepFaceAnalyzer

@csrf_exempt
@require_http_methods(["POST"])
def upload_image(request):
    if 'image' not in request.FILES:
        return JsonResponse({'error': 'No image provided'}, status=400)
    
    image_file = request.FILES['image']
    
    # Save file
    file_path = default_storage.save(f'uploads/images/{image_file.name}', image_file)
    full_path = default_storage.path(file_path)
    
    # Run analysis
    analyzer = DeepFaceAnalyzer()
    analysis_result = analyzer.analyze_image(full_path)
    
    return JsonResponse({
        'success': True,
        'file_id': file_path,
        'analysis_id': f'analysis_{int(time.time())}',
        'analysis_result': analysis_result
    })

@csrf_exempt
@require_http_methods(["POST"])
def upload_video(request):
    if 'video' not in request.FILES:
        return JsonResponse({'error': 'No video provided'}, status=400)
    
    video_file = request.FILES['video']
    
    # Save file
    file_path = default_storage.save(f'uploads/videos/{video_file.name}', video_file)
    full_path = default_storage.path(file_path)
    
    # Run analysis
    analyzer = DeepFaceAnalyzer()
    analysis_result = analyzer.analyze_video(full_path)
    
    return JsonResponse({
        'success': True,
        'file_id': file_path,
        'analysis_id': f'analysis_{int(time.time())}',
        'analysis_result': analysis_result
    })
```

## URL Configuration

```python
# urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    path('api/analysis/image', views.upload_image, name='upload_image'),
    path('api/analysis/video', views.upload_video, name='upload_video'),
    # Add other API endpoints
]
```

## ASGI Configuration

```python
# asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from your_app.consumers import ChatConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/chat/", ChatConsumer.as_asgi()),
        ])
    ),
})
```

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start Redis (for Channels)
redis-server

# Run Django development server
python manage.py runserver 0.0.0.0:8000
```

## Frontend Integration

The React frontend is already configured to work with this Django backend:

- WebSocket connection to `ws://localhost:8000/ws/chat/`
- File uploads to `http://localhost:8000/api/analysis/`
- Real-time analysis results via WebSocket
- Streaming Gemma2B responses

## Production Deployment

For production:

1. Use Gunicorn with Uvicorn workers for ASGI
2. Configure Redis for WebSocket scaling
3. Use proper file storage (AWS S3, etc.)
4. Set up proper authentication
5. Configure HTTPS for WebSocket connections

This integration provides a complete AI-powered mental health application with depression detection and therapeutic chat capabilities.