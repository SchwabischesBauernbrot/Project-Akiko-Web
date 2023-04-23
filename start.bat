@echo off

call runtime git pull

start runtime cmd /k "cd frontend && npm i && npm run full"