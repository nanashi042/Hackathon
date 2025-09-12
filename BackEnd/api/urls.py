# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('analysis/image/', views.upload_image, name='upload_image'),
    path('analysis/video/', views.upload_video, name='upload_video'),
    path('diagnose/', views.diagnose_api, name='diagnose'),
    path('', views.home, name='home'),
    path('chat/generate/', views.chat_generate, name='chat_generate'),
]
