#!/bin/bash

git pull

cd frontend && npm install
cd backend && pip install -r requirements.txt
