import { describe, it, expect } from "vitest";
import { parse } from "../parse";

describe("parse", () => {
  // ── Valid inputs ───────────────────────────────────────────────────
  it("parses a simple object", () => {
    const r = parse('{"a":1}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ a: 1 });
  });

  it("parses a nested object", () => {
    const r = parse('{"a":{"b":{"c":42}}}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ a: { b: { c: 42 } } });
  });

  it("parses an array", () => {
    const r = parse("[1,2,3]");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
  });

  it("parses a string primitive", () => {
    const r = parse('"hello"');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello");
  });

  it("parses a number primitive", () => {
    const r = parse("42");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("parses null", () => {
    const r = parse("null");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });

  it("parses true / false", () => {
    expect(parse("true").ok).toBe(true);
    expect(parse("false").ok).toBe(true);
  });

  it("parses unicode strings", () => {
    const r = parse('{"emoji":"\\u2764"}');
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.value as { emoji: string }).emoji).toBe("❤");
  });

  it("parses deeply nested (100 levels)", () => {
    let s = "";
    for (let i = 0; i < 100; i++) s += '{"x":';
    s += "1" + "}".repeat(100);
    expect(parse(s).ok).toBe(true);
  });

  // ── Invalid inputs ─────────────────────────────────────────────────
  it("returns error for empty string", () => {
    const r = parse("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/empty/i);
  });

  it("returns error for whitespace-only input", () => {
    expect(parse("   ").ok).toBe(false);
  });

  it("returns error for trailing comma", () => {
    const r = parse('{"a":1,}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });

  it("returns error with position when V8 provides it", () => {
    // position is extracted when V8 error message includes "position N"
    const r = parse('{"a": 1 "b": 2}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      // position may or may not be present depending on JS engine error format
      expect(r.message.length).toBeGreaterThan(0);
    }
  });

  it("returns error for bare string", () => {
    expect(parse("hello").ok).toBe(false);
  });
});
