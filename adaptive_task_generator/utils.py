# adaptive_task_generator/utils.py
import pandas as pd
import random
import json

def load_dataset(path):
    """
    Load dataset csv safely (skip bad lines if necessary).
    """
    df = pd.read_csv(path, encoding="utf-8", on_bad_lines="skip")
    # Clean/normalize columns we expect
    # Some CSV variants may have whitespace column names
    df.columns = [c.strip() for c in df.columns]
    return df

def skill_to_difficulty(skill_level):
    mapping = {
        "Beginner": [1, 2],
        "Intermediate": [3],
        "Advanced": [4, 5]
    }
    return mapping.get(skill_level, [1, 2])

def filter_questions(df, skill_level, sample_n=3):
    """
    Return a small sample (as dict list) of questions for the given skill_level.
    """
    diffs = skill_to_difficulty(skill_level)
    filtered = df[df['difficulty'].isin(diffs)]
    if filtered.empty:
        # fallback: random sample from full df
        filtered = df
    sample_n = min(sample_n, len(filtered))
    sampled = filtered.sample(sample_n)
    # convert to dicts
    records = []
    for _, row in sampled.iterrows():
        rec = {
            "question": str(row.get("question", "")).strip(),
            "starter_code": str(row.get("starter_code", "")).strip(),
            "input_output": str(row.get("input_output", "")).strip(),
            "difficulty": int(row.get("difficulty", 0)) if pd.notna(row.get("difficulty", None)) else None,
            "url": str(row.get("url", "")).strip()
        }
        records.append(rec)
    return records

def build_prompt(skill_level, question_samples):
    """
    Build a prompt for Gemini using a few sample questions.
    """
    samples_text = ""
    for i, s in enumerate(question_samples, 1):
        samples_text += f"Sample {i}:\nQ: {s['question']}\nStarter code:\n{s['starter_code']}\nInput/Output: {s['input_output']}\nDifficulty: {s['difficulty']}\n\n"

    prompt = f"""
You are an expert Python coding tutor that must generate a *new* programming task inspired by the examples below.
Student skill level: {skill_level}

{samples_text}

Requirements for the generated task:
- Produce a concise problem statement.
- Provide starter code scaffold (if helpful).
- Provide 3 input/output test cases (or a list of testcases).
- Provide constraints and expected complexity if relevant.
- Make the task unique (do NOT copy the examples verbatim) and aligned in difficulty to the student's level.

Return the result in JSON with keys:
"title", "description", "starter_code", "testcases" (list of {{"input": "...", "output": "..."}}), "notes"
"""
    return prompt
