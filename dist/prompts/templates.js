/** Prompt templates for common tasks. */
export const PROMPT_TEMPLATES = {
    /**
     * Template for code review tasks.
     */
    codeReview: (language, code) => `请审查以下 ${language} 代码：\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n从以下方面评估：\n1. 正确性\n2. 性能\n3. 安全性\n4. 可维护性\n5. 代码风格`,
    /**
     * Template for bug fixing.
     */
    bugFix: (description, code) => `Bug 描述: ${description}\n\n相关代码:\n\`\`\`\n${code}\n\`\`\`\n\n请：\n1. 分析 bug 根因\n2. 提供修复方案\n3. 使用 smart_edit 执行修复`,
    /**
     * Template for refactoring.
     */
    refactor: (description, code) => `重构需求: ${description}\n\n原始代码:\n\`\`\`\n${code}\n\`\`\`\n\n请：\n1. 分析重构机会\n2. 在不改变外部行为的前提下重构\n3. 保持现有接口不变`,
    /**
     * Template for test generation.
     */
    generateTests: (code, framework = "vitest") => `为以下代码生成 ${framework} 测试:\n\n\`\`\`typescript\n${code}\n\`\`\`\n\n要求：\n- 覆盖主要逻辑路径\n- 包含边界条件和错误处理\n- 遵循 AAA 模式 (Arrange, Act, Assert)`,
};
/**
 * Tool definitions sent to the model for function-calling via <tool_call>.
 */
export const TOOL_DEFINITIONS_FOR_MODEL = `
### smart_edit — 精确替换文件内容
参数: file_path (必填), old_string (必填), new_string (必填), expected_replacements (可选, 默认1)

### glob_search — 按文件名模式搜索
参数: pattern (必填), path (可选)

### grep_search — 正则搜索文件内容
参数: pattern (必填), path (可选), glob (可选), contextAround (可选), ignoreCase (可选)

### read_file — 读取文件内容（带行号）
参数: file_path (必填), offset (可选), limit (可选)

### write_file — 整文件写入/创建
参数: file_path (必填), content (必填)

### bash_exec — 执行 Shell 命令（沙盒安全限制）
参数: command (必填), description (必填), timeoutMs (可选)

### task_agent — 启动子Agent处理独立任务
参数: description (必填), prompt (必填), subagent_type (必填: search/explore/plan/generate), context_files (可选)`;
export const TOOL_USAGE_INSTRUCTIONS = `
## 工具使用优先级

当需要修改代码时，按以下优先级选择工具：
1. **smart_edit** — 首选，精确替换（如果知道要改什么）
2. **write_file** — 整个文件替换（创建新文件或大幅修改）
3. **bash_exec** — 运行命令（构建/测试/git 操作）

当需要查找信息时：
1. **glob_search** — 按文件名找文件
2. **grep_search** — 搜索文件内容
3. **read_file** — 读取文件查看细节

当任务过于复杂时：
1. **task_agent** — 分拆为子任务并行处理
`;
//# sourceMappingURL=templates.js.map