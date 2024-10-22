from random import randint

import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.auth import get_password_hash
from app.db import User


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


def test_saving_variables(session: Session):
    # JSON type was not committing correctly, the fix was https://amercader.net/blog/beware-of-json-fields-in-sqlalchemy/
    variables = {
        "user_phone": "(510) 555-5555",
        "user_email": "test@test.com",
        "user_name": "Test User",
    }
    user_db = User(
        username="testuser" + randint(0, 10000).__str__(),
        hashed_password=get_password_hash("test"),
    )

    user_db.set_variables_for_chatbot(variables=variables, chatbot="cb1")
    session.add(user_db)
    session.commit()
    assert user_db.get_variables_for_chatbot(chatbot="cb1") == variables

    user_db.set_variables_for_chatbot(variables=variables, chatbot="cb2")
    session.add(user_db)
    session.commit()
    assert user_db.get_variables_for_chatbot(chatbot="cb2") == variables
