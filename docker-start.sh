#!/bin/sh

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║          Clash Master - Starting...                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo

# Ensure data directory exists
mkdir -p /app/data

echo "📊 Web UI:     http://localhost:3000"
echo "🔌 API:        http://localhost:3001"
echo "📡 WebSocket:  ws://localhost:3002"
echo

# Start collector in background
echo "🚀 Starting data collector..."
cd /app/apps/collector && node dist/index.js &
COLLECTOR_PID=$!

# Wait for collector to be ready
echo "⏳ Waiting for collector to be ready..."
sleep 3

# Start web frontend (standalone mode)
echo "🌐 Starting web frontend..."
cd /app/apps/web/.next/standalone/apps/web && NODE_ENV=production PORT=3000 node server.js &
WEB_PID=$!

# Wait for web to be ready
echo "⏳ Waiting for web frontend to be ready..."
sleep 3

echo
echo "✅ All services started successfully!"
echo
echo "📝 Access the dashboard at: http://localhost:3000"
echo "🔧 Configure your OpenClash backend in the web UI"
echo

# Handle shutdown
cleanup() {
    echo
    echo "🛑 Shutting down services..."
    kill $WEB_PID $COLLECTOR_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Keep container running
wait
