import { describe, it, expect } from "vitest";
import { scrub, fingerprint } from "../../src/telemetry.js";

describe("error scrubbing keeps user content out", () => {
  it("replaces long quoted strings, emails and long numbers", () => {
    const out = scrub(`Unexpected token in JSON: "I am afraid my mother will never forgive me" mail a.b@c.nl 123456789`);
    expect(out).not.toMatch(/mother|forgive|a\.b@c\.nl|123456789/);
  });
  it("caps length", () => expect(scrub("x".repeat(1000)).length).toBe(300));
  it("same error → same fingerprint, different error → different", () => {
    const a = fingerprint("Cannot read properties of undefined (reading 'x')", "at f (/assets/index-abc123.js:10:5)");
    const b = fingerprint("Cannot read properties of undefined (reading 'x')", "at f (/assets/index-zzz999.js:10:7)");
    expect(a).toBe(b);
    expect(fingerprint("Other error", "at f (/assets/index-abc123.js:10:5)")).not.toBe(a);
  });
});
