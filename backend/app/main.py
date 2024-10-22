import logging
import json
from typing import Annotated
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles

from app.auth import (
    Token,
    User,
    create_access_token,
    authenticate_user,
    get_current_user,
    get_password_hash,
)
from app.db import SessionDep, User


load_dotenv()


class PackagesFilter(logging.Filter):
    def filter(self, record):
        """Block logs from specific packages to avoid clutter"""
        BLOCKED_LOGGER_NAMES = ["multipart.multipart"]
        for name in BLOCKED_LOGGER_NAMES:
            if record.name.startswith(name):
                return False
        return True


logger = logging.getLogger(__name__)
logger.info("Starting app")

USER_UUID_VARIABLE_NAME = "user_uuid"


app = FastAPI(root_path=os.getenv("ROOT_PATH", ""))


@app.post("/uiv/{chatbot}")
async def user_identity_verification(chatbot: str, payload: dict, session: SessionDep):
    logger.info(
        f"Received a user identity verification request - {json.dumps({'chatbot': chatbot, 'payload': payload})}"
    )

    if not (token := payload.get("token", None)):
        raise HTTPException(status_code=403, detail="No token provided")

    if user := await get_current_user(session, token):
        # return the payload received from data collection webhook, and append user ID
        variables = user.get_variables_for_chatbot(chatbot=chatbot)
        variables[USER_UUID_VARIABLE_NAME] = user.uuid
        logger.info(f"Replying with user data - {json.dumps(variables)}")
        return variables
    else:
        raise HTTPException(status_code=403, detail="Token is not valid")


@app.post("/webhook/data-collection/{chatbot}")
async def data_collection(chatbot: str, payload: dict, session: SessionDep):
    logger.info(
        f"Received a data collection webhook - {json.dumps({'chatbot': chatbot, 'payload': payload})}"
    )
    # example: {"user_phone": "+65 9123 4567", "user_email": "dtiger@hoho.com", "user_name": "Daniel Tiger", "session_uuid": "ace2aa1f56474b1e9f79ce58e0faad80"}

    # we don't need to save "session_uuid" from payload
    payload.pop("session_uuid", None)
    user_uuid = payload.pop(USER_UUID_VARIABLE_NAME, None)
    if not user_uuid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Missing user UUID"
        )

    user_db = session.get(User, user_uuid)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    user_db.set_variables_for_chatbot(variables=payload, chatbot=chatbot)
    session.add(user_db)
    session.commit()


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: SessionDep,
) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


@app.post("/register")
async def register_new_user(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
    session: SessionDep,
):
    user = User(
        username=username,
        hashed_password=get_password_hash(password),
    )

    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()

    access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=access_token, token_type="bearer")


# static files must be mounted after other endpoints. See https://stackoverflow.com/a/73916745
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
