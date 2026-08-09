@echo off
title Push TechInnoSphere to GitHub
cd /d "c:\Users\thund\Downloads\Techinnosphere"

echo ===================================================
echo   TechInnoSphere BDA Platform - GitHub Pusher
echo ===================================================
echo.
set /p GHUSER="Enter your GitHub Username: "
set /p REPO="Enter Repository Name (press Enter for techinnosphere-bda): "
if "%REPO%"=="" set REPO=techinnosphere-bda

echo.
echo Connecting to https://github.com/%GHUSER%/%REPO%.git ...
git remote remove origin 2>nul
git remote add origin https://github.com/%GHUSER%/%REPO%.git
git branch -M main
echo Pushing production release to GitHub...
git push -u origin main

echo.
echo ===================================================
echo SUCCESS! Your code is live on GitHub!
echo Now open: https://vercel.com/new
echo Select "%REPO%" and click DEPLOY!
echo ===================================================
pause
