import { describe, it, expect } from "vitest";
import { validateCommand, sanitizeOutput, maskSecrets } from "../src/utils/sandbox.js";

const testConfig = {
  allowedCommands: ["ls", "cat", "grep", "find", "git", "npm", "node", "python"],
  blockedCommands: ["rm -rf", "sudo", "chmod 777", "curl", "wget"],
  timeoutMs: 30000,
  maxOutputBytes: 102400,
  workspaceRoot: "/home/user/project",
};

describe("Sandbox - validateCommand()", () => {
  it("allows safe commands", () => {
    const result = validateCommand("ls -la", testConfig);
    expect(result.valid).toBe(true);
  });

  it("allows git commands", () => {
    const result = validateCommand("git status", testConfig);
    expect(result.valid).toBe(true);
  });

  it("allows npm commands", () => {
    const result = validateCommand("npm run build", testConfig);
    expect(result.valid).toBe(true);
  });

  it("blocks 'rm -rf' pattern", () => {
    const result = validateCommand("rm -rf /tmp/test", testConfig);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("rm -rf");
  });

  it("blocks 'sudo' pattern", () => {
    const result = validateCommand("sudo apt install", testConfig);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("sudo");
  });

  it("blocks 'chmod 777' pattern", () => {
    const result = validateCommand("chmod 777 file.txt", testConfig);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("chmod 777");
  });

  it("blocks dangerous patterns like dd to /dev/", () => {
    const result = validateCommand("dd if=/dev/zero of=/dev/sda", testConfig);
    expect(result.valid).toBe(false);
  });

  it("blocks commands not in allowed list", () => {
    const result = validateCommand("curl https://example.com", testConfig);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("curl");
  });

  it("provides suggested fix for blocked commands", () => {
    const result = validateCommand("ssh user@host", testConfig);
    expect(result.valid).toBe(false);
    expect(result.suggestedFix).toBeDefined();
  });
});

describe("Sandbox - sanitizeOutput()", () => {
  it("strips ANSI escape codes", () => {
    const input = "\x1b[32mOK\x1b[0m\nResult";
    const output = sanitizeOutput(input, 1024);
    expect(output).not.toContain("\x1b[");
    expect(output).toContain("OK");
  });

  it("truncates to maxBytes", () => {
    const input = "a".repeat(2000);
    const output = sanitizeOutput(input, 100);
    expect(output.length).toBeLessThanOrEqual(100);
  });
});

describe("Sandbox - maskSecrets()", () => {
  it("masks API keys", () => {
    const cmd = 'curl --api-key sk-abc123def456 https://api.example.com';
    const masked = maskSecrets(cmd);
    expect(masked).not.toContain("sk-abc123def456");
    expect(masked).toContain("***");
  });

  it("masks Bearer tokens", () => {
    const cmd = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...';
    const masked = maskSecrets(cmd);
    expect(masked).not.toContain("eyJhbGciOiJIUzI1NiIs");
    expect(masked).toContain("***");
  });

  it("preserves safe parts of command", () => {
    const cmd = "git push origin main";
    const masked = maskSecrets(cmd);
    expect(masked).toBe(cmd); // No secrets to mask
  });
});
