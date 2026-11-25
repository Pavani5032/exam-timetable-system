@echo off
title SIMATS Examination System - Backend
echo =====================================================================
echo Starting Java Spring Boot Backend (Port 8080)...
echo Technology Stack: Spring Boot 3.2.5, Java 21, DSATUR Engine, MySQL/H2
echo =====================================================================

cd /d "%~dp0backend"
set "JAVA_HOME=C:\Program Files\JetBrains\PyCharm 2025.2.4\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

"C:\Users\Pavani\.gradle\wrapper\dists\gradle-8.14-all\c2qonpi39x1mddn7hk5gh9iqj\gradle-8.14\bin\gradle.bat" bootRun
pause

