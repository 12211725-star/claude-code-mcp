import { describe, it, expect } from "vitest";
import { ToolRouter } from "../src/agent/toolRouter.js";

describe("ToolRouter", () => {
  describe("route()", () => {
    it("routes file search to glob_search", () => {
      const results = ToolRouter.route("找一下所有的TypeScript文件");
      expect(results[0].tool).toBe("glob_search");
      expect(results[0].confidence).toBeGreaterThan(0.9);
    });

    it("routes content search to grep_search", () => {
      const results = ToolRouter.route("搜索包含 handleSubmit 函数的代码");
      expect(results[0].tool).toBe("grep_search");
    });

    it("routes read request to read_file", () => {
      const results = ToolRouter.route("读一下 package.json 文件");
      expect(results[0].tool).toBe("read_file");
    });

    it("routes edit request to smart_edit", () => {
      const results = ToolRouter.route("修改 index.ts 中的配置代码");
      expect(results[0].tool).toBe("smart_edit");
    });

    it("routes create request to write_file", () => {
      const results = ToolRouter.route("创建一个新的组件文件");
      expect(results[0].tool).toBe("write_file");
    });

    it("routes npm/build commands to bash_exec", () => {
      const results = ToolRouter.route("运行 npm install 安装依赖");
      expect(results[0].tool).toBe("bash_exec");
    });

    it("routes complex tasks to task_agent", () => {
      const results = ToolRouter.route("这个项目很复杂，需要全面分析整个项目结构");
      expect(results[0].tool).toBe("task_agent");
    });

    it("defaults to read_file when nothing matches", () => {
      const results = ToolRouter.route("你好");
      expect(results[0].tool).toBe("read_file");
      expect(results[0].confidence).toBe(0.3);
    });

    it("returns results sorted by confidence", () => {
      const results = ToolRouter.route("搜索 TypeScript 文件并修改");
      expect(results.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].confidence).toBeLessThanOrEqual(results[i - 1].confidence);
      }
    });
  });

  describe("bestTool()", () => {
    it("returns the highest confidence tool", () => {
      const best = ToolRouter.bestTool("找文件");
      expect(best.tool).toBe("glob_search");
    });
  });

  describe("availableTools()", () => {
    it("returns all 7 tools", () => {
      const tools = ToolRouter.availableTools();
      expect(tools).toHaveLength(7);
    });

    it("includes all expected tool names", () => {
      const tools = ToolRouter.availableTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain("glob_search");
      expect(names).toContain("grep_search");
      expect(names).toContain("read_file");
      expect(names).toContain("smart_edit");
      expect(names).toContain("write_file");
      expect(names).toContain("bash_exec");
      expect(names).toContain("task_agent");
    });
  });

  describe("isToolForFileType()", () => {
    it("allows read_file for binary files", () => {
      expect(ToolRouter.isToolForFileType("read_file", "image.png")).toBe(true);
    });

    it("allows bash_exec regardless of file type", () => {
      expect(ToolRouter.isToolForFileType("bash_exec", "binary.pdf")).toBe(true);
    });
  });
});
