@echo off
title TechInnoSphere BDA Server Daemon
cd /d "c:\Users\thund\Downloads\Techinnosphere"
echo Starting TechInnoSphere Production Server on port 5000...
npx -y serve -s dist -l 5000
