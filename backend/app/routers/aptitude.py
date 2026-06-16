import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/aptitude", tags=["Aptitude"])


@router.get("/questions", response_model=list[schemas.AptitudeQuestionOut])
def get_test_questions(
    limit: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.AptitudeQuestion)
    if category:
        query = query.filter(models.AptitudeQuestion.category == category)
    questions = query.all()
    random.shuffle(questions)
    return questions[:limit]


@router.post("/submit", response_model=schemas.AptitudeAttemptOut)
def submit_attempt(
    payload: schemas.AptitudeSubmitIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    question_ids = [a.question_id for a in payload.answers]
    questions = {
        q.id: q
        for q in db.query(models.AptitudeQuestion)
        .filter(models.AptitudeQuestion.id.in_(question_ids))
        .all()
    }

    correct_count = 0
    answer_rows = []
    for ans in payload.answers:
        question = questions.get(ans.question_id)
        is_correct = bool(
            question and ans.selected_option and ans.selected_option == question.correct_option
        )
        if is_correct:
            correct_count += 1
        answer_rows.append(
            models.AptitudeAttemptAnswer(
                question_id=ans.question_id,
                selected_option=ans.selected_option,
                is_correct=is_correct,
            )
        )

    total = len(payload.answers)
    score_percent = round((correct_count / total) * 100, 2) if total else 0.0

    attempt = models.AptitudeAttempt(
        user_id=current_user.id,
        total_questions=total,
        correct_answers=correct_count,
        score_percent=score_percent,
        time_taken_secs=payload.time_taken_secs,
        answers=answer_rows,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/attempts", response_model=list[schemas.AptitudeAttemptOut])
def my_attempts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.AptitudeAttempt)
        .filter(models.AptitudeAttempt.user_id == current_user.id)
        .order_by(models.AptitudeAttempt.attempted_at.desc())
        .all()
    )
