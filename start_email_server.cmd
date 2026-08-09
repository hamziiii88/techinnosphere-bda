@echo off
title TechInnoSphere Email Server (smtp.hostinger.com:465)
color 0A
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║   TechInnoSphere Real Email API Server           ║
echo ║   Account: contact@techinnosphere.com            ║
echo ║   SMTP:    smtp.hostinger.com:465 (SSL/TLS)      ║
echo ╚══════════════════════════════════════════════════╝
echo.
echo Starting email server on http://localhost:3001 ...
echo Keep this window open while using the Email section!
echo.
node email-server.cjs
pause
