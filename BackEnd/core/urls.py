from django.contrib import admin
from django.urls import path, include
# from django.core import views
urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include('api.urls')),  # all REST endpoints in api app
]
