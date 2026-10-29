import { describe, it, expect } from "vitest";
import { searchLog, excerpt } from "../../src/search.js";
const items = [
  { _id: "1", kind: "entry", created_at: 1, belief_raw: "I am never enough" },
  { _id: "2", kind: "compass", created_at: 3, pull: "Rest", act: "Take a quiet walk" },
  { _id: "3", kind: "session", created_at: 2, msgs: [{ r: "you", t: "Why is it never quiet here" }, { r: "coach", t: "enough said" }] },
  { _id: "4", kind: "entry", example: true, created_at: 9, belief_raw: "enough example" },
  { _id: "5", kind: "profile", name: "enough" },
];
describe("searchLog", () => {
  it("finds across kinds, newest first, skipping examples and coach text", () => {
    expect(searchLog(items, "enough").map(h => h.id)).toEqual(["1"]);
    expect(searchLog(items, "quiet").map(h => h.id)).toEqual(["2", "3"]);
  });
  it("needs all terms, ignores case and accents", () => {
    expect(searchLog(items, "NEVER quiet").map(h => h.id)).toEqual(["3"]);
    expect(searchLog([{ _id: "a", kind: "entry", belief_raw: "Café nights" }], "cafe")).toHaveLength(1);
  });
  it("returns nothing for empty queries", () => expect(searchLog(items, "  ")).toEqual([]));
  it("excerpts around the match", () => expect(excerpt("x".repeat(100) + " quiet " + "y".repeat(100), ["quiet"])).toContain("quiet"));
});
