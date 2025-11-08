#!/usr/bin/env python3
"""
Test script for BasicEmotionAnalyzer
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.utils.basic_analysis import BasicEmotionAnalyzer

def test_basic_analyzer():
    """Test the basic analyzer"""
    print("🧪 Testing BasicEmotionAnalyzer...")
    
    try:
        # Initialize analyzer
        analyzer = BasicEmotionAnalyzer()
        print("✅ Basic analyzer initialized successfully")
        
        # Test default emotions
        default_emotions = analyzer._get_default_emotions()
        print(f"✅ Default emotions: {default_emotions}")
        
        # Test depression prediction
        depression_result = analyzer.predict_depression(default_emotions)
        print(f"✅ Depression prediction: {depression_result}")
        
        # Test image analysis with dummy path
        print("\n📸 Testing image analysis...")
        dummy_path = "test_dummy.jpg"
        
        analysis = analyzer.analyze_image(dummy_path)
        print(f"✅ Full analysis result:")
        print(f"   - Type: {analysis['type']}")
        print(f"   - Emotions: {analysis['emotions']}")
        print(f"   - Diagnosis: {analysis['diagnosis']}")
        print(f"   - Confidence: {analysis['confidence']:.3f}")
        
        print("\n🎉 All tests passed! The basic analyzer is working.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_basic_analyzer()
    sys.exit(0 if success else 1)
