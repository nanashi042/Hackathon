from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.utils.inference import diagnose_text
from api.utils.remedies import personalize_remedies
from api.utils.analysis import DeepFaceAnalyzer
from django.core.files.storage import default_storage
from api.utils.chatbot import bot
from api.utils.gemma import gemma

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

    analyzer = DeepFaceAnalyzer()
    analysis_result = analyzer.analyze_image(full_path)
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
    except Exception:
        advice = None

    return Response({
        'success': True,
        'file_id': file_path,
        'analysis_result': analysis_result,
        'advice': advice
    })


@api_view(['POST'])
def upload_video(request):
    if 'video' not in request.FILES:
        return Response({'error': 'No video provided'}, status=400)
    
    video_file = request.FILES['video']
    file_path = default_storage.save(f'uploads/videos/{video_file.name}', video_file)
    full_path = default_storage.path(file_path)

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
def chat_intent(request):
    text = request.data.get('text', '')
    reply = bot.respond(text or "")
    return Response({"reply": reply})


@api_view(['POST'])
def chat_generate(request):
    text = request.data.get('text', '')
    if not text:
        return Response({"error": "No text provided"}, status=400)
    try:
        output = gemma.generate(text)
        return Response({"reply": output})
    except Exception as e:
        # Fallback to intent bot if generator is unavailable
        return Response({"reply": bot.respond(text), "fallback": True})
