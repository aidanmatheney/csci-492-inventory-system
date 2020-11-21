@ECHO OFF

ECHO The following directories will be deleted:
FOR /d /r . %%d IN (bin) DO @IF EXIST "%%d" ECHO "%%d"
FOR /d /r . %%d IN (obj) DO @IF EXIST "%%d" ECHO "%%d"
FOR /d /r . %%d IN (.vs) DO @IF EXIST "%%d" ECHO "%%d"

ECHO.
ECHO Press any key to confirm. Exit the window to cancel.
PAUSE > NUL

FOR /d /r . %%d IN (bin) DO @IF EXIST "%%d" RD /S /Q "%%d"
FOR /d /r . %%d IN (obj) DO @IF EXIST "%%d" RD /S /Q "%%d"
FOR /d /r . %%d IN (.vs) DO @IF EXIST "%%d" RD /S /Q "%%d"

PAUSE
