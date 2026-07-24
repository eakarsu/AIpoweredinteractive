#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$ROOT/.env" ]] || { echo "Missing .env; copy .env.example." >&2; exit 1; }

load_env_file() {
  local key value
  while IFS='=' read -r key value; do
    key="${key#export }"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    [[ -z "${!key+x}" ]] || continue
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi
    export "$key=$value"
  done < "$ROOT/.env"
}

load_env_file
: "${BACKEND_PORT:?BACKEND_PORT is required}"
: "${FRONTEND_PORT:?FRONTEND_PORT is required}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://127.0.0.1:$FRONTEND_PORT}"
if [[ "${NODE_ENV:-}" == "test" && -z "${VEHICLE_WEBHOOK_SECRET:-}" ]]; then
  export VEHICLE_WEBHOOK_SECRET="runtime-test-only-vehicle-webhook-secret"
fi

case "${1:-start}" in
  backend) cd "$ROOT/backend"; exec node server.js ;;
  frontend) cd "$ROOT/frontend"; exec env PORT="$FRONTEND_PORT" BROWSER=none REACT_APP_API_URL="http://127.0.0.1:$BACKEND_PORT/api" ./node_modules/.bin/react-scripts start ;;
  start)
    for assigned_port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
      if lsof -nP -iTCP:"$assigned_port" -sTCP:LISTEN >/dev/null 2>&1; then
        echo "Assigned port $assigned_port is already occupied" >&2
        exit 1
      fi
    done
    (cd "$ROOT/backend" && exec node scripts/migrate.js)
    (cd "$ROOT/backend" && exec node scripts/create-admin.js)
    (cd "$ROOT/backend" && exec node server.js) &
    backend_pid=$!
    (cd "$ROOT/frontend" && exec env PORT="$FRONTEND_PORT" BROWSER=none REACT_APP_API_URL="http://127.0.0.1:$BACKEND_PORT/api" ./node_modules/.bin/react-scripts start) &
    frontend_pid=$!
    cleanup() {
      trap - EXIT INT TERM
      kill "$backend_pid" "$frontend_pid" 2>/dev/null || true
      wait "$backend_pid" "$frontend_pid" 2>/dev/null || true
    }
    trap cleanup EXIT INT TERM
    wait "$backend_pid" "$frontend_pid"
    ;;
  *) echo "Usage: $0 [start|backend|frontend]" >&2; exit 64 ;;
esac
