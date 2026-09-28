#!/usr/bin/env bash
# ============================================================
# One-Click Docker Runner for Hospital IVR & ABHA Prototype
# Compatible with macOS and Linux
# ============================================================

set -e

echo "============================================================"
echo " Starting IVR Token Booking System (Docker Environment)     "
echo "============================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH."
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Detect docker compose command (docker compose vs docker-compose)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' found."
    exit 1
fi

echo "🚀 Building and starting containers in detached mode..."
$DOCKER_COMPOSE up --build -d

echo ""
echo "⏳ Waiting for backend and database to become healthy..."
sleep 5

echo ""
echo "============================================================"
echo "✅ All containers are up and running!"
echo "============================================================"
echo "🌐 Hospital Web Portal:      http://localhost:3000 (or http://localhost:5173)"
echo "🔌 Backend REST & IVR Core:  http://localhost:8088"
echo "📖 Swagger API Docs:         http://localhost:8088/swagger-ui.html"
echo "🗄️ MySQL Database:           localhost:3306 (DB: hospital_ivr_db)"
echo "============================================================"
echo "To view live logs:           $DOCKER_COMPOSE logs -f"
echo "To stop containers:          $DOCKER_COMPOSE down"
echo "============================================================"
