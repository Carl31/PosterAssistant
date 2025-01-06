@echo off
echo Starting ngrok...
start /B ngrok http --url=civil-duck-absolutely.ngrok-free.app 80
timeout /t 5 /nobreak
echo Starting Node.js app...
cd D:\Documents\GithubRepos\PosterAssistant\backend\api
start node app.js