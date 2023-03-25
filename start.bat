@echo off

call runtime git pull

start runtime cmd /k "cd frontend && npx vite"
start runtime cmd /k "cd backend && python server.py"