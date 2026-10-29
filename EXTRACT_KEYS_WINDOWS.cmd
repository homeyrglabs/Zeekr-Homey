@echo off
setlocal
TITLE Zeekr - offline EU 2.9.9 key extraction
where py >nul 2>nul
if errorlevel 1 goto python_error
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3,10) else 1)"
if errorlevel 1 goto python_error
set "ZEEKR_SETUP_VENV=%LOCALAPPDATA%\HomeyZeekrTools\venv"
if not exist "%ZEEKR_SETUP_VENV%\Scripts\python.exe" (
  py -3 -m venv "%ZEEKR_SETUP_VENV%"
  if errorlevel 1 goto failed
)
"%ZEEKR_SETUP_VENV%\Scripts\python.exe" -m pip install -r "%~dp0tools\requirements-extract.txt"
if errorlevel 1 goto failed
"%ZEEKR_SETUP_VENV%\Scripts\python.exe" "%~dp0tools\extract_eu_299.py" %*
if errorlevel 1 goto failed
echo.
echo Success. Read the saved JSON path above. Do not share the JSON.
pause
exit /b 0
:python_error
echo Install Python 3.10 or newer from https://www.python.org/downloads/windows/
echo Enable the Python launcher during installation, then try again.
:failed
echo.
echo Setup did not complete. Read the message above and KEYS.sv.md.
pause
exit /b 1
