@echo off
cd /d "%~dp0"
start "" http://localhost:5511
python -m http.server 5511
