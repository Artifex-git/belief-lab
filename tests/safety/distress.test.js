import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { DISTRESS, distress } from "../../src/distress.js";

describe("distress detection", () => {
  it("matches the legacy regex exactly (no drift)", () => {
    const legacy = readFileSync("src/legacy-app.js", "utf8").match(/const DISTRESS=(\/.*\/i);/)[1];
    expect(String(DISTRESS)).toBe(legacy);
  });
  it.each([
    "I want to die", "thinking about suicide", "I keep hurting myself", "better off without me",
    "ik denk aan zelfmoord", "ik wil niet meer leven", "ik wil mezelf iets aandoen",
  ])("flags %s", (t) => expect(distress(t)).toBe(true));
  it.each(["I'm tired of this job", "ik ben moe", "I want to die laughing at this meme?".replace("die laughing", "learn")])("ignores %s", (t) => expect(distress(t)).toBe(false));
  it("the app's own prompts never trip the server-side check", () => {
    const src = readFileSync("src/legacy-app.js", "utf8");
    const ctx = src.match(/const BOOK_CONTEXT=`([\s\S]*?)`;/)[1];
    expect(distress(ctx)).toBe(false);
  });
});
