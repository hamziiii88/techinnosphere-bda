@echo off
title Package TechInnoSphere for Claude
color 0a

echo ========================================================
echo   Packaging TechInnoSphere Project for Claude
echo ========================================================
echo.

set TARGET_DIR=%~dp0claude_project_bundle

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

echo [*] Copying Core Instructions and Context...
copy /Y "%~dp0CLAUDE.md" "%TARGET_DIR%\" >nul
copy /Y "%~dp0claude_desktop_config.json" "%TARGET_DIR%\" >nul
copy /Y "%~dp0claude-mcp-server.mjs" "%TARGET_DIR%\" >nul
copy /Y "%~dp0claude-autonomous-agent.mjs" "%TARGET_DIR%\" >nul
copy /Y "%~dp0n8n-techinnosphere-bda-workflow.json" "%TARGET_DIR%\" >nul

echo [*] Copying Verified PAN-India Database...
copy /Y "%~dp0src\data\realMumbaiProspects.js" "%TARGET_DIR%\PAN_India_Leads_Database.js" >nul
copy /Y "%~dp0src\data\initialLeads.js" "%TARGET_DIR%\Initial_CRM_Leads.js" >nul

echo.
echo ========================================================
echo  [SUCCESS] Claude Project Bundle Ready!
echo  Folder: %TARGET_DIR%
echo ========================================================
echo.
echo To add to Claude (claude.ai):
echo  1. Open https://claude.ai/projects
echo  2. Click "Create Project" -> Name it "TechInnoSphere BDA"
echo  3. Drag all files from "claude_project_bundle" into Project Knowledge!
echo.
pause
