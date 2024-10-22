import sys
import os
from random import randint

from sqlmodel import Session

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.db import engine, User, create_db_and_tables
from app.auth import get_password_hash


if __name__ == "__main__":
    print("Creating database and tables")
    create_db_and_tables()

    print("Creating a user")

    user = User(
        username="testuser" + randint(0, 10000).__str__(),
        hashed_password=get_password_hash("secret"),
    )

    db_user = User.model_validate(user)
    with Session(engine) as session:
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    print("Done")
