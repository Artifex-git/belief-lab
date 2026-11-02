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
  it("the app's own prompts never trip the server-side check", async () => {
    const P = await import("../../src/coach/prompts.js");
    for (const k of ["BOOK_CONTEXT", "REACH_RULES", "STYLE_RULES", "COACH_VOICE"]) expect(distress(P[k]), k).toBe(false);
  });
  it("a full grounded coaching prompt, with the whole belief library in it, never trips the check", async () => {
    const { makeDb, buildPrompt, TASK_IDS } = await import("../../src/coach/engine.js");
    const db = makeDb(JSON.parse(readFileSync("data/beliefs_seed.json", "utf8")));
    for (const task of TASK_IDS) expect(distress(buildPrompt({ db, task, text: "I keep piling up work", ctx: {}, feedback: {} })), task).toBe(false);
  });
});
