#!/bin/bash

# =====================================================
# AI-Powered Interactive Owner's Manual
# Start Script - Cleans ports, seeds DB, starts servers
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     AI-Powered Interactive Owner's Manual        ║"
echo "║              AutoManual AI                       ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found!${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ── Step 1: Clean up used ports ──
echo -e "\n${YELLOW}► Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 2
    # Verify port is free
    local remaining=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$remaining" ]; then
      echo -e "  Retrying kill on port $port..."
      echo "$remaining" | xargs kill -9 2>/dev/null || true
      sleep 2
    fi
    echo -e "  ${GREEN}✓ Port $port cleared${NC}"
  else
    echo -e "  ${GREEN}✓ Port $port already free${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT
sleep 2  # Extra wait for OS to fully release ports

# ── Step 2: Install dependencies ──
echo -e "\n${YELLOW}► Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
  npm install --silent
  echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

echo -e "\n${YELLOW}► Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  npm install --silent
  echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

cd "$SCRIPT_DIR"

# ── Step 3: Setup Database ──
echo -e "\n${YELLOW}► Setting up PostgreSQL database...${NC}"

# Check if PostgreSQL is running
if ! pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
  echo -e "${RED}✗ PostgreSQL is not running. Please start PostgreSQL first.${NC}"
  echo -e "  On macOS: brew services start postgresql"
  echo -e "  On Linux: sudo systemctl start postgresql"
  exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Create database if it doesn't exist
DB_EXISTS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME:-ownermanual}'" 2>/dev/null || true)
if [ "$DB_EXISTS" != "1" ]; then
  echo -e "  Creating database '${DB_NAME:-ownermanual}'..."
  createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} "${DB_NAME:-ownermanual}" 2>/dev/null || true
  echo -e "${GREEN}✓ Database created${NC}"
else
  echo -e "${GREEN}✓ Database '${DB_NAME:-ownermanual}' already exists${NC}"
fi

# ── Step 4: Seed Database ──
echo -e "\n${YELLOW}► Seeding database with sample data (15+ items per feature)...${NC}"
cd "$SCRIPT_DIR/backend"
node seed.js
echo -e "${GREEN}✓ Database seeded successfully${NC}"

# ── Step 5: Start Backend with hot reload (nodemon) ──
echo -e "\n${YELLOW}► Starting backend server on port ${BACKEND_PORT} (with hot reload)...${NC}"
cd "$SCRIPT_DIR/backend"
npx nodemon --ignore 'seed.js' --delay 2 server.js &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "  Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -s "http://localhost:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is ready${NC}"
    break
  fi
  sleep 1
done

# ── Step 6: Start Frontend with hot reload (react-scripts) ──
echo -e "\n${YELLOW}► Starting frontend on port ${FRONTEND_PORT} (with hot reload)...${NC}"
cd "$SCRIPT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# ── Summary ──
echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Application is starting!${NC}"
echo -e ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:${FRONTEND_PORT}"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:${BACKEND_PORT}"
echo -e "  ${BLUE}API Health:${NC} http://localhost:${BACKEND_PORT}/api/health"
echo -e ""
echo -e "  ${YELLOW}Login Credentials:${NC}"
echo -e "  Email:    demo@automanual.com"
echo -e "  Password: password123"
echo -e ""
echo -e "  ${YELLOW}Features:${NC} Hot reload enabled for both servers"
echo -e "  ${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}"

# Handle cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All servers stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait
