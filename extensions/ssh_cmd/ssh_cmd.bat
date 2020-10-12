@echo off
setlocal

"%~dp0\3p\plink.exe" -batch -C -l %1 -pw %2 -hostkey %3 -m %4 %5

exit /b %errorlevel%