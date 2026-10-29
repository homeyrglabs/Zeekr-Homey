@echo off
setlocal
TITLE Zeekr for Homey - install or update
pushd "%~dp0app" || goto folder_error
where node >nul 2>nul
if errorlevel 1 goto node_error
node -e "if(Number(process.versions.node.split('.')[0]) < 24) process.exit(1)"
if errorlevel 1 goto node_error
where npm.cmd >nul 2>nul
if errorlevel 1 goto node_error
echo.
echo Zeekr - unofficial community integration for Homey Pro
echo This installs the app on the Homey you select using your own account.
echo No ongoing maintenance or support is promised.
echo.
pause
call npm.cmd install --global homey@4.6.2
if errorlevel 1 goto install_error
call homey.cmd login
if errorlevel 1 goto install_error
call homey.cmd app install
if errorlevel 1 goto install_error
echo.
echo Check Homey Apps to confirm that Zeekr is installed.
echo For first-time setup, add a Zeekr EU device in Homey.
echo Use your own Zeekr account and valid EU key JSON.
echo Keep an existing working account configuration when updating.
echo.
popd
pause
exit /b 0
:node_error
echo.
echo Install Node.js 24 or newer from https://nodejs.org/ and try again.
goto failed
:install_error
echo.
echo The command failed. Read the message above before trying again.
goto failed
:folder_error
echo The app folder is missing. Extract the complete ZIP before running this file.
pause
exit /b 1
:failed
popd
pause
exit /b 1
