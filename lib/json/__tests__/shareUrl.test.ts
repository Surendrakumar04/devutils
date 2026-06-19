import { describe, it, expect } from "vitest";
import { canShare, encodeShareUrl, decodeShareUrl } from "../shareUrl";

describe("shareUrl", () => {
  const small = '{"a":1}';
  const large = JSON.stringify({ data: "x".repeat(6000) });

  it("canShare returns true for small JSON", () => {
    expect(canShare(small)).toBe(true);
  });

  it("canShare returns false for large JSON", () => {
    expect(canShare(large)).toBe(false);
  });

  it("encode/decode round-trips", () => {
    const hash = encodeShareUrl(small);
    expect(decodeShareUrl(hash)).toBe(small);
  });

  it("encode/decode handles unicode", () => {
    const json = '{"emoji":"❤️"}';
    const hash = encodeShareUrl(json);
    expect(decodeShareUrl(hash)).toBe(json);
  });

  it("decodeShareUrl returns null for invalid hash", () => {
    expect(decodeShareUrl("")).toBeNull();
    expect(decodeShareUrl("#other=stuff")).toBeNull();
  });
});
