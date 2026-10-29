import { chromium, devices } from "playwright-core";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const axeSrc = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const srv = spawn("npx", ["vite", "preview", "--port", "4178", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const bad = new Map();
for (const scheme of ["light", "dark"]) {
  const ctx = await b.newContext({ ...devices["iPhone 13"], colorScheme: scheme });
  await ctx.addInitScript(() => { if (!localStorage.getItem("bl-items")) localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, created_at: 1 }, { _id: "e1", kind: "entry", created_at: Date.now(), belief_raw: "I never get enough rest", root: "worth", believability_start: 7 }, { _id: "c1", kind: "compass", created_at: Date.now(), pull: "Rest", act: "Walk", status: "planned", due: "2099-01-01" }])); });
  const page = await ctx.newPage();
  await page.route("**/fonts.g*/**", (r) => r.abort());
  await page.goto("http://localhost:4178/"); await page.waitForSelector("#nav button", { state: "attached" });
  for (const v of ["today", "lab", "journey", "tree", "practice", "you"]) {
    const ok = await page.evaluate((v) => { const e = document.querySelector(`[data-go="${v}"]`); if (e) e.click(); return !!e; }, v);
    if (!ok) continue;
    await page.waitForTimeout(400);
    await page.evaluate(axeSrc);
    const res = await page.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "best-practice"] }));
    for (const x of res.violations) {
      const k = `${x.id} (${x.impact}): ${x.help}`;
      const e = bad.get(k) || { views: new Set(), nodes: new Set() };
      e.views.add(`${scheme}/${v}`); x.nodes.slice(0, 3).forEach((n) => e.nodes.add(n.target.join(" ") + " :: " + (n.any[0]?.message || n.all[0]?.message || "").slice(0, 80)));
      bad.set(k, e);
    }
  }
}
for (const [k, e] of bad) console.log("FAIL " + k + "\n   views: " + [...e.views].join(", ") + "\n   " + [...e.nodes].slice(0, 4).join("\n   "));
console.log(bad.size ? `${bad.size} issue types` : "PASS no axe violations");
await b.close(); srv.kill(); process.exit(bad.size ? 1 : 0);
