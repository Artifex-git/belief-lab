import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { complete, providerName, configured } from "../../api/_llm.js";
const KEYS = ["AI_PROVIDER", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GEMINI_MODEL"];
let saved;
beforeEach(() => { saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]])); KEYS.forEach((k) => delete process.env[k]); });
afterEach(() => { KEYS.forEach((k) => (saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]))); vi.unstubAllGlobals(); });
const reply = (body, ok = true) => vi.fn(async () => ({ ok, json: async () => body }));
describe("AI provider", () => {
  it("picks the provider from the keys that are set", () => {
    expect(configured()).toBe(false);
    process.env.GEMINI_API_KEY = "g"; expect(providerName()).toBe("gemini"); expect(configured()).toBe(true);
    process.env.ANTHROPIC_API_KEY = "a"; expect(providerName()).toBe("anthropic");
    process.env.AI_PROVIDER = "gemini"; expect(providerName()).toBe("gemini");
  });
  it("calls Gemini with the key in a header and reads the reply", async () => {
    process.env.GEMINI_API_KEY = "g-key"; const f = reply({ candidates: [{ content: { parts: [{ text: "hello " }, { text: "there" }] } }] }); vi.stubGlobal("fetch", f);
    expect(await complete({ system: "S", prompt: "P" })).toBe("hello there");
    const [url, init] = f.mock.calls[0]; expect(url).toContain("generativelanguage.googleapis.com"); expect(url).not.toContain("g-key"); expect(init.headers["x-goog-api-key"]).toBe("g-key");
    expect(JSON.parse(init.body).systemInstruction.parts[0].text).toBe("S");
  });
  it("calls Anthropic and reads the reply", async () => {
    process.env.ANTHROPIC_API_KEY = "a-key"; vi.stubGlobal("fetch", reply({ content: [{ type: "text", text: "hi" }] }));
    expect(await complete({ system: "S", prompt: "P" })).toBe("hi");
  });
  it("treats an empty or failed reply as upstream failure", async () => {
    process.env.GEMINI_API_KEY = "g"; vi.stubGlobal("fetch", reply({ candidates: [{ finishReason: "SAFETY" }] }));
    await expect(complete({ system: "S", prompt: "P" })).rejects.toThrow("upstream");
    vi.stubGlobal("fetch", reply({}, false)); await expect(complete({ system: "S", prompt: "P" })).rejects.toThrow("upstream");
  });
});
