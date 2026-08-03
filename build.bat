@echo off
setlocal enabledelayedexpansion

if "%VCPKG_ROOT%"=="" set "VCPKG_ROOT=%userprofile%\vcpkg\vcpkg"
set "TRIPLET=x64-windows-static"
set "SRC_DIR=%~dp0"
set "BUILD_DIR=%SRC_DIR%build"

@REM if not exist "%VCPKG_ROOT%\vcpkg.exe" (
@REM     echo vcpkg.exe not found at "%VCPKG_ROOT%".
@REM     echo Clone and bootstrap it first, or set VCPKG_ROOT to point at an existing install.
@REM     exit /b 1
@REM )

@REM echo === Installing dependencies via vcpkg [%TRIPLET%] ===
@REM "%VCPKG_ROOT%\vcpkg.exe" install --triplet %TRIPLET% libwebsockets libuv json-c zlib openssl getopt-win32
@REM if errorlevel 1 goto :error



echo === Configuring [clang-cl / Visual Studio 17 2022] ===
cmake -S "%SRC_DIR%." -B "%BUILD_DIR%" -G "Visual Studio 17 2022" -A x64 -T ClangCL ^
    -DCMAKE_BUILD_TYPE=Release ^
    -DCMAKE_TOOLCHAIN_FILE="%VCPKG_ROOT%\scripts\buildsystems\vcpkg.cmake" ^
    -DVCPKG_TARGET_TRIPLET=%TRIPLET%
if errorlevel 1 goto :error

echo === Building ===
cmake --build "%BUILD_DIR%" --config Release
if errorlevel 1 goto :error

echo.
echo Done: %BUILD_DIR%\Release\ttyd.exe
goto :eof

:error
echo Build failed.
exit /b 1
