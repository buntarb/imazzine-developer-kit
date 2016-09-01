@echo off

rem default path to idk script is where your are
set PATHIDK=./idk

if NOT EXIST "%PATHIDK%" (
call :error "Script idk not found"
goto :eof
)

set PARAMS=

:repeat
if "%1"=="" goto endrepeat

set PARAMS=%PARAMS% %1%
shift
goto repeat

:endrepeat
call node %PATHIDK% %PARAMS%
goto :eof

:error
echo -----------------------------------------------------------------------------------
echo ERROR: %~1
echo -----------------------------------------------------------------------------------
goto :eof