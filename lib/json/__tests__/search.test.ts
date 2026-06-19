import { describe, it, expect } from "vitest";
import { search } from "../search";

const data = {
  user: {
    name: "Alice",
    email: "alice@example.com",
    age: 30,
    active: true,
  },
  tags: ["admin", "editor"],
  score: 99.5,
};

describe("search", () => {
  it("returns empty array for empty query", () => {
    expect(search(data, "")).toHaveLength(0);
  });

  it("finds by key name", () => {
    const results = search(data, "email");
    expect(results.some((r) => r.path.includes("email"))).toBe(true);
  });

  it("finds by value substring", () => {
    const results = search(data, "alice@");
    expect(results.some((r) => r.valueMatch)).toBe(true);
  });

  it("is case-insensitive", () => {
    const results = search(data, "ALICE");
    expect(results.length).toBeGreaterThan(0);
  });

  it("handles JSONPath $.user.name", () => {
    const results = search(data, "$.user.name");
    expect(results.length).toBe(1);
    expect(results[0].value).toBe("Alice");
  });

  it("handles JSONPath wildcard $.user.*", () => {
    const results = search(data, "$.user.*");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for non-matching query", () => {
    expect(search(data, "zzznomatch")).toHaveLength(0);
  });
});
