@echo off

git pull

start cmd /k "cd frontend && npm run dev"
start cmd /k "cd backend && python server.py"
