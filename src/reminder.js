// Daily reminder as a calendar event. A web page cannot ring the phone by itself while closed
// (that needs a push server), so we hand the person's own Calendar app a repeating event with an alert.
// Nothing leaves the device and nothing is shamed: it is one quiet nudge, and skipping a day is fine.
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** "HH:MM" -> {h, m} or null. */
export function parseTime(v) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || "").trim());
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  return h < 24 && mi < 60 ? { h, m: mi } : null;
}

/** Floating local time, so the event follows the device's time zone. */
export function buildIcs({ time, url, now = new Date(), title = "The Belief Lab", note = "A quiet minute for yourself. Open the app whenever you feel like it. Skipping a day is fine." }) {
  const t = parseTime(time);
  if (!t) throw new Error("time");
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.h, t.m);
  if (start <= now) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 10 * 60000);
  const f = (d) => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Belief Lab//Daily reminder//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", "UID:belief-lab-daily-reminder@belief-lab", "DTSTAMP:" + stamp,
    "DTSTART:" + f(start), "DTEND:" + f(end), "RRULE:FREQ=DAILY",
    "SUMMARY:" + esc(title), "DESCRIPTION:" + esc(note), ...(url ? ["URL:" + url] : []),
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc(title), "TRIGGER:PT0S", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
