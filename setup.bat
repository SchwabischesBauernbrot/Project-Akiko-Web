@echo off

git pull

start cmd /c "cd frontend && npm install"
start cmd /c "cd backend && pip install -r requirements.txt"
