import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
const src = readFileSync("src/legacy-app.js", "utf8");
const block = src.slice(src.indexOf('{id:"morning"'), src.indexOf('{id:"needs"'));

describe("Morning Practice carries the book's breathwork safety note (SAFETY §4)", () => {
  it("shows the note as the very first step, before any breathing", () => {
    expect(block.indexOf("First, a safety note")).toBeGreaterThan(-1);
    expect(block.indexOf("First, a safety note")).toBeLessThan(block.indexOf('t:"timer"'));
  });
  it.each(["pregnant", "heart problems", "high blood pressure", "epilepsy", "panic attacks", "in or near water", "while driving", "dizzy"])("mentions %s", (w) => expect(block).toContain(w));
  it("never guides fast breathing or breath-holds", () => { expect(block).not.toMatch(/hold your breath for|retention|rapid exhale|breath of fire/i); });
  it("keeps the chakra map labelled as a map, not anatomy", () => expect(block).toMatch(/not anatomy/));
});
