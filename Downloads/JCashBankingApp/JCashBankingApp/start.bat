@echo off
echo Starting MobiCash...

:: Start Spring Boot API in a new window
start "MobiCash API" cmd /k "cd /d %~dp0api && apache-maven-3.9.9\bin\mvn spring-boot:run"

:: Wait 10 seconds for the API to boot before starting Expo
timeout /t 10 /nobreak >nul

:: Start Expo in a new window
start "MobiCash Mobile" cmd /k "cd /d %~dp0mobile && npx expo start"

echo Both servers are starting in separate windows.
