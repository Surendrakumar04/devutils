import { describe, it, expect } from "vitest";
import { repair } from "../repair";
import { parse } from "../parse";

describe("repair", () => {
  it("returns alreadyValid=true for valid JSON", () => {
    const r = repair('{"a":1}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.alreadyValid).toBe(true);
      expect(r.changes).toHaveLength(0);
    }
  });

  it("fixes trailing comma in object", () => {
    const r = repair('{"a":1,}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(parse(r.repaired).ok).toBe(true);
      expect(r.alreadyValid).toBe(false);
    }
  });

  it("fixes trailing comma in array", () => {
    const r = repair("[1,2,3,]");
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });

  it("fixes single-quoted strings", () => {
    const r = repair("{'key':'value'}");
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });

  it("removes JS single-line comments", () => {
    const r = repair('{\n  // comment\n  "a":1\n}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });

  it("removes JS block comments", () => {
    const r = repair('{\n  /* block */\n  "a":1\n}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });

  it("fixes unquoted keys", () => {
    const r = repair("{key: 'value'}");
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });

  it("returns changes array with at least one entry for repaired input", () => {
    const r = repair('{"a":1,}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.changes.length).toBeGreaterThan(0);
  });

  it("handles multiple issues in one input", () => {
    const r = repair("{key: 'value', // comment\n}");
    expect(r.ok).toBe(true);
    if (r.ok) expect(parse(r.repaired).ok).toBe(true);
  });
});
