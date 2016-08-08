@echo off

rem default path to idk script is where your are
set PATHIDK="./idk"

if NOT EXIST "%PATHIDK%" (
call :error "Script idk not found"
goto :eof
)

call node "%PATHIDK%" %1 %2
goto :eof

:error
echo -----------------------------------------------------------------------------------
echo ERROR: %~1
echo -----------------------------------------------------------------------------------
goto :eof