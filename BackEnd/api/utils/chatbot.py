import json
import random
import re
from pathlib import Path


INTENTS_PATH = Path(__file__).parent / "intents.json"


class SimpleIntentBot:
    def __init__(self) -> None:
        with open(INTENTS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.intents = data.get("intents", [])

    def respond(self, text: str) -> str:
        normalized = text.strip().lower()
        best = None
        for intent in self.intents:
            for pattern in intent.get("patterns", []):
                p = pattern.strip().lower()
                if not p:
                    continue
                # simple containment match for now
                if p in normalized:
                    best = intent
                    break
            if best:
                break

        if not best:
            # fallback to no-response intent or default
            best = next((i for i in self.intents if i.get("tag") in ("no-response", "default")), None)

        responses = (best or {}).get("responses", ["I'm here to listen."])
        return random.choice(responses) if responses else "I'm here to listen."


bot = SimpleIntentBot()


