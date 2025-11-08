from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.utils.inference import diagnose_text
from api.utils.remedies import personalize_remedies
from django.core.files.storage import default_storage
from api.utils.gemma_runtime import gemma

# Try to import analyzers in order of preference
try:
    from api.utils.analysis import DeepFaceAnalyzer
    ANALYZER_AVAILABLE = True
    print("✅ Using DeepFace analyzer")
except ImportError as e:
    print(f"⚠️ DeepFace not available: {e}")
    try:
        from api.utils.simple_analysis import SimpleEmotionAnalyzer as DeepFaceAnalyzer
        ANALYZER_AVAILABLE = True
        print("✅ Using simple emotion analyzer")
    except ImportError as e2:
        print(f"⚠️ Simple analyzer not available: {e2}")
        try:
            from api.utils.basic_analysis import BasicEmotionAnalyzer as DeepFaceAnalyzer
            ANALYZER_AVAILABLE = True
            print("✅ Using basic emotion analyzer")
        except ImportError as e3:
            print(f"❌ No analyzer available: {e3}")
            ANALYZER_AVAILABLE = False

@api_view(['POST'])
def diagnose_api(request):
    """
    Combined endpoint: diagnose from text + return Gemma2B remedies
    """
    user_text = request.data.get('text', '')
    if not user_text:
        return Response({"error": "No text provided"}, status=400)
    
    # 1️⃣ Diagnosis
    diagnosis_result = diagnose_text(user_text)
    if "error" in diagnosis_result:
        return Response(diagnosis_result, status=500)
    
    # 2️⃣ Gemma2B Remedies
    remedies = personalize_remedies(user_text, diagnosis_result["diagnosis"])
    
    # 3️⃣ Return combined result
    return Response({
        "diagnosis": diagnosis_result["diagnosis"],
        "confidence": diagnosis_result["confidence"],
        "remedies": remedies
    })


@api_view(['POST'])
def upload_image(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)
    
    image_file = request.FILES['image']
    file_path = default_storage.save(f'uploads/images/{image_file.name}', image_file)
    full_path = default_storage.path(file_path)

    try:
        if not ANALYZER_AVAILABLE:
            raise Exception("No emotion analyzer available")
            
        analyzer = DeepFaceAnalyzer()
        analysis_result = analyzer.analyze_image(full_path)
        
        # Log analysis results for debugging
        print(f"Analysis result: {analysis_result}")
        
        # Generate supportive advice using Gemma based on analysis
        try:
            summary = (
                f"Emotions: {analysis_result.get('emotions', {})}. "
                f"Diagnosis: {analysis_result.get('diagnosis', 'unknown')} "
                f"(confidence {analysis_result.get('confidence', 0.0):.2f})."
            )
            advice = gemma.generate(
                "A user uploaded an image. Based on this summary, write a short, warm, 2-3 sentence, practical guidance without medical claims: " + summary
            )
        except Exception as e:
            print(f"Error generating advice: {e}")
            advice = "I'm here to support you. Please take care of yourself and consider reaching out to a trusted person or professional if you need additional support."

        return Response({
            'success': True,
            'file_id': file_path,
            'analysis_result': analysis_result,
            'advice': advice
        })
        
    except FileNotFoundError as e:
        print(f"Model file not found: {e}")
        return Response({
            'success': False,
            'error': 'Analysis model not available',
            'file_id': file_path,
            'analysis_result': {
                'type': 'image',
                'file_path': file_path,
                'emotions': {'angry': 0.0, 'disgust': 0.0, 'fear': 0.0, 'happy': 0.0, 'sad': 0.0, 'surprise': 0.0, 'neutral': 1.0},
                'diagnosis': 'unknown',
                'confidence': 0.0
            },
            'advice': 'I understand you shared an image with me. While I cannot analyze it right now, please know that your feelings are valid and important. Consider speaking with someone you trust about how you\'re feeling.'
        }, status=200)
        
    except Exception as e:
        print(f"Error in upload_image: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': f'Analysis failed: {str(e)}',
            'file_id': file_path
        }, status=500)


@api_view(['POST'])
def upload_video(request):
    if 'video' not in request.FILES:
        return Response({'error': 'No video provided'}, status=400)
    
    video_file = request.FILES['video']
    file_path = default_storage.save(f'uploads/videos/{video_file.name}', video_file)
    full_path = default_storage.path(file_path)

    if not ANALYZER_AVAILABLE:
        return Response({
            'success': False,
            'error': 'No emotion analyzer available',
            'file_id': file_path
        }, status=500)
        
    analyzer = DeepFaceAnalyzer()
    analysis_result = analyzer.analyze_video(full_path)
    # Generate supportive advice using Gemma based on analysis
    try:
        summary = (
            f"Emotions: {analysis_result.get('emotions', {})}. "
            f"Diagnosis: {analysis_result.get('diagnosis', 'unknown')} "
            f"(confidence {analysis_result.get('confidence', 0.0):.2f})."
        )
        advice = gemma.generate(
            "A user uploaded a video. Based on this summary, write a short, warm, 2-3 sentence, practical guidance without medical claims: " + summary
        )
    except Exception:
        advice = None

    return Response({
        'success': True,
        'file_id': file_path,
        'analysis_result': analysis_result,
        'advice': advice
    })




@api_view(['POST'])
def chat_generate(request):
    text = request.data.get('text', '')
    if not text:
        return Response({"error": "No text provided"}, status=400)
    try:
        output = gemma.generate(text)
        return Response({"reply": output})
    except Exception as e:
        return Response({"error": f"Generation failed: {str(e)}"}, status=500)
    
def home(request):
    return HttpResponse("SUP Bhadwo")
