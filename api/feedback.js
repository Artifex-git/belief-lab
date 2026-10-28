// POST feedback -> GitHub issue (+ optional screenshot committed to branch feedback-assets).
import { json, sameOrigin, validCode, underCap, readBody, gh, distress } from "./_lib.js";

const TYPES = ["bug", "confusing", "idea", "love"];

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false });
  if (!sameOrigin(req)) return json(res, 403, { ok: false });
  if (!process.env.GITHUB_FEEDBACK_TOKEN || !process.env.GITHUB_REPO) return json(res, 503, { ok: false, reason: "not-configured" });
  let b; try { b = await readBody(req); } catch { return json(res, 413, { ok: false }); }
  if (!TYPES.includes(b.type)) return json(res, 400, { ok: false });
  const tester = String(b.tester || "anon").replace(/[^\w-]/g, "").slice(0, 16) || "anon";
  if (!underCap("fb:" + tester, 20)) return json(res, 429, { ok: false });
  const text = String(b.text || "").slice(0, 4000);
  const screen = String(b.screen || "").replace(/[^\w-]/g, "").slice(0, 20) || "unknown";
  const channel = ["production", "preview", "local"].includes(b.app?.channel) ? b.app.channel : "unknown";
  const sensitive = !!b.sensitive || distress(text);
  try {
    let shot = "";
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(b.screenshot || "");
    if (m && m[1].length < 1_400_000) {
      const d = new Date(), path = `feedback/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${Date.now()}-${tester}.jpg`;
      await ensureBranch();
      await gh("/contents/" + path, { method: "PUT", body: JSON.stringify({ message: "feedback screenshot", content: m[1], branch: "feedback-assets" }) });
      shot = `\n\n[Screenshot](https://github.com/${process.env.GITHUB_REPO}/blob/feedback-assets/${path}) (private repo: sign in to view)`;
    }
    const quote = text.split("\n").map((l) => "> " + l).join("\n");
    const meta = JSON.stringify({ app: b.app, device: b.device, breadcrumbs: b.breadcrumbs, errors: b.errors, tester }, null, 2).slice(0, 8000);
    const title = sensitive ? "[sensitive] feedback — please read personally" : `[${b.type}] ${screen}: ${text.replace(/\s+/g, " ").slice(0, 60)}`;
    const labels = ["feedback", "type:" + b.type, "screen:" + screen, "channel:" + channel, ...(sensitive ? ["sensitive"] : [])];
    const issue = await gh("/issues", { method: "POST", body: JSON.stringify({ title, labels, body: `${quote}${shot}\n\n<details><summary>Context</summary>\n\n\`\`\`json\n${meta}\n\`\`\`\n</details>` }) });
    return json(res, 200, { ok: true, issue: issue.number });
  } catch (e) { return json(res, 502, { ok: false, reason: "github" }); }
}

async function ensureBranch() {
  try { await gh("/git/ref/heads/feedback-assets"); return; } catch {}
  const repo = await gh("");
  const base = await gh("/git/ref/heads/" + repo.default_branch);
  await gh("/git/refs", { method: "POST", body: JSON.stringify({ ref: "refs/heads/feedback-assets", sha: base.object.sha }) });
}
