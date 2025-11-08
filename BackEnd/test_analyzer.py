#!/usr/bin/env python3
"""
Test script for DeepFaceAnalyzer with fallback
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.utils.analysis import DeepFaceAnalyzer

def test_analyzer():
    """Test the analyzer with fallback emotions"""
    print("🧪 Testing DeepFaceAnalyzer...")
    
    try:
        # Initialize analyzer
        analyzer = DeepFaceAnalyzer()
        print("✅ Analyzer initialized successfully")
        
        # Test fallback emotions
        fallback_emotions = analyzer._fallback_emotions()
        print(f"✅ Fallback emotions: {fallback_emotions}")
        
        # Test depression prediction
        depression_result = analyzer.predict_depression(fallback_emotions)
        print(f"✅ Depression prediction: {depression_result}")
        
        # Test full analysis (will use fallback if DeepFace not available)
        print("\n📸 Testing image analysis with fallback...")
        
        # Create a dummy image path for testing
        dummy_path = "test_dummy.jpg"
        
        # Test emotion extraction
        emotions = analyzer.extract_emotions_image(dummy_path)
        print(f"✅ Extracted emotions: {emotions}")
        
        # Test full analysis
        analysis = analyzer.analyze_image(dummy_path)
        print(f"✅ Full analysis result: {analysis}")
        
        print("\n🎉 All tests passed! The analyzer is working with fallback emotions.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_analyzer()
    sys.exit(0 if success else 1)
