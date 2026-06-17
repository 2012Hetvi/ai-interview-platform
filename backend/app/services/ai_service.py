"""
AI Service
----------
Central place where every call to the Claude API happens. Each function
asks the model to return STRICT JSON so the rest of the app can parse the
result reliably (score, feedback, verdict, etc).
"""
import json
import re
from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = settings.GROQ_MODEL

def _extract_json(text: str) -> dict:
    """Claude sometimes wraps JSON in prose/fences - pull the object out safely."""
    text = text.strip()
    text = re.sub(r"^```json|^```|```$", "", text, flags=re.MULTILINE).strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)
    return json.loads(text)


def _ask_json(system_prompt: str, user_prompt: str, max_tokens: int = 1024) -> dict:
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    raw_text = response.choices[0].message.content
    return _extract_json(raw_text)


# ------------------------------------------------------------------
# MOCK INTERVIEW
# ------------------------------------------------------------------
def generate_interview_question(role: str, history: list[dict]) -> str:
    """history = [{question, answer}, ...] already asked in this session."""
    system_prompt = (
        "You are a senior technical interviewer conducting a realistic mock "
        "interview. Ask exactly one clear, focused interview question at a "
        "time, appropriate for the target role. Do not repeat earlier "
        "questions. Respond ONLY in JSON: {\"question\": \"...\"}"
    )
    history_text = "\n".join(
        f"Q: {h['question']}\nA: {h.get('answer') or '(not yet answered)'}"
        for h in history
    ) or "(no questions asked yet - ask the opening question)"

    user_prompt = (
        f"Target role: {role}\n\n"
        f"Conversation so far:\n{history_text}\n\n"
        "Ask the next interview question."
    )
    result = _ask_json(system_prompt, user_prompt, max_tokens=300)
    return result["question"]


def evaluate_interview_answer(role: str, question: str, answer: str) -> dict:
    system_prompt = (
        "You are an expert interview coach. Evaluate the candidate's answer "
        "to an interview question for the given role. Be specific and "
        "constructive. Respond ONLY in JSON with this exact shape: "
        '{"score": <0-10 number>, "feedback": "<2-4 sentences, specific, '
        'actionable>", "strengths": "<short phrase>", '
        '"improvement_area": "<short phrase>"}'
    )
    user_prompt = (
        f"Target role: {role}\nQuestion: {question}\nCandidate answer: {answer}"
    )
    return _ask_json(system_prompt, user_prompt, max_tokens=500)


def evaluate_full_interview(role: str, qa_pairs: list[dict]) -> dict:
    system_prompt = (
        "You are a senior hiring manager summarizing a completed mock "
        "interview. Give an honest overall assessment. Respond ONLY in "
        'JSON: {"overall_score": <0-10 number>, "overall_feedback": '
        '"<4-6 sentences summarizing performance, key strengths, and the '
        'top 2 things to improve before the real interview>"}'
    )
    transcript = "\n\n".join(
        f"Q{i+1}: {qa['question']}\nA{i+1}: {qa['answer']}\nScore: {qa.get('score')}"
        for i, qa in enumerate(qa_pairs)
    )
    user_prompt = f"Target role: {role}\n\nFull transcript:\n{transcript}"
    return _ask_json(system_prompt, user_prompt, max_tokens=600)


# ------------------------------------------------------------------
# CODING / DSA
# ------------------------------------------------------------------
def evaluate_code_submission(title: str, description: str, language: str, code: str) -> dict:
    system_prompt = (
        "You are a senior software engineer reviewing a coding interview "
        "submission. Check correctness against the problem description, "
        "and assess time/space efficiency. Respond ONLY in JSON: "
        '{"correctness_score": <0-10>, "efficiency_score": <0-10>, '
        '"verdict": "Accepted" | "Needs Improvement" | "Incorrect", '
        '"feedback": "<specific feedback: bugs, edge cases missed, '
        'complexity analysis, and one concrete suggestion to improve>"}'
    )
    user_prompt = (
        f"Problem: {title}\nDescription: {description}\n"
        f"Language: {language}\nCandidate code:\n```{language}\n{code}\n```"
    )
    return _ask_json(system_prompt, user_prompt, max_tokens=700)


# ------------------------------------------------------------------
# BEHAVIORAL
# ------------------------------------------------------------------
def evaluate_behavioral_answer(question: str, answer: str) -> dict:
    system_prompt = (
        "You are an HR interview coach evaluating a behavioral answer using "
        "the STAR method (Situation, Task, Action, Result). Respond ONLY in "
        'JSON: {"score": <0-10>, "feedback": "<2-4 sentences on STAR '
        'structure, clarity, and impact>", "star_coverage": "<which STAR '
        'elements were present/missing>"}'
    )
    user_prompt = f"Question: {question}\nCandidate answer: {answer}"
    return _ask_json(system_prompt, user_prompt, max_tokens=500)
