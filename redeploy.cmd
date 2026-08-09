@echo off
title Deploying Updates to https://techinnosphere-mumbai.surge.sh
cd /d "c:\Users\thund\Downloads\Techinnosphere"
echo Building and publishing updates to https://techinnosphere-mumbai.surge.sh ...
npm run deploy
echo.
echo SUCCESS! Your changes are live at https://techinnosphere-mumbai.surge.sh
pause
