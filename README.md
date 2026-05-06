# Claude Code Agent MCP Server

> 将 Claude Code 核心 Agent 架构移植为 MCP Server，支持国产大模型

[![npm version](https://img.shields.io/npm/v/claude-code-agent-mcp.svg)](https://www.npmjs.com/package/claude-code-agent-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## ✨ 特性

- **7个核心工具** - 对标 Claude Code 的核心能力
- **国产模型支持** - DeepSeek、豆包、通义千问
- **多轮 Agent 循环** - Plan → Execute → Observe → Finalize
- **智能工具路由** - 根据自然语言意图推荐工具
- **安全沙盒** - 白名单+黑名单命令控制
- **Token 管理** - 上下文压缩+自动估算

## 📦 安装

```bash
# npm
npm install -g claude-code-agent-mcp

# 或 pnpm
pnpm add -g claude-code-agent-mcp

# 或从源码
git clone https://github.com/12211725-star/claude-code-mcp.git
cd claude-code-agent-mcp
npm install
npm run build
```

## 🚀 快速开始

### 1. 配置环境变量

```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env，填入 API Key
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

### 2. 启动 MCP Server

```bash
# 直接运行
node dist/index.js

# 或使用 npm
npm start

# 或使用 MCP Inspector 调试
npm run inspect
```

### 3. 配置到 Trae IDE / Cherry Studio

在 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "claude-code-agent": {
      "command": "node",
      "args": ["/path/to/claude-code-mcp/dist/index.js"],
      "env": {
        "DEEPSEEK_API_KEY": "sk-your-api-key"
      }
    }
  }
}
```

## 🛠️ 7个核心工具

| 工具 | 说明 | 对标 Claude Code |
|:-----|:-----|:-----------------|
| `glob_search` | Glob模式搜索文件 | Glob |
| `grep_search` | 正则搜索文件内容 | Grep |
| `read_file` | 读取文件（带行号） | Read |
| `write_file` | 写入/创建文件 | Write |
| `smart_edit` | 精确字符串替换 | Edit |
| `bash_exec` | 执行Shell命令（沙盒） | Bash |
| `task_agent` | 启动子Agent处理独立任务 | Task |

## 🔧 配置说明

### config/default.json

```json
{
  "workspaceRoot": ".",
  "model": {
    "provider": "deepseek",
    "name": "deepseek-chat",
    "apiKey": ""
  },
  "context": {
    "maxTokens": 120000,
    "reservedTokensForResponse": 4096
  },
  "sandbox": {
    "allowedCommands": ["ls", "cat", "git", "npm", "node"],
    "blockedCommands": ["rm -rf", "sudo"]
  }
}
```

### 支持的模型

| Provider | 模型 | 说明 |
|:---------|:-----|:-----|
| `deepseek` | `deepseek-chat` | 推荐，性价比高 |
| `doubao` | `doubao-pro-32k` | 豆包大模型 |
| `qwen` | `qwen-max` | 通义千问 |
| `openai` | 自定义 | OpenAI 兼容接口 |

## 📖 使用示例

### 搜索文件

```typescript
// 用户: "找到所有的 TypeScript 文件"
// 自动路由到 glob_search
{
  "tool": "glob_search",
  "args": { "pattern": "**/*.ts" }
}
```

### 搜索代码

```typescript
// 用户: "查找所有 export 的函数"
// 自动路由到 grep_search
{
  "tool": "grep_search",
  "args": { "pattern": "export\\s+function", "glob": "*.ts" }
}
```

### 精确编辑

```typescript
// 用户: "把 hello 改成 world"
// 自动路由到 smart_edit
{
  "tool": "smart_edit",
  "args": {
    "path": "src/index.ts",
    "oldText": "hello",
    "newText": "world"
  }
}
```

## 🏗️ 架构

```
┌─────────────────────────────────────────────┐
│              MCP Server                      │
│  (注册工具 + 处理请求 + 返回结果)            │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────┴───────────────────────────┐
│           Agent Orchestrator                 │
│  Plan → Execute → Observe → Finalize        │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│  TaskPlanner  │   │  ToolRouter  │
│  任务分解     │   │  工具路由    │
└───────────────┘   └──────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────────┐
│              7 Tools                         │
└─────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           Model Adapter                      │
│  DeepSeek | Doubao | Qwen | OpenAI           │
└─────────────────────────────────────────────┘
```

## 🧪 开发

```bash
# 安装依赖
npm install

# 编译
npm run build

# 测试
npm test

# 开发模式（热重载）
npm run dev

# MCP Inspector 调试
npm run inspect
```

## 📄 License

[MIT](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [Claude Code](https://claude.ai) - 原始架构灵感
- [MCP SDK](https://github.com/anthropics/mcp) - Model Context Protocol
- [DeepSeek](https://deepseek.com) - 优秀的国产大模型