@echo off

git pull

start cmd /k "cd frontend && npx vite"
start cmd /k "cd backend && python server.py"
