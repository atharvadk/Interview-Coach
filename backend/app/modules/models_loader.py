"""
Centralized model loader for all ML components.
Loads models once, caches them, and applies optimizations.
"""

import os
import torch
import language_tool_python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer

# ── Device Configuration ──────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧 Using device: {DEVICE}")

if DEVICE.type == "cpu":
    # Limit CPU threads for efficiency
    torch.set_num_threads(4)

# ── Global Model Cache ────────────────────────────────────────────────────────
_models_cache = {
    "tokenizer": None,
    "generator": None,
    "similarity_model": None,
    "grammar_tool": None
}


def get_tokenizer():
    """Get or load tokenizer (cached)."""
    if _models_cache["tokenizer"] is None:
        print("Loading Flan-T5 tokenizer...")
        _models_cache["tokenizer"] = AutoTokenizer.from_pretrained("google/flan-t5-large")
    return _models_cache["tokenizer"]


def get_flan_t5_model():
    """Get or load Flan-T5 model with optional int8 quantization (cached)."""
    if _models_cache["generator"] is None:
        print("Loading Flan-T5 model...")
        try:
            # Try int8 quantization if GPU is available
            if DEVICE.type == "cuda":
                print("  Loading with int8 quantization (GPU available)...")
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    "google/flan-t5-large",
                    load_in_8bit=True,
                    device_map="auto"
                )
            else:
                # CPU mode: load full precision on CPU
                print("  Loading on CPU (quantization not available)...")
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    "google/flan-t5-large"
                )
                model = model.to(DEVICE)
        except Exception as e:
            print(f"  Warning: Could not load with preferred settings ({e}), loading standard model...")
            model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
            model = model.to(DEVICE)
        
        model.eval()
        _models_cache["generator"] = model
    return _models_cache["generator"]


def get_similarity_model():
    """Get or load SentenceTransformer (cached)."""
    if _models_cache["similarity_model"] is None:
        print("Loading SentenceTransformer model...")
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        model.to(DEVICE)
        _models_cache["similarity_model"] = model
    return _models_cache["similarity_model"]


def get_grammar_tool():
    """Get or load grammar tool (cached)."""
    if _models_cache["grammar_tool"] is None:
        print("Loading grammar tool...")
        _models_cache["grammar_tool"] = language_tool_python.LanguageTool("en-US")
    return _models_cache["grammar_tool"]


def cleanup_models():
    """Clear model cache (for development/testing)."""
    for key in _models_cache:
        _models_cache[key] = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


print("✅ Models loader initialized (all models will load on first use)")
