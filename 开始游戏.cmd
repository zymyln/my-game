@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node src/server.mjs --open
  goto :done
)
set "GAME_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%GAME_NODE%" (
  "%GAME_NODE%" src/server.mjs --open
  goto :done
)
echo Node.js was not found. Open this project in Codex, or install Node.js LTS.
pause
exit /b 1
:done
if errorlevel 1 pause
