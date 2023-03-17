#!/bin/bash

git pull

cd frontend && npm i && npm run dev &
cd backend && pip install -r requirements.txt && python server.py &
