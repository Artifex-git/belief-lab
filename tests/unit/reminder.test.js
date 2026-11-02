import { describe, it, expect } from "vitest";
import { parseTime, buildIcs } from "../../src/reminder.js";
describe("daily reminder", () => {
  it("parses times", () => { expect(parseTime("08:30")).toEqual({ h: 8, m: 30 }); expect(parseTime("7:05")).toEqual({ h: 7, m: 5 }); expect(parseTime("24:00")).toBeNull(); expect(parseTime("")).toBeNull(); expect(parseTime("8.30")).toBeNull(); });
  it("repeats daily with an alert at the chosen local time", () => {
    const ics = buildIcs({ time: "08:30", url: "https://x.app/", now: new Date(2026, 10, 2, 10, 0) });
    expect(ics).toContain("RRULE:FREQ=DAILY"); expect(ics).toContain("DTSTART:20261103T083000"); expect(ics).toContain("TRIGGER:PT0S"); expect(ics).toContain("URL:https://x.app/");
    expect(ics.split("\r\n").length).toBeGreaterThan(10); expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
  });
  it("starts today when the time has not passed yet", () => expect(buildIcs({ time: "21:00", now: new Date(2026, 10, 2, 10, 0) })).toContain("DTSTART:20261102T210000"));
  it("never shames: no streak or missed wording", () => expect(buildIcs({ time: "08:00" }).toLowerCase()).not.toMatch(/streak|missed|broke/));
  it("rejects a bad time", () => expect(() => buildIcs({ time: "nope" })).toThrow());
});
