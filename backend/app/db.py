from typing import Annotated
import uuid
import os

from dotenv import load_dotenv
from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlalchemy.ext.mutable import MutableDict
from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine

load_dotenv()


def create_uuid() -> str:
    return uuid.uuid4().hex


class UserBase(SQLModel):
    username: str = Field(index=True, unique=True)
    # https://amercader.net/blog/beware-of-json-fields-in-sqlalchemy/
    variables: dict = Field(
        default_factory=dict,
        sa_column=Column(MutableDict.as_mutable(JSON)),
    )


class User(UserBase, table=True):
    uuid: str = Field(default_factory=create_uuid, primary_key=True)
    hashed_password: bytes

    def get_variables_for_chatbot(self, chatbot: str):
        return self.variables.get(chatbot, {})

    def set_variables_for_chatbot(self, variables: dict, chatbot: str):
        self.variables[chatbot] = variables


PROJECT_PATH = os.getenv("PROJECT_PATH")
if not PROJECT_PATH:
    raise Exception("PROJECT_PATH is not set")
sqlite_file_name = f"{PROJECT_PATH}/backend/data/db.sqlite"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


SessionDep = Annotated[Session, Depends(get_session)]
