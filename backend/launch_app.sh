#!/bin/bash

source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --log-config=app/log_conf.yml