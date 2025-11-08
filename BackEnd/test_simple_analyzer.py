#!/usr/bin/env python3
"""
Test script for SimpleEmotionAnalyzer
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.utils.simple_analysis import SimpleEmotionAnalyzer

def test_simple_analyzer():
    """Test the simple analyzer"""
    print("🧪 Testing SimpleEmotionAnalyzer...")
    
    try:
        # Initialize analyzer
        analyzer = SimpleEmotionAnalyzer()
        print("✅ Simple analyzer initialized successfully")
        
        # Test fallback emotions
        fallback_emotions = analyzer._get_default_emotions()
        print(f"✅ Default emotions: {fallback_emotions}")
        
        # Test depression prediction
        depression_result = analyzer.predict_depression(fallback_emotions)
        print(f"✅ Depression prediction: {depression_result}")
        
        # Test image analysis with dummy path
        print("\n📸 Testing image analysis...")
        dummy_path = "test_dummy.jpg"
        
        analysis = analyzer.analyze_image(dummy_path)
        print(f"✅ Full analysis result: {analysis}")
        
        print("\n🎉 All tests passed! The simple analyzer is working.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_simple_analyzer()
    sys.exit(0 if success else 1)
