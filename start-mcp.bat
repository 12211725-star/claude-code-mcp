@echo off
REM ======================================================
REM Claude Code Agent MCP Server — Cherry Studio 启动脚本
REM 将此脚本路径配置到 Cherry Studio 的 MCP 设置中
REM ======================================================

REM 自动获取脚本所在目录作为项目根目录
set "PROJECT_DIR=%~dp0"

REM 设置 DeepSeek API Key（取消注释并替换为实际的 API Key）
REM set DEEPSEEK_API_KEY=sk-your-api-key-here

REM 可选：切换模型提供商
REM set MODEL_PROVIDER=deepseek    :: deepseek | doubao | qwen | openai
REM set MODEL_NAME=deepseek-chat

REM 设置工作区根目录（默认为当前目录，可改为实际工作目录）
if not defined WORKSPACE_ROOT set "WORKSPACE_ROOT=%PROJECT_DIR%"

cd /d "%PROJECT_DIR%"
node dist/index.js
