// POST automatic error report -> one deduplicated GitHub issue per fingerprint (label auto-error).
import { json, sameOrigin, underCap, readBody, gh } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false });
  if (!sameOrigin(req)) return json(res, 403, { ok: false });
  if (!process.env.GITHUB_FEEDBACK_TOKEN || !process.env.GITHUB_REPO) return json(res, 503, { ok: false });
  let b; try { b = await readBody(req, 20_000); } catch { return json(res, 413, { ok: false }); }
  const fp = String(b.fp || "").replace(/[^0-9a-f]/g, "").slice(0, 8);
  if (fp.length !== 8) return json(res, 400, { ok: false });
  if (!underCap("err:" + fp, 20)) return json(res, 200, { ok: true, dropped: true });
  const msg = String(b.msg || "").slice(0, 300), build = String(b.app?.build || "?").slice(0, 12);
  const channel = ["production", "preview"].includes(b.app?.channel) ? b.app.channel : "unknown";
  const tag = `[err:${fp}]`;
  try {
    const open = await gh(`/issues?labels=auto-error&state=all&per_page=100&sort=created&direction=desc`);
    const hit = open.find((i) => i.title.startsWith(tag));
    const line = `Seen again · build ${build} · ${channel} · screen ${String(b.screen || "?").slice(0, 20)} · ${new Date().toISOString().slice(0, 10)}`;
    if (hit) {
      if (hit.state === "closed") await gh(`/issues/${hit.number}`, { method: "PATCH", body: JSON.stringify({ state: "open" }) }), await gh(`/issues/${hit.number}/comments`, { method: "POST", body: JSON.stringify({ body: `Regressed in ${build}. ${line}` }) });
      else {
        const cs = await gh(`/issues/${hit.number}/comments?per_page=1&sort=created&direction=desc`).catch(() => []);
        const last = cs.length ? Date.parse(cs[cs.length - 1].created_at) : Date.parse(hit.created_at);
        if (Date.now() - last > 864e5) await gh(`/issues/${hit.number}/comments`, { method: "POST", body: JSON.stringify({ body: line }) });
      }
      return json(res, 200, { ok: true, issue: hit.number });
    }
    const issue = await gh("/issues", { method: "POST", body: JSON.stringify({ title: `${tag} ${msg.slice(0, 80)}`, labels: ["auto-error", "channel:" + channel], body: `${line}\n\n\`\`\`\n${String(b.stack || "").slice(0, 600)}\n\`\`\`\n\n\`\`\`json\n${JSON.stringify({ app: b.app, device: b.device })}\n\`\`\`` }) });
    return json(res, 200, { ok: true, issue: issue.number });
  } catch { return json(res, 502, { ok: false }); }
}
