#!/bin/bash

git pull

cd frontend && npm i && npx vite &
cd backend && pip install -r requirements.txt && python server.py&
