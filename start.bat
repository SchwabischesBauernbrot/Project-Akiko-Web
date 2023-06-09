@echo off

call runtime git pull

start cmd /k "cd frontend && npm i && npm run base"