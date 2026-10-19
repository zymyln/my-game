@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "LOOP_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "LOOP_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "node_modules\phaser\dist\phaser.min.js" (
  echo Preparing project dependencies...
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" (
    call "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" install --frozen-lockfile
  ) else (
    where pnpm >nul 2>nul
    if errorlevel 1 (call npm install) else (call pnpm install --frozen-lockfile)
  )
  if errorlevel 1 goto failed
)
"%LOOP_NODE%" tools\dev.mjs --open %*
if errorlevel 1 goto failed
exit /b 0
:failed
echo Preview could not start. Keep this message and ask Codex to check it.
pause
exit /b 1
