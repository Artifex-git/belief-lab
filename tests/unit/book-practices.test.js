import { describe, it, expect } from "vitest";
import { auditResult, pullResult, BOOK_PRACTICES } from "../../src/book-practices.js";
describe("Loop Audit", () => {
  it("points at the missing move and its chapter", () => {
    const r = auditResult({ m_pause: "Missing", m_read: "Half-present", m_notice: "Present" });
    expect(r).toContain("Missing: Pause");
    expect(r).toContain("Chapter 4");
    expect(r).toContain("not a verdict");
  });
  it("handles all present", () => expect(auditResult({ m_notice: "Present" })).toContain("All six moves"));
});
describe("Is this a pull", () => {
  it("leans toward a pull", () => expect(pullResult({ dir: "Toward something", body: "Expansive", kind: "A pull: this feels like me", secret: "Yes", after: "More like myself", can: "Yes" })).toContain("5 of 5"));
  it("names a red light kindly", () => expect(pullResult({ can: "No" })).toContain("not this one, not yet"));
  it("points to support for cravings", () => expect(pullResult({ kind: "A craving: I need this, and the hit fades", can: "Yes" })).toContain("real support"));
  it("explains the old-rule fear", () => expect(pullResult({ fearkey: "Guarding an old rule", can: "Yes" })).toContain("old rule"));
});
describe("voice rules", () => {
  it("has no exclamation marks and unique ids", () => {
    const all = JSON.stringify(BOOK_PRACTICES);
    expect(all).not.toContain("!");
    expect(new Set(BOOK_PRACTICES.map((p) => p.id)).size).toBe(BOOK_PRACTICES.length);
  });
});
