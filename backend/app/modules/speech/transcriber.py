from faster_whisper import WhisperModel
import tempfile
import os

print("Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="float32")
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
        # 💡 FIX: faster-whisper returns a (segments, info) tuple
        segments, info = model.transcribe(tmp_path, language="en")

        # 💡 FIX: segments is a generator, loop through to stitch the string
        text_segments = []
        last_end_time = 0.0
        
        for segment in segments:
            text_segments.append(segment.text)
            last_end_time = segment.end  # Tracking the final timestamp for duration

        transcript = "".join(text_segments).strip()

        return {
            "transcript":       transcript,
            "duration_seconds": round(last_end_time, 2)
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