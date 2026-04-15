import whisper
import tempfile
import os

print("Loading Whisper model...")
model = whisper.load_model("base")
print("✅ Whisper model loaded")


def transcribe(audio_bytes: bytes) -> dict:
    """
    Takes raw audio bytes, saves to temp file,
    runs Whisper transcription, returns transcript.
    """

    # Save bytes to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path, language="en", fp16=False)

        transcript = result["text"].strip()
        duration   = result.get("segments", [{}])[-1].get("end", 0.0)

        return {
            "transcript": transcript,
            "duration_seconds": round(duration, 2)
        }

    except Exception as e:
        print(f"Whisper transcription error: {e}")
        return {
            "transcript":       "",
            "duration_seconds": 0.0
        }

    finally:
        # Always clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)