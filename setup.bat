@echo off

git pull

start cmd /k "cd frontend && npm i && npx vite"
start cmd /k "cd backend && pip install -r requirements.txt && python server.py"
