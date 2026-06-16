from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, interview, coding, behavioral, aptitude, analytics

# Create tables if they don't already exist (schema.sql is the source of truth
# for a fresh DB; this is a convenience fallback for local dev).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Interview Preparation Platform API",
    description="REST API powering mock interviews, coding practice, "
                 "behavioral question scoring, aptitude tests, and analytics.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(coding.router)
app.include_router(behavioral.router)
app.include_router(aptitude.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Interview Preparation Platform API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
