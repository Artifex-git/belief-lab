import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MOVE_OF, moveTag } from "../../src/moves.js";
const SIX = ["Notice", "Pause", "Read", "Follow", "Release", "Allow"];
describe("six moves", () => {
  it("only uses the book's six moves", () => Object.values(MOVE_OF).forEach((m) => expect(SIX).toContain(m.move)));
  it("every mapped id is a real practice", () => { const src = readFileSync("src/legacy-app.js", "utf8"), book = readFileSync("src/book-practices.js", "utf8"); Object.keys(MOVE_OF).forEach((id) => expect(src.includes(`{id:"${id}",cat:`) || book.includes(`id: "${id}", cat:`)).toBe(true)); });
  it("formats the tag", () => { expect(moveTag("believe")).toBe("Notice · Ch 1"); expect(moveTag("nope")).toBe(""); });
});
