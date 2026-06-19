import { describe, it, expect } from "vitest";
import { format, minify } from "../format";

describe("format", () => {
  it("pretty-prints with 2-space indent by default", () => {
    const out = format('{"a":1,"b":2}');
    expect(out).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("respects custom indent", () => {
    const out = format('{"a":1}', { indent: 4 });
    expect(out).toBe('{\n    "a": 1\n}');
  });

  it("handles nested arrays", () => {
    const out = format("[1,[2,3]]");
    expect(out).toContain("[\n  1,\n  [\n    2,\n    3\n  ]\n]");
  });

  it("throws on invalid JSON", () => {
    expect(() => format("{bad}")).toThrow();
  });
});

describe("minify", () => {
  it("removes whitespace", () => {
    expect(minify('{\n  "a": 1\n}')).toBe('{"a":1}');
  });

  it("round-trips: format then minify", () => {
    const orig = '{"x":1,"y":[1,2,3]}';
    expect(minify(format(orig))).toBe(orig);
  });

  it("throws on invalid JSON", () => {
    expect(() => minify("{bad}")).toThrow();
  });
});
