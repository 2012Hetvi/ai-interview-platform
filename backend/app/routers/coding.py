from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models, schemas, auth
from app.services import ai_service

router = APIRouter(prefix="/api/coding", tags=["Coding Practice"])


@router.get("/questions", response_model=list[schemas.CodingQuestionOut])
def list_questions(
    difficulty: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.CodingQuestion)
    if difficulty:
        query = query.filter(models.CodingQuestion.difficulty == difficulty)
    if category:
        query = query.filter(models.CodingQuestion.category == category)
    return query.all()


@router.get("/questions/{question_id}", response_model=schemas.CodingQuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(models.CodingQuestion).filter(
        models.CodingQuestion.id == question_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.post("/submit", response_model=schemas.CodingSubmissionOut)
def submit_code(
    payload: schemas.CodingSubmitIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    question = db.query(models.CodingQuestion).filter(
        models.CodingQuestion.id == payload.question_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    evaluation = ai_service.evaluate_code_submission(
        question.title, question.description, payload.language, payload.code
    )

    submission = models.CodingSubmission(
        user_id=current_user.id,
        question_id=payload.question_id,
        language=payload.language,
        code=payload.code,
        ai_feedback=evaluation["feedback"],
        correctness_score=evaluation["correctness_score"],
        efficiency_score=evaluation["efficiency_score"],
        verdict=evaluation["verdict"],
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.get("/submissions", response_model=list[schemas.CodingSubmissionOut])
def my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.CodingSubmission)
        .filter(models.CodingSubmission.user_id == current_user.id)
        .order_by(models.CodingSubmission.submitted_at.desc())
        .all()
    )
