@echo off
title TechInnoSphere - Claude Desktop MCP Setup
color 0b

echo ========================================================
echo   TechInnoSphere BDA Suite - Claude Desktop MCP Setup
echo ========================================================
echo.

set CLAUDE_DIR=%APPDATA%\Claude
set CONFIG_FILE=%CLAUDE_DIR%\claude_desktop_config.json

if not exist "%CLAUDE_DIR%" (
    echo [*] Creating Claude configuration directory: %CLAUDE_DIR%
    mkdir "%CLAUDE_DIR%"
)

if not exist "%~dp0.env" (
    echo [!] No .env file found next to this script.
    echo     Copy .env.example to .env and set SMTP_PASS before running this.
    pause
    exit /b 1
)

echo [*] Reading SMTP_PASS from .env ...
for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
    if "%%A"=="SMTP_PASS" set SMTP_PASS_VALUE=%%B
)

if "%SMTP_PASS_VALUE%"=="" (
    echo [!] SMTP_PASS is empty in .env. Set it before running this.
    pause
    exit /b 1
)

echo [*] Writing MCP Server configuration to: %CONFIG_FILE%

(
echo {
echo   "mcpServers": {
echo     "techinnosphere-bda": {
echo       "command": "node",
echo       "args": [
echo         "%~dp0claude-mcp-server.mjs"
echo       ],
echo       "env": {
echo         "SMTP_HOST": "smtp.hostinger.com",
echo         "SMTP_PORT": "465",
echo         "SMTP_USER": "contact@techinnosphere.com",
echo         "SMTP_PASS": "%SMTP_PASS_VALUE%"
echo       }
echo     }
echo   }
echo }
) > "%CONFIG_FILE%"

echo.
echo ========================================================
echo  [SUCCESS] TechInnoSphere MCP Server is now installed!
echo ========================================================
echo.
echo Next Steps:
echo  1. Restart your Claude Desktop app.
echo  2. Look for the hammer / tool icon at the bottom right.
echo  3. Ask Claude: "Find verified leads in Mumbai and send outreach email via Hostinger SMTP"
echo.
pause
