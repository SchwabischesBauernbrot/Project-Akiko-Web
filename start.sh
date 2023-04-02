#!/bin/bash

git pull

cd frontend && npm i && npm run dev &
cd backend && python server.py &