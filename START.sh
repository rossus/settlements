#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "$0")"

echo "========================================"
echo "  Starting Settlements Game"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Ask for port
echo ""
echo "Select port for web server:"
echo ""
read -p "Use default port 8080? (Y/N): " USE_DEFAULT

if [[ "$USE_DEFAULT" =~ ^[Yy]$ ]]; then
    PORT=8080
elif [[ "$USE_DEFAULT" =~ ^[Nn]$ ]]; then
    read -p "Enter port number: " PORT
else
    echo "Invalid choice. Using default port 8080."
    PORT=8080
fi

echo ""
echo "========================================"
echo "Starting server on port $PORT..."
echo "========================================"
echo ""

# Start server in background
npx http-server -p $PORT &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 2

echo "Checking if server is ready..."
# Try to connect up to 10 times
RETRY=0
while [ $RETRY -lt 10 ]; do
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    RETRY=$((RETRY + 1))
    if [ $RETRY -eq 10 ]; then
        echo "Warning: Server may not be ready yet, but opening browser anyway..."
        break
    fi
    sleep 1
done

echo ""
echo "Opening game in browser..."
echo "URL: http://localhost:$PORT/index.html"
echo ""
echo "Press Ctrl+C to stop the server when you're done."
echo "========================================"
echo ""

# Detect OS and open browser to index.html
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:$PORT/index.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:$PORT/index.html" 2>/dev/null || echo "Please open http://localhost:$PORT/index.html in your browser"
fi

# Wait for the background server process
echo "Server is running (PID: $SERVER_PID). Press Ctrl+C to stop."
wait $SERVER_PID
