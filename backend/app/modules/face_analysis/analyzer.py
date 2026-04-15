import cv2
import numpy as np
from deepface import DeepFace


def analyze_frame(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes from webcam frame,
    runs DeepFace emotion analysis,
    returns dominant emotion and all scores.
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return _empty_response()

        # Run DeepFace analysis
        result = DeepFace.analyze(
            img_path        = frame,
            actions         = ["emotion"],
            enforce_detection = False    # don't crash if no face detected
        )

        # DeepFace returns a list
        if isinstance(result, list):
            result = result[0]

        emotions         = result["emotion"]
        dominant_emotion = result["dominant_emotion"]

        # Normalize scores to 0-1 range
        total  = sum(emotions.values())
        normalized = {k: round(v / total, 3) for k, v in emotions.items()}

        dominant_score = normalized[dominant_emotion]

        if dominant_score > 0.5:
            confidence = "high"
        elif dominant_score > 0.3:
            confidence = "medium"
        else:
            confidence = "low"

        return {
            "dominant_emotion": dominant_emotion,
            "emotion_scores":   normalized,
            "confidence_level": confidence
        }

    except Exception as e:
        print(f"DeepFace error: {e}")
        return _empty_response()


def get_emotion_summary(emotion_list: list) -> dict:
    """
    Summarizes emotions recorded during one answer.
    Input: ["neutral", "neutral", "happy", "fearful"]
    """
    if not emotion_list:
        return {
            "dominant_emotion":  "neutral",
            "emotion_counts":    {},
            "emotion_timeline":  [],
            "confidence_reading": "no data"
        }

    emotion_counts = {}
    for emotion in emotion_list:
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1

    dominant = max(emotion_counts, key=emotion_counts.get)

    confidence_map = {
        "happy":     "confident",
        "neutral":   "calm",
        "surprised": "engaged",
        "fearful":   "nervous",
        "angry":     "stressed",
        "disgusted": "uncomfortable",
        "sad":       "low confidence"
    }

    return {
        "dominant_emotion":  dominant,
        "emotion_counts":    emotion_counts,
        "emotion_timeline":  emotion_list,
        "confidence_reading": confidence_map.get(dominant, "neutral")
    }


def _empty_response() -> dict:
    return {
        "dominant_emotion": "neutral",
        "emotion_scores":   {
            "happy": 0.0, "neutral": 1.0, "surprised": 0.0,
            "fearful": 0.0, "angry": 0.0, "disgusted": 0.0, "sad": 0.0
        },
        "confidence_level": "low"
    }