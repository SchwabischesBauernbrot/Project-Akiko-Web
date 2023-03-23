#!/bin/bash

git pull

cd frontend && npx vite &
cd backend && python server.py &
