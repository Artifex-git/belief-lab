// Recurring roots: which of the five roots keeps showing up in the person's recent entries.
// A root is a way of grouping beliefs (a Model, not a diagnosis), so the wording stays tentative.
export function recurringRoot(entries, { window = 5, min = 3 } = {}) {
  const recent = entries.filter((e) => e && !e.example && e.root).sort((a, b) => b.created_at - a.created_at).slice(0, window);
  if (recent.length < min) return null;
  const n = {};
  for (const e of recent) n[e.root] = (n[e.root] || 0) + 1;
  const [root, count] = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return count >= min ? { root, count, of: recent.length } : null;
}
