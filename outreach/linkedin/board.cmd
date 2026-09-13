@echo off
rem Double-click to open the LinkedIn board. Close this window to stop it.
cd /d "%~dp0..\.."
node outreach\linkedin\board.mjs
