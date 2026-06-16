from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, DECIMAL,
    Enum, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    target_role = Column(String(120), nullable=True)
    experience_level = Column(
        Enum("fresher", "1-2 years", "3-5 years", "5+ years"),
        default="fresher",
    )
    created_at = Column(DateTime, server_default=func.now())

    interviews = relationship("MockInterview", back_populates="user", cascade="all, delete")
    coding_submissions = relationship("CodingSubmission", back_populates="user", cascade="all, delete")
    behavioral_responses = relationship("BehavioralResponse", back_populates="user", cascade="all, delete")
    aptitude_attempts = relationship("AptitudeAttempt", back_populates="user", cascade="all, delete")


class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(120), nullable=False)
    mode = Column(Enum("text", "voice"), default="text")
    status = Column(Enum("in_progress", "completed"), default="in_progress")
    overall_score = Column(DECIMAL(5, 2), nullable=True)
    overall_feedback = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interviews")
    qa_pairs = relationship("InterviewQA", back_populates="interview", cascade="all, delete")


class InterviewQA(Base):
    __tablename__ = "interview_qa"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("mock_interviews.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    score = Column(DECIMAL(5, 2), nullable=True)
    sequence_no = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    interview = relationship("MockInterview", back_populates="qa_pairs")


class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum("Easy", "Medium", "Hard"), nullable=False)
    category = Column(String(80), nullable=False)
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    constraints_text = Column(Text, nullable=True)

    submissions = relationship("CodingSubmission", back_populates="question", cascade="all, delete")


class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("coding_questions.id"), nullable=False)
    language = Column(String(40), nullable=False)
    code = Column(Text, nullable=False)
    ai_feedback = Column(Text, nullable=True)
    correctness_score = Column(DECIMAL(5, 2), nullable=True)
    efficiency_score = Column(DECIMAL(5, 2), nullable=True)
    verdict = Column(Enum("Accepted", "Needs Improvement", "Incorrect"), nullable=True)
    submitted_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="coding_submissions")
    question = relationship("CodingQuestion", back_populates="submissions")


class BehavioralQuestion(Base):
    __tablename__ = "behavioral_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    category = Column(String(80), nullable=False)

    responses = relationship("BehavioralResponse", back_populates="question", cascade="all, delete")


class BehavioralResponse(Base):
    __tablename__ = "behavioral_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("behavioral_questions.id"), nullable=False)
    response_text = Column(Text, nullable=False)
    ai_feedback = Column(Text, nullable=True)
    score = Column(DECIMAL(5, 2), nullable=True)
    submitted_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="behavioral_responses")
    question = relationship("BehavioralQuestion", back_populates="responses")


class AptitudeQuestion(Base):
    __tablename__ = "aptitude_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(255), nullable=False)
    option_b = Column(String(255), nullable=False)
    option_c = Column(String(255), nullable=False)
    option_d = Column(String(255), nullable=False)
    correct_option = Column(Enum("A", "B", "C", "D"), nullable=False)
    category = Column(String(80), nullable=False)
    difficulty = Column(Enum("Easy", "Medium", "Hard"), default="Medium")


class AptitudeAttempt(Base):
    __tablename__ = "aptitude_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    score_percent = Column(DECIMAL(5, 2), nullable=False)
    time_taken_secs = Column(Integer, nullable=True)
    attempted_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="aptitude_attempts")
    answers = relationship("AptitudeAttemptAnswer", back_populates="attempt", cascade="all, delete")


class AptitudeAttemptAnswer(Base):
    __tablename__ = "aptitude_attempt_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("aptitude_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("aptitude_questions.id"), nullable=False)
    selected_option = Column(Enum("A", "B", "C", "D"), nullable=True)
    is_correct = Column(Boolean, nullable=False)

    attempt = relationship("AptitudeAttempt", back_populates="answers")
