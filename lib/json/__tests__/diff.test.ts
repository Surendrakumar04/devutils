import { describe, it, expect } from "vitest";
import { diffJson } from "../diff";

function stats(left: string, right: string) {
  return diffJson(left, right).stats;
}

function lines(left: string, right: string) {
  return diffJson(left, right).lines;
}

// ── Primitives ───────────────────────────────────────────────────────────────

describe("top-level primitives", () => {
  it("identical strings", () => {
    const r = stats('"hello"', '"hello"');
    expect(r).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 1 });
  });

  it("changed string", () => {
    const r = stats('"hello"', '"world"');
    expect(r.changed).toBe(1);
  });

  it("changed number", () => {
    const r = stats("42", "43");
    expect(r.changed).toBe(1);
  });

  it("number to string type change", () => {
    const r = stats("42", '"42"');
    expect(r.changed).toBe(1);
  });

  it("null to value", () => {
    const r = stats("null", '"hello"');
    expect(r.changed).toBe(1);
  });

  it("boolean flip", () => {
    const r = stats("true", "false");
    expect(r.changed).toBe(1);
  });
});

// ── Flat objects ─────────────────────────────────────────────────────────────

describe("flat objects", () => {
  it("identical objects — no diff", () => {
    const r = stats('{"a":1,"b":2}', '{"a":1,"b":2}');
    expect(r).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 2 });
  });

  it("one field added", () => {
    const r = stats('{"a":1}', '{"a":1,"b":2}');
    expect(r.added).toBe(1);
    expect(r.changed).toBe(0);
    expect(r.removed).toBe(0);
  });

  it("one field removed", () => {
    const r = stats('{"a":1,"b":2}', '{"a":1}');
    expect(r.removed).toBe(1);
    expect(r.changed).toBe(0);
    expect(r.added).toBe(0);
  });

  it("one field changed", () => {
    const r = stats('{"a":1,"b":2}', '{"a":1,"b":99}');
    expect(r.changed).toBe(1);
    expect(r.added).toBe(0);
    expect(r.removed).toBe(0);
  });

  it("multiple changes simultaneously", () => {
    const r = stats('{"a":1,"b":2,"c":3}', '{"a":1,"b":99,"d":4}');
    expect(r.changed).toBe(1); // b
    expect(r.removed).toBe(1); // c
    expect(r.added).toBe(1);   // d
  });

  it("all fields replaced", () => {
    const r = stats('{"a":1}', '{"b":2}');
    expect(r.removed).toBe(1);
    expect(r.added).toBe(1);
  });

  it("empty object to populated", () => {
    const r = stats('{}', '{"a":1}');
    expect(r.added).toBe(1);
  });

  it("populated to empty object", () => {
    const r = stats('{"a":1}', '{}');
    expect(r.removed).toBe(1);
  });

  it("both empty objects", () => {
    const r = stats('{}', '{}');
    expect(r).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 0 });
  });
});

// ── Nested objects ────────────────────────────────────────────────────────────

describe("nested objects", () => {
  it("nested unchanged", () => {
    const r = stats('{"a":{"x":1}}', '{"a":{"x":1}}');
    expect(r.changed).toBe(0);
  });

  it("nested field changed", () => {
    const r = stats('{"a":{"x":1}}', '{"a":{"x":2}}');
    expect(r.changed).toBe(1);
  });

  it("nested field added", () => {
    const r = stats('{"a":{"x":1}}', '{"a":{"x":1,"y":2}}');
    expect(r.added).toBe(1);
  });

  it("nested field removed", () => {
    const r = stats('{"a":{"x":1,"y":2}}', '{"a":{"x":1}}');
    expect(r.removed).toBe(1);
  });

  it("deeply nested change", () => {
    const r = stats(
      '{"a":{"b":{"c":{"d":1}}}}',
      '{"a":{"b":{"c":{"d":2}}}}'
    );
    expect(r.changed).toBe(1);
  });

  it("object replaced by primitive", () => {
    const r = stats('{"a":{"x":1}}', '{"a":42}');
    expect(r.removed).toBeGreaterThan(0);
    expect(r.added).toBeGreaterThan(0);
  });

  it("primitive replaced by object", () => {
    const r = stats('{"a":42}', '{"a":{"x":1}}');
    expect(r.removed).toBeGreaterThan(0);
    expect(r.added).toBeGreaterThan(0);
  });
});

// ── Arrays ────────────────────────────────────────────────────────────────────

describe("arrays", () => {
  it("identical arrays", () => {
    const r = stats("[1,2,3]", "[1,2,3]");
    expect(r.changed).toBe(0);
  });

  it("item changed at index", () => {
    const r = stats("[1,2,3]", "[1,99,3]");
    expect(r.changed).toBe(1);
  });

  it("item appended", () => {
    const r = stats("[1,2]", "[1,2,3]");
    expect(r.added).toBe(1);
  });

  it("item removed from end", () => {
    const r = stats("[1,2,3]", "[1,2]");
    expect(r.removed).toBe(1);
  });

  it("empty array to populated", () => {
    const r = stats("[]", "[1,2,3]");
    expect(r.added).toBe(3);
  });

  it("populated to empty array", () => {
    const r = stats("[1,2,3]", "[]");
    expect(r.removed).toBe(3);
  });

  it("both empty arrays", () => {
    const r = stats("[]", "[]");
    expect(r).toEqual({ added: 0, removed: 0, changed: 0, unchanged: 0 });
  });

  it("array of objects — field change inside item", () => {
    const r = stats(
      '[{"id":1,"val":"a"}]',
      '[{"id":1,"val":"b"}]'
    );
    expect(r.changed).toBe(1);
  });

  it("array of objects — extra item appended", () => {
    const r = stats(
      '[{"id":1}]',
      '[{"id":1},{"id":2}]'
    );
    expect(r.added).toBeGreaterThan(0);
  });
});

// ── Type coercions / edge values ──────────────────────────────────────────────

describe("edge values", () => {
  it("null field unchanged", () => {
    const r = stats('{"a":null}', '{"a":null}');
    expect(r.unchanged).toBe(1);
  });

  it("null field changed to value", () => {
    const r = stats('{"a":null}', '{"a":1}');
    expect(r.changed).toBe(1);
  });

  it("value changed to null", () => {
    const r = stats('{"a":1}', '{"a":null}');
    expect(r.changed).toBe(1);
  });

  it("zero vs false — different types", () => {
    const r = stats('{"a":0}', '{"a":false}');
    expect(r.changed).toBe(1);
  });

  it("empty string vs null", () => {
    const r = stats('{"a":""}', '{"a":null}');
    expect(r.changed).toBe(1);
  });

  it("unicode strings", () => {
    const r = stats('{"a":"héllo"}', '{"a":"héllo"}');
    expect(r.unchanged).toBe(1);
  });

  it("very long string value — no stack overflow", () => {
    const long = "x".repeat(10000);
    const r = stats(`{"a":"${long}"}`, `{"a":"${long}y"}`);
    expect(r.changed).toBe(1);
  });

  it("large flat object — no stack overflow", () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 500; i++) obj[`key${i}`] = i;
    const left = JSON.stringify(obj);
    const modified = { ...obj, key0: 999 };
    const right = JSON.stringify(modified);
    const r = stats(left, right);
    expect(r.changed).toBe(1);
    expect(r.unchanged).toBe(499);
  });

  it("deeply nested object — no stack overflow", () => {
    let obj: Record<string, unknown> = { val: 1 };
    for (let i = 0; i < 50; i++) obj = { nested: obj };
    const left = JSON.stringify(obj);
    const r = stats(left, left);
    expect(r.changed).toBe(0);
  });
});

// ── Line content correctness ─────────────────────────────────────────────────

describe("line content", () => {
  it("changed line shows both old and new value", () => {
    const ls = lines('{"age":30}', '{"age":31}');
    const changed = ls.find(l => l.type === "changed");
    expect(changed?.leftValue).toBe("30");
    expect(changed?.rightValue).toBe("31");
    expect(changed?.key).toBe("age");
  });

  it("added line has correct key and value", () => {
    const ls = lines('{}', '{"email":"a@b.com"}');
    const added = ls.find(l => l.type === "added");
    expect(added?.key).toBe("email");
    expect(added?.leftValue).toBe('"a@b.com"');
  });

  it("removed line has correct key", () => {
    const ls = lines('{"x":1}', '{}');
    const removed = ls.find(l => l.type === "removed");
    expect(removed?.key).toBe("x");
  });

  it("unchanged lines have matching left and right values", () => {
    const ls = lines('{"a":1,"b":2}', '{"a":1,"b":99}');
    const unchanged = ls.filter(l => l.type === "unchanged" && l.key !== null);
    for (const line of unchanged) {
      expect(line.leftValue).toBe(line.rightValue);
    }
  });
});
