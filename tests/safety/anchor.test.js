import { describe, it, expect } from "vitest";
import { isDipMood, inDip, routeView, STEPS, CAUTION } from "../../src/anchor.js";

describe("dips go to the Anchor, never the Lab (SAFETY §2)", () => {
  it("mood 3 or lower is a dip, 4 is not", () => { expect(isDipMood(0)).toBe(true); expect(isDipMood(3)).toBe(true); expect(isDipMood(4)).toBe(false); expect(isDipMood(null)).toBe(false); });
  it("saying so today counts, yesterday does not", () => { expect(inDip(7, "2026-10-28", "2026-10-28")).toBe(true); expect(inDip(7, "2026-10-27", "2026-10-28")).toBe(false); });
  it("the Lab is redirected to the Anchor on a dip day", () => { expect(routeView("lab", true)).toBe("anchor"); expect(routeView("lab", false)).toBe("lab"); expect(routeView("talk", true)).toBe("talk"); });
  it("the five steps follow the book's order", () => { expect(STEPS.map((s) => s.h.split(" ")[0])).toEqual(["Name", "Stop", "Reach", "Take", "Be"]); });
  it("the caution points to real support", () => expect(CAUTION).toMatch(/doctor|crisis line/));
});
