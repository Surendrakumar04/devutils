import { describe, it, expect } from "vitest";
import { sortKeys } from "../sortKeys";

describe("sortKeys", () => {
  it("sorts object keys alphabetically", () => {
    const result = sortKeys({ z: 1, a: 2, m: 3 }) as Record<string, number>;
    expect(Object.keys(result)).toEqual(["a", "m", "z"]);
  });

  it("sorts nested object keys", () => {
    const result = sortKeys({ b: { y: 1, x: 2 }, a: 3 }) as Record<string, unknown>;
    expect(Object.keys(result)).toEqual(["a", "b"]);
    expect(Object.keys(result.b as object)).toEqual(["x", "y"]);
  });

  it("does not sort array items", () => {
    const result = sortKeys([3, 1, 2]);
    expect(result).toEqual([3, 1, 2]);
  });

  it("sorts keys inside array objects", () => {
    const result = sortKeys([{ b: 1, a: 2 }]) as Array<Record<string, number>>;
    expect(Object.keys(result[0])).toEqual(["a", "b"]);
  });

  it("passes through primitives unchanged", () => {
    expect(sortKeys(42)).toBe(42);
    expect(sortKeys("hello")).toBe("hello");
    expect(sortKeys(null)).toBeNull();
  });
});
