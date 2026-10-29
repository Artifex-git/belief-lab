import { describe, it, expect } from "vitest";
import { weekKey, ritualOffered } from "../../src/ritual.js";
describe("weekly ritual", () => {
  it("week keys follow ISO weeks (Monday start)", () => { expect(weekKey(new Date(2026, 9, 26))).toBe(weekKey(new Date(2026, 10, 1))); expect(weekKey(new Date(2026, 10, 2))).not.toBe(weekKey(new Date(2026, 10, 1))); expect(weekKey(new Date(2026, 0, 1))).toBe("2026-W01"); });
  it("offered once a week", () => { const now = new Date(2026, 9, 29); expect(ritualOffered(null, now, false)).toBe(true); expect(ritualOffered(weekKey(now), now, false)).toBe(false); expect(ritualOffered("2026-W01", now, false)).toBe(true); });
  it("never on a dip day", () => expect(ritualOffered(null, new Date(), true)).toBe(false));
});
