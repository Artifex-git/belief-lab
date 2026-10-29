import { describe, it, expect } from "vitest";
import { recurringRoot } from "../../src/roots.js";
const e = (root, t, extra = {}) => ({ root, created_at: t, ...extra });
describe("recurringRoot", () => {
  it("finds a root in 3 of the last 5", () => expect(recurringRoot([e("worth", 5), e("safety", 4), e("worth", 3), e("control", 2), e("worth", 1)])).toEqual({ root: "worth", count: 3, of: 5 }));
  it("needs at least 3", () => expect(recurringRoot([e("worth", 3), e("worth", 2), e("safety", 1)])).toBeNull());
  it("ignores examples and old entries beyond the window", () => expect(recurringRoot([e("a", 9), e("b", 8), e("c", 7), e("d", 6), e("e", 5), e("worth", 4), e("worth", 3), e("worth", 2)])).toBeNull());
  it("ignores example entries", () => expect(recurringRoot([e("worth", 3, { example: true }), e("worth", 2, { example: true }), e("worth", 1, { example: true })])).toBeNull());
});
