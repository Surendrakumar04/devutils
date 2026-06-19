import { describe, it, expect } from "vitest";
import { toTypeScriptInterface } from "../toTypeScriptInterface";

describe("toTypeScriptInterface", () => {
  it("generates a basic interface", () => {
    const out = toTypeScriptInterface({ name: "Alice", age: 30 });
    expect(out).toContain("export interface Root");
    expect(out).toContain("name: string");
    expect(out).toContain("age: number");
  });

  it("marks nullable fields as optional", () => {
    const out = toTypeScriptInterface({ name: "Alice", bio: null });
    expect(out).toContain("bio?: null");
  });

  it("generates nested interfaces", () => {
    const out = toTypeScriptInterface({ user: { id: 1, email: "x@x.com" } });
    expect(out).toContain("export interface User");
    expect(out).toContain("id: number");
    expect(out).toContain("email: string");
  });

  it("handles boolean fields", () => {
    const out = toTypeScriptInterface({ active: true });
    expect(out).toContain("active: boolean");
  });

  it("handles array of strings", () => {
    const out = toTypeScriptInterface({ tags: ["a", "b"] });
    expect(out).toContain("tags: string[]");
  });

  it("handles empty array as unknown[]", () => {
    const out = toTypeScriptInterface({ items: [] });
    expect(out).toContain("items: unknown[]");
  });
});
