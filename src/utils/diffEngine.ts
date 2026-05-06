import { createTwoFilesPatch } from "diff";

/**
 * Diff Engine — generates precise diffs for smart_edit operations.
 *
 * Ports Claude Code's diff display style.
 */

export interface DiffResult {
  fileName: string;
  patch: string;
  additions: number;
  deletions: number;
  hunks: number;
}

/**
 * Generate a unified diff between old and new content.
 */
export function generateDiff(
  fileName: string,
  oldContent: string,
  newContent: string
): DiffResult {
  const patch = createTwoFilesPatch(
    fileName,
    fileName,
    oldContent,
    newContent,
    "original",
    "modified",
    { context: 3 }
  );

  const stats = countChanges(oldContent, newContent);

  return {
    fileName,
    patch,
    additions: stats.additions,
    deletions: stats.deletions,
    hunks: stats.hunks,
  };
}

/**
 * Count lines added/deleted between two texts.
 */
function countChanges(
  oldText: string,
  newText: string
): { additions: number; deletions: number; hunks: number } {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  // Use LCS-based approach for accurate counts
  const lcs = longestCommonSubsequence(oldLines, newLines);

  const deletions = oldLines.length - lcs.length;
  const additions = newLines.length - lcs.length;

  // Estimate hunk count (each contiguous block of changes is one hunk)
  const hunks = estimateHunks(oldLines, newLines);

  return { additions, deletions, hunks };
}

/**
 * Longest common subsequence for line arrays.
 */
function longestCommonSubsequence(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;

  // DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to construct LCS
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/**
 * Estimate number of hunks (contiguous change blocks).
 */
function estimateHunks(oldLines: string[], newLines: string[]): number {
  let hunks = 0;
  let inChange = false;

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = i < oldLines.length ? oldLines[i] : undefined;
    const newLine = i < newLines.length ? newLines[i] : undefined;

    if (oldLine !== newLine) {
      if (!inChange) {
        hunks++;
        inChange = true;
      }
    } else {
      inChange = false;
    }
  }

  return hunks;
}

/**
 * Find the exact position of a string within file content.
 * Returns { line, column } for each occurrence.
 */
export function findStringPositions(
  content: string,
  search: string
): Array<{ line: number; column: number; offset: number }> {
  const positions: Array<{ line: number; column: number; offset: number }> = [];
  let offset = 0;

  while ((offset = content.indexOf(search, offset)) !== -1) {
    const before = content.substring(0, offset);
    const lines = before.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    positions.push({ line, column, offset });
    offset += search.length;
  }

  return positions;
}

/**
 * Suggest similar strings within content (fuzzy matching for smart_edit).
 */
export function findSimilarText(
  content: string,
  search: string,
  maxResults: number = 3
): Array<{ text: string; line: number; score: number }> {
  const lines = content.split("\n");
  const results: Array<{ text: string; line: number; score: number }> = [];

  const searchClean = search.replace(/\s+/g, " ").trim();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineClean = line.replace(/\s+/g, " ").trim();

    if (!lineClean) continue;

    const score = similarityScore(lineClean, searchClean);
    if (score > 0) {
      results.push({
        text: line.trim(),
        line: i + 1,
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Simple heuristic similarity score between two strings (0-1).
 */
function similarityScore(a: string, b: string): number {
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;

  if (shorter.length === 0) return 0;

  // Check if shorter is a substring of longer
  if (longer.includes(shorter)) return 0.8;

  // Check prefix overlap
  const prefixLen = commonPrefixLength(a, b);
  if (prefixLen >= 10) {
    return (prefixLen / longer.length) * 0.6;
  }

  // Check character overlap ratio
  const aChars = new Set(a);
  const bChars = new Set(b);
  let overlap = 0;
  for (const c of aChars) {
    if (bChars.has(c)) overlap++;
  }
  const charScore = overlap / Math.max(aChars.size, bChars.size);

  return charScore * 0.3;
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}
