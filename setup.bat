@echo off

git pull

start cmd /k "cd frontend && npm run install && npm run base"
