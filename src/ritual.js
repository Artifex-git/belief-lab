// Weekly ritual: once a week, run the Lab on the belief that cost the most. Missed weeks are neutral:
// there is no streak, no count and no message about a week that passed.
export function weekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  return y + "-W" + String(Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7)).padStart(2, "0");
}
// Offer the ritual unless this week's was already used or set aside, or today is a dip day.
export const ritualOffered = (handledWeek, now, dip) => !dip && handledWeek !== weekKey(now);
