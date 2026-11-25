@echo off
title SIMATS Examination System - Online Public Sharable Link
echo ===============================================================================
echo SIMATS ENGINEERING - Saveetha Institute of Medical and Technical Sciences
echo Creating a Live Public HTTPS Link (Accessible from Any Mobile / Laptop / PC)
echo ===============================================================================
echo.
echo Your Current Wi-Fi / LAN IP (for devices on the same Wi-Fi):
echo http://10.108.114.90:5173
echo.
echo Fetching Public IP for Localtunnel verification password...
for /f "delims=" %%a in ('powershell -Command "(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content"') do set PUBLIC_IP=%%a
echo Your Tunnel Verification Password (if prompted): %PUBLIC_IP%
echo.
echo Starting Localtunnel on Port 5173...
echo Copy the "https://....loca.lt" URL below and share it with anyone!
echo (If prompted on mobile, enter the password: %PUBLIC_IP%)
echo ===============================================================================
echo.
npx --yes localtunnel --port 5173
pause
