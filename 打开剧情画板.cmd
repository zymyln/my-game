@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "STORY_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "STORY_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%STORY_NODE%" tools\story-map\server.mjs --open %*
if errorlevel 1 (
  echo 无法启动。需要 Node.js 20 或更新版本；也可使用已有的 Codex Node 运行环境。
  pause
  exit /b 1
)
exit /b 0
