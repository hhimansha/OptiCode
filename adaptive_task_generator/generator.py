# adaptive_task_generator/generator.py
import json
from .utils import load_dataset, filter_questions, build_prompt, build_prompt as build_prompt_name
from .gemini_client import generate_with_fallback

# load dataset once
DATA_PATH = "adaptive_task_generator/dataset/train.csv"
_df = load_dataset(DATA_PATH)

def generate_task_for_skill(skill_level: str):
    samples = filter_questions(_df, skill_level, sample_n=3)
    prompt = build_prompt_name(skill_level, samples)
    raw = generate_with_fallback(prompt)
    # raw may be a JSON string (if fallback) or large text from Gemini
    # Attempt to parse JSON out of the response; if not possible, return raw text.
    try:
        # if raw is JSON object; keep as dict
        parsed = json.loads(raw)
        return parsed
    except Exception:
        # return raw text inside a dict
        return {"raw_task_text": raw}
