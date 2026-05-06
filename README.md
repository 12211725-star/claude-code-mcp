# Claude Code Agent MCP Server

将 Claude Code 核心 Agent 架构移植为 MCP Server，支持国产大模型，可在任何 MCP 客户端中使用。

## 7 个核心工具（对标 Claude Code）

| 工具 | 对标原生 | 说明 |
|------|----------|------|
| `smart_edit` | Edit | 精确字符串替换 + diff |
| `glob_search` | Glob | glob 模式搜索文件 |
| `grep_search` | Grep | 正则搜索文件内容 |
| `read_file` | Read | 带行号读取 + 图片 base64 |
| `write_file` | Write | 写入/创建文件 |
| `bash_exec` | Bash | Shell 命令（安全沙盒） |
| `task_agent` | Task | 子 Agent 独立任务 |

## 核心架构

```
用户请求 → Plan(分解) → Model → <tool_call> → Execute → 结果反馈 → Loop → 最终输出
```

- **多轮 Agent 循环**：Plan → Execute → Observe → Repeat
- **上下文压缩**：自动摘要旧消息，防止 token 溢出
- **任务规划**：规则引擎自动分解复杂任务
- **工具路由**：自然语言 → 工具推荐
- **安全沙盒**：命令黑名单 + 危险模式检测

## 支持的模型

| 提供商 | 模型 |
|--------|------|
| DeepSeek | `deepseek-chat` |
| 豆包 | `doubao-pro-32k` |
| 通义千问 | `qwen-max` |
| OpenAI 兼容 | 自定义 |

## 快速开始

```bash
npm install
npm run build

# 配置 API Key
export DEEPSEEK_API_KEY="sk-xxx"

# 在 MCP 客户端配置启动命令
node dist/index.js
```

## 测试

```bash
npm test
# 57 tests, 5 files, all passing
```

## 项目结构

```
src/
├── agent/         # 编排引擎、任务规划、工具路由
├── tools/         # 7 个工具实现
├── models/        # DeepSeek/豆包/千问适配器
├── context/       # 上下文管理 + Token 估算
├── prompts/       # 系统提示词 + 任务模板
└── utils/         # 配置、日志、沙盒、diff、git
tests/             # 57 个单元测试
```
