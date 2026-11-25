@echo off
title SIMATS Examination Timetable System - Launcher
echo ===============================================================================
echo SIMATS ENGINEERING - Saveetha Institute of Medical and Technical Sciences
echo Capstone Project: Constraint-Based Examination Timetable & Resource Allocation
echo Team: M. Thanuja (192425356), Dasari Sai Pavani (192520032), P. Varshini (192472372)
echo Guide: Dr. Charlyn Pusha Latha, Professor
echo ===============================================================================
echo.
echo Launching Backend (Spring Boot REST APIs on Port 8080)...
start "SIMATS Backend" cmd /k "%~dp0run-backend.bat"

echo Waiting 5 seconds for backend initialization...
timeout /t 5 /nobreak >nul

echo Launching Frontend (React.js UI on Port 5173)...
start "SIMATS Frontend" cmd /k "%~dp0run-frontend.bat"

echo.
echo System launched!
echo Access the Application at: http://localhost:5173
echo Backend API Docs / H2 Console: http://localhost:8080/h2-console
echo Default Admin Credentials: admin / admin123
echo ===============================================================================
pause

