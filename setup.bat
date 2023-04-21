@echo off

git pull

start runtime cmd /c "cd frontend && npm install"
start runtime cmd /c "cd backend && pip install -r requirements.txt"
