@echo off

call runtime git pull

start runtime cmd /k "cd frontend && npm i && npx vite"
start runtime cmd /k "cd backend && python server.py"