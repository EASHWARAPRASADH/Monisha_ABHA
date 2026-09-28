@echo off
REM ============================================================
REM One-Click Docker Runner for Hospital IVR & ABHA Prototype
REM Compatible with Windows (Command Prompt / PowerShell)
REM ============================================================

echo ============================================================
echo  Starting IVR Token Booking System (Docker Environment)
echo ============================================================

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Building and starting containers...
docker compose up --build -d
if %ERRORLEVEL% NEQ 0 (
    echo Falling back to legacy docker-compose...
    docker-compose up --build -d
)

echo.
echo ============================================================
echo [SUCCESS] Containers started!
echo ============================================================
echo Web Portal:      http://localhost:3000 (or http://localhost:5173)
echo Backend API:     http://localhost:8088
echo Swagger UI:      http://localhost:8088/swagger-ui.html
echo Database:        localhost:3306 (DB: hospital_ivr_db)
echo ============================================================
echo To view live logs: docker compose logs -f
echo To stop:           docker compose down
echo ============================================================
pause
