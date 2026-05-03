@echo off
echo Installing dependencies...
call npm install
echo.
echo Starting Luxe Scents server with email functionality...
echo Server will run at http://localhost:3000
echo.
echo IMPORTANT: Make sure you've configured your email in email-server.js
echo Press Ctrl+C to stop the server
echo.
node email-server.js
