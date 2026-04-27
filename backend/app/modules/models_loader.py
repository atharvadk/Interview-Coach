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
# Fix: Check for CUDA availability more robustly
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🔧 Using device: {DEVICE}")

if DEVICE.type == "cpu":
    # Limit CPU threads to prevent system freeze during inference
    torch.set_num_threads(4)

# ── Global Model Cache ────────────────────────────────────────────────────────
_models_cache = {
    "tokenizer": None,
    "generator": None,
    "similarity_model": None,
    "grammar_tool": None
}

# Use "base" instead of "large" for stable local/CPU performance
MODEL_NAME = "google/flan-t5-base" 

def get_tokenizer():
    """Get or load tokenizer (cached)."""
    if _models_cache["tokenizer"] is None:
        print(f"Loading Flan-T5 tokenizer ({MODEL_NAME})...")
        _models_cache["tokenizer"] = AutoTokenizer.from_pretrained(MODEL_NAME)
    return _models_cache["tokenizer"]


def get_flan_t5_model():
    """Get or load Flan-T5 model with error recovery (cached)."""
    if _models_cache["generator"] is None:
        print(f"Loading Flan-T5 model ({MODEL_NAME})...")
        try:
            if DEVICE.type == "cuda":
                print("  Attempting GPU load with 8-bit quantization...")
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    MODEL_NAME,
                    load_in_8bit=True,
                    device_map="auto"
                )
            else:
                print("  Loading on CPU...")
                model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
                model = model.to(DEVICE)
        except Exception as e:
            # Fallback: If 8-bit or GPU fail, force standard CPU load
            print(f"  🚨 Model Load Failed ({e}). Falling back to standard CPU load...")
            model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
            model = model.to("cpu")
        
        model.eval()
        _models_cache["generator"] = model
    return _models_cache["generator"]


def get_similarity_model():
    """Get or load SentenceTransformer (cached)."""
    if _models_cache["similarity_model"] is None:
        print("Loading SentenceTransformer model...")
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        # Ensure model actually moved to the correct device
        model = model.to(DEVICE)
        _models_cache["similarity_model"] = model
    return _models_cache["similarity_model"]


def get_grammar_tool():
    """Get or load grammar tool (cached)."""
    if _models_cache["grammar_tool"] is None:
        print("Loading grammar tool...")
        # Local instances of LanguageTool can be memory intensive; ensure it's singleton
        _models_cache["grammar_tool"] = language_tool_python.LanguageTool("en-US")
    return _models_cache["grammar_tool"]


def cleanup_models():
    """Clear model cache and free memory."""
    for key in _models_cache:
        _models_cache[key] = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    print("🧹 Model cache cleared.")

print("✅ Models loader initialized (all models will load on first use)")