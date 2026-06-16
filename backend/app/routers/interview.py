from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.services import ai_service

router = APIRouter(prefix="/api/interview", tags=["Mock Interview"])


@router.post("/start", response_model=schemas.InterviewOut)
def start_interview(
    payload: schemas.InterviewStart,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    interview = models.MockInterview(
        user_id=current_user.id, role=payload.role, mode=payload.mode
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    question_text = ai_service.generate_interview_question(payload.role, history=[])

    qa = models.InterviewQA(
        interview_id=interview.id, question_text=question_text, sequence_no=1
    )
    db.add(qa)
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/answer", response_model=schemas.InterviewQAOut)
def submit_answer(
    payload: schemas.InterviewAnswer,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    interview = db.query(models.MockInterview).filter(
        models.MockInterview.id == payload.interview_id,
        models.MockInterview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    qa = db.query(models.InterviewQA).filter(
        models.InterviewQA.id == payload.qa_id,
        models.InterviewQA.interview_id == interview.id,
    ).first()
    if not qa:
        raise HTTPException(status_code=404, detail="Question not found")

    evaluation = ai_service.evaluate_interview_answer(
        interview.role, qa.question_text, payload.answer_text
    )

    qa.answer_text = payload.answer_text
    qa.ai_feedback = evaluation["feedback"]
    qa.score = evaluation["score"]
    db.commit()
    db.refresh(qa)
    return qa


@router.post("/{interview_id}/next-question", response_model=schemas.InterviewQAOut)
def next_question(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    interview = db.query(models.MockInterview).filter(
        models.MockInterview.id == interview_id,
        models.MockInterview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    history = [
        {"question": qa.question_text, "answer": qa.answer_text}
        for qa in interview.qa_pairs
    ]
    question_text = ai_service.generate_interview_question(interview.role, history)

    qa = models.InterviewQA(
        interview_id=interview.id,
        question_text=question_text,
        sequence_no=len(history) + 1,
    )
    db.add(qa)
    db.commit()
    db.refresh(qa)
    return qa


@router.post("/{interview_id}/complete", response_model=schemas.InterviewOut)
def complete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    interview = db.query(models.MockInterview).filter(
        models.MockInterview.id == interview_id,
        models.MockInterview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    answered = [qa for qa in interview.qa_pairs if qa.answer_text]
    if answered:
        summary = ai_service.evaluate_full_interview(
            interview.role,
            [{"question": qa.question_text, "answer": qa.answer_text, "score": float(qa.score or 0)} for qa in answered],
        )
        interview.overall_score = summary["overall_score"]
        interview.overall_feedback = summary["overall_feedback"]

    interview.status = "completed"
    from datetime import datetime
    interview.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/history", response_model=list[schemas.InterviewOut])
def interview_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.MockInterview)
        .filter(models.MockInterview.user_id == current_user.id)
        .order_by(models.MockInterview.started_at.desc())
        .all()
    )


@router.get("/{interview_id}", response_model=schemas.InterviewOut)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    interview = db.query(models.MockInterview).filter(
        models.MockInterview.id == interview_id,
        models.MockInterview.user_id == current_user.id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview
