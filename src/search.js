/* Search across everything the user has written. Pure: records in, hits out. */
const KIND_LABEL = { entry: "Belief", compass: "Step", mood: "Morning", session: "Talk", practice: "Practice", investigation: "Test", pulse: "Check-in" };

const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function textOf(r) {
  switch (r.kind) {
    case "entry": return [r.belief_raw, r.preferred_belief, r.situation, r.self_claim, r.outcome, r.action];
    case "compass": return [r.pull, r.act, r.learn, r.fear, r.then, r.outcome, r.feedback];
    case "mood": return [r.belief];
    case "session": return (r.msgs || []).filter(m => m.r === "you").map(m => m.t);
    case "practice": return [r.title, ...Object.values(r.answers || {}).filter(v => typeof v === "string")];
    case "investigation": return [r.belief, r.pref, r.core, ...Object.values(r.answers || {}).filter(v => typeof v === "string")];
    default: return [];
  }
}

export function searchLog(items, query, limit = 40) {
  const terms = norm(query).split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) return [];
  const hits = [];
  for (const r of items) {
    if (r.example || !KIND_LABEL[r.kind]) continue;
    const parts = textOf(r).filter(t => typeof t === "string" && t.trim());
    const hay = norm(parts.join(" \n "));
    if (!terms.every(t => hay.includes(t))) continue;
    const first = parts.find(p => norm(p).includes(terms[0])) || parts[0] || "";
    hits.push({ id: r._id, kind: r.kind, label: KIND_LABEL[r.kind], at: r.created_at || 0, text: first, terms });
  }
  return hits.sort((a, b) => b.at - a.at).slice(0, limit);
}

/* Short excerpt centred on the first match. */
export function excerpt(text, terms, len = 140) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  const i = norm(t).indexOf(terms[0]);
  if (t.length <= len || i < 0) return t.slice(0, len) + (t.length > len ? "…" : "");
  const s = Math.max(0, i - 40);
  return (s ? "…" : "") + t.slice(s, s + len) + (s + len < t.length ? "…" : "");
}
