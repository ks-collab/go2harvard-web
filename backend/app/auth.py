from datetime import datetime, timedelta, timezone
from typing import Annotated
import os

import bcrypt
from dotenv import load_dotenv
from pydantic import BaseModel
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select

from .db import User, SessionDep


load_dotenv()
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# https://www.geeksforgeeks.org/hashing-passwords-in-python-with-bcrypt/
def verify_password(plain_password: str, hashed_password: bytes):
    password_byte_enc = plain_password.encode("utf-8")
    return bcrypt.checkpw(password=password_byte_enc, hashed_password=hashed_password)


# https://www.geeksforgeeks.org/hashing-passwords-in-python-with-bcrypt/
def get_password_hash(password):
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password


def get_user(session: SessionDep, username: str) -> User | None:
    statement = select(User).where(User.username == username)
    user = session.exec(statement).first()
    if user:
        return user


def authenticate_user(session: SessionDep, username: str, password: str) -> User | bool:
    user = get_user(session, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.exceptions.InvalidTokenError:
        raise credentials_exception
    user = get_user(session=session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
