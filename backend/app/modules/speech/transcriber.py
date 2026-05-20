from faster_whisper import WhisperModel
import tempfile
import os
import subprocess

print("Loading Whisper model...")
try:
    model = WhisperModel("base", device="cpu", compute_type="float32")
    print("✅ Whisper model loaded")
except Exception as e:
    print(f"❌ Whisper model load failed: {e}")
    model = None


def _convert_to_wav(input_path: str, output_path: str) -> bool:
    """Convert audio to wav using ffmpeg if available."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path],
            capture_output=True,
            timeout=30
        )
        return result.returncode == 0
    except Exception as e:
        print(f"ffmpeg conversion failed: {e}")
        return False


def transcribe(audio_bytes: bytes) -> dict:
    """
    Takes raw audio bytes, saves to temp file,
    runs Whisper transcription, returns transcript.
    """
    if model is None:
        return {"transcript": "", "duration_seconds": 0.0}

    if not audio_bytes or len(audio_bytes) < 100:
        return {"transcript": "", "duration_seconds": 0.0}

    tmp_path = None
    wav_path = None

    try:
        # Save bytes to a temporary webm file
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Try converting to wav first for better compatibility
        wav_path = tmp_path.replace(".webm", ".wav")
        converted = _convert_to_wav(tmp_path, wav_path)

        # Use wav if conversion succeeded, otherwise use original
        transcribe_path = wav_path if converted else tmp_path

        segments, info = model.transcribe(
            transcribe_path,
            language="en",
            beam_size=5,
            vad_filter=True,           # filter out silence
            vad_parameters=dict(
                min_silence_duration_ms=500
            )
        )

        text_segments = []
        last_end_time = 0.0

        for segment in segments:
            text_segments.append(segment.text)
            last_end_time = segment.end

        transcript = " ".join(text_segments).strip()

        return {
            "transcript":       transcript,
            "duration_seconds": round(last_end_time, 2)
        }

    except Exception as e:
        print(f"Whisper transcription error: {e}")
        # Return empty instead of raising — frontend handles this
        return {
            "transcript":       "",
            "duration_seconds": 0.0
        }

    finally:
        # Always clean up temp files
        for path in [tmp_path, wav_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass