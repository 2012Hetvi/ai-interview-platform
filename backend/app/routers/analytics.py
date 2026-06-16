from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    uid = current_user.id

    total_interviews = db.query(func.count(models.MockInterview.id)).filter(
        models.MockInterview.user_id == uid, models.MockInterview.status == "completed"
    ).scalar()
    avg_interview_score = db.query(func.avg(models.MockInterview.overall_score)).filter(
        models.MockInterview.user_id == uid
    ).scalar()

    total_coding = db.query(func.count(models.CodingSubmission.id)).filter(
        models.CodingSubmission.user_id == uid
    ).scalar()
    accepted_coding = db.query(func.count(models.CodingSubmission.id)).filter(
        models.CodingSubmission.user_id == uid, models.CodingSubmission.verdict == "Accepted"
    ).scalar()
    coding_accuracy = round((accepted_coding / total_coding) * 100, 2) if total_coding else None

    total_behavioral = db.query(func.count(models.BehavioralResponse.id)).filter(
        models.BehavioralResponse.user_id == uid
    ).scalar()
    avg_behavioral = db.query(func.avg(models.BehavioralResponse.score)).filter(
        models.BehavioralResponse.user_id == uid
    ).scalar()

    total_aptitude = db.query(func.count(models.AptitudeAttempt.id)).filter(
        models.AptitudeAttempt.user_id == uid
    ).scalar()
    avg_aptitude = db.query(func.avg(models.AptitudeAttempt.score_percent)).filter(
        models.AptitudeAttempt.user_id == uid
    ).scalar()

    # simple score trend: last 10 completed interviews, oldest to newest
    trend_rows = (
        db.query(models.MockInterview.started_at, models.MockInterview.overall_score)
        .filter(models.MockInterview.user_id == uid, models.MockInterview.overall_score.isnot(None))
        .order_by(models.MockInterview.started_at.asc())
        .limit(10)
        .all()
    )
    score_trend = [
        {"date": row.started_at.strftime("%b %d"), "score": float(row.overall_score)}
        for row in trend_rows
    ]

    # naive strengths/weaknesses from coding categories with best/worst avg score
    category_scores = (
        db.query(
            models.CodingQuestion.category,
            func.avg(models.CodingSubmission.correctness_score).label("avg_score"),
        )
        .join(models.CodingSubmission, models.CodingSubmission.question_id == models.CodingQuestion.id)
        .filter(models.CodingSubmission.user_id == uid)
        .group_by(models.CodingQuestion.category)
        .all()
    )
    sorted_categories = sorted(category_scores, key=lambda r: r.avg_score, reverse=True)
    strengths = [r.category for r in sorted_categories[:2] if r.avg_score and r.avg_score >= 6]
    weaknesses = [r.category for r in sorted_categories[-2:] if r.avg_score and r.avg_score < 6]

    return schemas.DashboardStats(
        total_mock_interviews=total_interviews or 0,
        avg_interview_score=float(avg_interview_score) if avg_interview_score else None,
        total_coding_submissions=total_coding or 0,
        coding_accuracy_percent=coding_accuracy,
        total_behavioral_responses=total_behavioral or 0,
        avg_behavioral_score=float(avg_behavioral) if avg_behavioral else None,
        total_aptitude_attempts=total_aptitude or 0,
        avg_aptitude_score=float(avg_aptitude) if avg_aptitude else None,
        score_trend=score_trend,
        strengths=strengths,
        weaknesses=weaknesses,
    )
