from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ---------- AUTH ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_role: Optional[str] = None
    experience_level: Optional[str] = "fresher"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    target_role: Optional[str]
    experience_level: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- MOCK INTERVIEW ----------
class InterviewStart(BaseModel):
    role: str
    mode: str = "text"          # "text" or "voice"


class InterviewAnswer(BaseModel):
    interview_id: int
    qa_id: int
    answer_text: str


class InterviewQAOut(BaseModel):
    id: int
    question_text: str
    answer_text: Optional[str]
    ai_feedback: Optional[str]
    score: Optional[float]
    sequence_no: int

    class Config:
        from_attributes = True


class InterviewOut(BaseModel):
    id: int
    role: str
    mode: str
    status: str
    overall_score: Optional[float]
    overall_feedback: Optional[str]
    started_at: datetime
    qa_pairs: List[InterviewQAOut] = []

    class Config:
        from_attributes = True


# ---------- CODING ----------
class CodingQuestionOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str
    sample_input: Optional[str]
    sample_output: Optional[str]
    constraints_text: Optional[str]

    class Config:
        from_attributes = True


class CodingSubmitIn(BaseModel):
    question_id: int
    language: str
    code: str


class CodingSubmissionOut(BaseModel):
    id: int
    question_id: int
    language: str
    code: str
    ai_feedback: Optional[str]
    correctness_score: Optional[float]
    efficiency_score: Optional[float]
    verdict: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True


# ---------- BEHAVIORAL ----------
class BehavioralQuestionOut(BaseModel):
    id: int
    question_text: str
    category: str

    class Config:
        from_attributes = True


class BehavioralSubmitIn(BaseModel):
    question_id: int
    response_text: str


class BehavioralResponseOut(BaseModel):
    id: int
    question_id: int
    response_text: str
    ai_feedback: Optional[str]
    score: Optional[float]
    submitted_at: datetime

    class Config:
        from_attributes = True


# ---------- APTITUDE ----------
class AptitudeQuestionOut(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    category: str
    difficulty: str

    class Config:
        from_attributes = True


class AptitudeAnswerIn(BaseModel):
    question_id: int
    selected_option: Optional[str] = None   # "A" | "B" | "C" | "D" | None if skipped


class AptitudeSubmitIn(BaseModel):
    answers: List[AptitudeAnswerIn]
    time_taken_secs: Optional[int] = None


class AptitudeAttemptOut(BaseModel):
    id: int
    total_questions: int
    correct_answers: int
    score_percent: float
    time_taken_secs: Optional[int]
    attempted_at: datetime

    class Config:
        from_attributes = True


# ---------- ANALYTICS ----------
class DashboardStats(BaseModel):
    total_mock_interviews: int
    avg_interview_score: Optional[float]
    total_coding_submissions: int
    coding_accuracy_percent: Optional[float]
    total_behavioral_responses: int
    avg_behavioral_score: Optional[float]
    total_aptitude_attempts: int
    avg_aptitude_score: Optional[float]
    score_trend: List[dict]
    strengths: List[str]
    weaknesses: List[str]
