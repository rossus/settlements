@echo off
REM Change to the directory where this script is located
cd /d "%~dp0"

echo ========================================
echo   Starting Settlements Game
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Ask for port
echo.
echo Select port for web server:
echo.
set /p USE_DEFAULT="Use default port 8080? (Y/N): "

if /i "%USE_DEFAULT%"=="Y" (
    set PORT=8080
) else if /i "%USE_DEFAULT%"=="N" (
    set /p PORT="Enter port number: "
) else (
    echo Invalid choice. Using default port 8080.
    set PORT=8080
)

echo.
echo ========================================
echo Starting server on port %PORT%...
echo ========================================
echo.

REM Start server in background
start /B npx http-server -p %PORT%

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Checking if server is ready...
REM Try to connect a few times
set RETRY=0
:CHECK_SERVER
set /a RETRY+=1
curl -s http://localhost:%PORT% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Server is ready!
    goto SERVER_READY
)
if %RETRY% GEQ 10 (
    echo Warning: Server may not be ready yet, but opening browser anyway...
    goto SERVER_READY
)
timeout /t 1 /nobreak >nul
goto CHECK_SERVER

:SERVER_READY
echo.
echo Opening game in browser...
echo URL: http://localhost:%PORT%/index.html
echo.
echo Press Ctrl+C to stop the server when you're done.
echo ========================================
echo.

REM Open browser to index.html
start http://localhost:%PORT%/index.html

REM Keep window open
echo Server is running. Close this window to stop the server.
pause >nul
