/** Prompt templates for common tasks. */
export declare const PROMPT_TEMPLATES: {
    /**
     * Template for code review tasks.
     */
    codeReview: (language: string, code: string) => string;
    /**
     * Template for bug fixing.
     */
    bugFix: (description: string, code: string) => string;
    /**
     * Template for refactoring.
     */
    refactor: (description: string, code: string) => string;
    /**
     * Template for test generation.
     */
    generateTests: (code: string, framework?: string) => string;
};
/**
 * Tool definitions sent to the model for function-calling via <tool_call>.
 */
export declare const TOOL_DEFINITIONS_FOR_MODEL = "\n### smart_edit \u2014 \u7CBE\u786E\u66FF\u6362\u6587\u4EF6\u5185\u5BB9\n\u53C2\u6570: file_path (\u5FC5\u586B), old_string (\u5FC5\u586B), new_string (\u5FC5\u586B), expected_replacements (\u53EF\u9009, \u9ED8\u8BA41)\n\n### glob_search \u2014 \u6309\u6587\u4EF6\u540D\u6A21\u5F0F\u641C\u7D22\n\u53C2\u6570: pattern (\u5FC5\u586B), path (\u53EF\u9009)\n\n### grep_search \u2014 \u6B63\u5219\u641C\u7D22\u6587\u4EF6\u5185\u5BB9\n\u53C2\u6570: pattern (\u5FC5\u586B), path (\u53EF\u9009), glob (\u53EF\u9009), contextAround (\u53EF\u9009), ignoreCase (\u53EF\u9009)\n\n### read_file \u2014 \u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9\uFF08\u5E26\u884C\u53F7\uFF09\n\u53C2\u6570: file_path (\u5FC5\u586B), offset (\u53EF\u9009), limit (\u53EF\u9009)\n\n### write_file \u2014 \u6574\u6587\u4EF6\u5199\u5165/\u521B\u5EFA\n\u53C2\u6570: file_path (\u5FC5\u586B), content (\u5FC5\u586B)\n\n### bash_exec \u2014 \u6267\u884C Shell \u547D\u4EE4\uFF08\u6C99\u76D2\u5B89\u5168\u9650\u5236\uFF09\n\u53C2\u6570: command (\u5FC5\u586B), description (\u5FC5\u586B), timeoutMs (\u53EF\u9009)\n\n### task_agent \u2014 \u542F\u52A8\u5B50Agent\u5904\u7406\u72EC\u7ACB\u4EFB\u52A1\n\u53C2\u6570: description (\u5FC5\u586B), prompt (\u5FC5\u586B), subagent_type (\u5FC5\u586B: search/explore/plan/generate), context_files (\u53EF\u9009)";
export declare const TOOL_USAGE_INSTRUCTIONS = "\n## \u5DE5\u5177\u4F7F\u7528\u4F18\u5148\u7EA7\n\n\u5F53\u9700\u8981\u4FEE\u6539\u4EE3\u7801\u65F6\uFF0C\u6309\u4EE5\u4E0B\u4F18\u5148\u7EA7\u9009\u62E9\u5DE5\u5177\uFF1A\n1. **smart_edit** \u2014 \u9996\u9009\uFF0C\u7CBE\u786E\u66FF\u6362\uFF08\u5982\u679C\u77E5\u9053\u8981\u6539\u4EC0\u4E48\uFF09\n2. **write_file** \u2014 \u6574\u4E2A\u6587\u4EF6\u66FF\u6362\uFF08\u521B\u5EFA\u65B0\u6587\u4EF6\u6216\u5927\u5E45\u4FEE\u6539\uFF09\n3. **bash_exec** \u2014 \u8FD0\u884C\u547D\u4EE4\uFF08\u6784\u5EFA/\u6D4B\u8BD5/git \u64CD\u4F5C\uFF09\n\n\u5F53\u9700\u8981\u67E5\u627E\u4FE1\u606F\u65F6\uFF1A\n1. **glob_search** \u2014 \u6309\u6587\u4EF6\u540D\u627E\u6587\u4EF6\n2. **grep_search** \u2014 \u641C\u7D22\u6587\u4EF6\u5185\u5BB9\n3. **read_file** \u2014 \u8BFB\u53D6\u6587\u4EF6\u67E5\u770B\u7EC6\u8282\n\n\u5F53\u4EFB\u52A1\u8FC7\u4E8E\u590D\u6742\u65F6\uFF1A\n1. **task_agent** \u2014 \u5206\u62C6\u4E3A\u5B50\u4EFB\u52A1\u5E76\u884C\u5904\u7406\n";
//# sourceMappingURL=templates.d.ts.map