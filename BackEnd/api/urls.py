# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('analysis/image/', views.upload_image, name='upload_image'),
    path('analysis/video/', views.upload_video, name='upload_video'),
    path('diagnose/', views.diagnose_api, name='diagnose'),
    path('chat/intent/', views.chat_intent, name='chat_intent'),
    path('chat/generate/', views.chat_generate, name='chat_generate'),
]
