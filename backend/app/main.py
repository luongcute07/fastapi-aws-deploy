from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import engine, get_db, Base
from .models import User
from .schemas import UserCreate, UserUpdate, UserResponse

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="User Management API",
    description="Final DevOps – CI/CD with SonarQube",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"message": "User Management API is running 🚀", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── Users CRUD ────────────────────────────────────────────────
@app.get("/users", response_model=List[UserResponse], tags=["Users"])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all users."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.post("/users", response_model=UserResponse, status_code=201, tags=["Users"])
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(name=user.name, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """Update user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.name is not None:
        user.name = user_data.name
    if user_data.email is not None:
        conflict = db.query(User).filter(
            User.email == user_data.email, User.id != user_id
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_data.email

    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}", tags=["Users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully"}
