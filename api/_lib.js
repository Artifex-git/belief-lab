// Shared helpers for the serverless functions.
import { distress } from "../src/distress.js";
export { distress };

export const json = (res, status, body) => { res.status(status).setHeader("content-type", "application/json"); res.end(JSON.stringify(body)); };

export function sameOrigin(req) {
  const o = req.headers.origin; if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}

export function validCode(req) {
  const codes = (process.env.INVITE_CODES || "").split(",").map((s) => s.trim()).filter(Boolean);
  const c = String(req.headers["x-invite-code"] || "").trim();
  return c && codes.includes(c) ? c : "";
}

// Best-effort per-instance counter. The monthly spend limit in the Anthropic Console is the hard stop.
const hits = new Map();
export function underCap(key, cap) {
  const day = new Date().toISOString().slice(0, 10), k = key + day;
  const n = (hits.get(k) || 0) + 1; hits.set(k, n);
  if (hits.size > 5000) hits.clear();
  return n <= cap;
}

export async function readBody(req, max = 1_500_000) {
  if (req.body && typeof req.body === "object") return req.body;
  let s = ""; for await (const ch of req) { s += ch; if (s.length > max) throw new Error("too big"); }
  return JSON.parse(s || "{}");
}

export async function gh(path, init = {}) {
  const r = await fetch("https://api.github.com/repos/" + process.env.GITHUB_REPO + path, {
    ...init,
    headers: { authorization: "Bearer " + process.env.GITHUB_FEEDBACK_TOKEN, accept: "application/vnd.github+json", "user-agent": "belief-lab", "content-type": "application/json", ...(init.headers || {}) },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("github " + r.status + " " + (j.message || ""));
  return j;
}
