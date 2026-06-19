import { describe, it, expect } from "vitest";
import { parse } from "../parse";
import { format } from "../format";

function generateLargeObject(keyCount: number): string {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < keyCount; i++) {
    obj[`key_${i}`] = { value: i, label: `item_${i}`, active: i % 2 === 0 };
  }
  return JSON.stringify(obj);
}

describe("performance", () => {
  it("parses 5000-key object in under 500ms", () => {
    const input = generateLargeObject(5000);
    const start = performance.now();
    const r = parse(input);
    const elapsed = performance.now() - start;
    expect(r.ok).toBe(true);
    expect(elapsed).toBeLessThan(500);
  });

  it("formats 5000-key object in under 500ms", () => {
    const input = generateLargeObject(5000);
    const start = performance.now();
    const out = format(input);
    const elapsed = performance.now() - start;
    expect(out.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(500);
  });

  it("handles array of 10000 items", () => {
    const arr = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `item_${i}` }));
    const input = JSON.stringify(arr);
    const r = parse(input);
    expect(r.ok).toBe(true);
  });
});
