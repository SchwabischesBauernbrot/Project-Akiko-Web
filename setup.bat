@echo off

git pull

start cmd /k "cd frontend && npm i && npm run install && npm run base"
