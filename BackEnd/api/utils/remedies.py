import json

# Load remedies JSON
with open("api/utils/remedies.json", "r") as f:
    REMEDIES = json.load(f)

def personalize_remedies(user_text: str, diagnosis: str):
    """Return empathetic, actionable suggestions without external model deps.

    - Pulls baseline tips from remedies.json using diagnosis key if present
    - Prepends a brief empathetic intro tailored to the diagnosis
    """
    baseline = REMEDIES.get(diagnosis, [])
    intro_map = {
        "severe": "I'm really glad you reached out. Let's take small, gentle steps together.",
        "moderate": "Thanks for sharing. Here are a few practices that many find helpful.",
        "mild": "A few light habits can make a meaningful difference over time.",
    }
    intro = intro_map.get(str(diagnosis).lower(), "Here are supportive tips you can try at your own pace.")
    if not baseline:
        baseline = [
            "Practice a brief grounding exercise (5-4-3-2-1).",
            "Step outside or near a window for fresh air and light.",
            "Message a trusted person to check in.",
            "Drink water and have a small, nourishing snack.",
            "Plan one gentle activity you enjoy (music, walk, journaling).",
        ]

    return {
        "intro": intro,
        "suggestions": baseline,
    }
