#!/bin/bash

git pull

cd frontend && npm run dev &
cd backend && python server.py --enable-modules=caption&
