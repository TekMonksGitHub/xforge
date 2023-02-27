@echo off
setlocal

@REM if the password is not defined, the private key will be used
if ["%~2"]==["undefined"] (
    if ["%~3"]==["undefined"] (
        @REM if the host key is not defined, omit it
        "%~dp0\3p\plink.exe" -batch -C -l %1 -i %6 -m %4 %5
    ) else (
        @echo "%~dp0\3p\plink.exe" -batch -C -l %1 -i %6 -hostkey %3 -m %4 %5
        "%~dp0\3p\plink.exe" -batch -C -l %1 -i %6 -hostkey %3 -m %4 %5 
    )
) else (
    if ["%~3"]==["undefined"] (
        @REM if the host key is not defined, omit it
        "%~dp0\3p\plink.exe" -batch -C -l %1 -pw %2 -m %4 %5
    ) else (
        "%~dp0\3p\plink.exe" -batch -C -l %1 -pw %2 -hostkey %3 -m %4 %5 
    )
)

exit /b %errorlevel%