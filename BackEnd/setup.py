#!/usr/bin/env python3
"""
Setup script for depressoAssist backend
Installs all required dependencies and downloads DeepFace models
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Setting up depressoAssist Backend")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install basic dependencies
    if not run_command("pip install --upgrade pip", "Upgrading pip"):
        return
    
    # Install requirements
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return
    
    # Download DeepFace models
    print("\n🤖 Downloading DeepFace models...")
    try:
        from deepface import DeepFace
        print("Building emotion recognition model...")
        DeepFace.build_model("Emotion")
        print("✅ Emotion model downloaded")
        
        print("Building face detection model...")
        DeepFace.build_model("Facenet")
        print("✅ Face detection model downloaded")
        
    except Exception as e:
        print(f"⚠️ Error downloading DeepFace models: {e}")
        print("Models will be downloaded on first use")
    
    # Create necessary directories
    os.makedirs("media/uploads/images", exist_ok=True)
    os.makedirs("media/uploads/videos", exist_ok=True)
    print("✅ Created media directories")
    
    # Run Django migrations
    if not run_command("python manage.py migrate", "Running Django migrations"):
        return
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo start the server, run:")
    print("python manage.py runserver")
    print("\nTo test DeepFace, run:")
    print("python test_deepface.py")

if __name__ == "__main__":
    main()
