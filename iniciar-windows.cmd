@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto falta_node
where npm >nul 2>nul
if errorlevel 1 goto falta_node
if exist node_modules goto iniciar
call npm ci
if errorlevel 1 goto erro
:iniciar
echo Iniciando QA Atlas em http://127.0.0.1:5173
call npm run dev -- --open
exit /b
:falta_node
echo Instale o Node.js 24 LTS em https://nodejs.org/ e abra este arquivo novamente.
pause
exit /b 1
:erro
echo A instalacao nao terminou. Confira a conexao e a mensagem acima.
pause
exit /b 1
