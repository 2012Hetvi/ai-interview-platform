from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.services import ai_service

router = APIRouter(prefix="/api/behavioral", tags=["Behavioral"])


@router.get("/questions", response_model=list[schemas.BehavioralQuestionOut])
def list_questions(db: Session = Depends(get_db)):
    return db.query(models.BehavioralQuestion).all()


@router.post("/submit", response_model=schemas.BehavioralResponseOut)
def submit_response(
    payload: schemas.BehavioralSubmitIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    question = db.query(models.BehavioralQuestion).filter(
        models.BehavioralQuestion.id == payload.question_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    evaluation = ai_service.evaluate_behavioral_answer(
        question.question_text, payload.response_text
    )

    response = models.BehavioralResponse(
        user_id=current_user.id,
        question_id=payload.question_id,
        response_text=payload.response_text,
        ai_feedback=evaluation["feedback"],
        score=evaluation["score"],
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response


@router.get("/responses", response_model=list[schemas.BehavioralResponseOut])
def my_responses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.BehavioralResponse)
        .filter(models.BehavioralResponse.user_id == current_user.id)
        .order_by(models.BehavioralResponse.submitted_at.desc())
        .all()
    )
