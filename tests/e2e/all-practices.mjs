import { chromium, devices } from "playwright-core";
import { spawn } from "node:child_process";
const srv = spawn("npx", ["vite", "preview", "--port", "4183", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const fails = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ ...devices["iPhone 13"] });
await ctx.addInitScript(() => { localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, created_at: 1 }])); });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.route("**/api/**", (r) => r.fulfill({ status: 503, body: "{}" }));
await page.goto("http://localhost:4183/"); await page.waitForSelector("#nav button", { state: "attached" });
const ids = ["loopaudit", "pullcheck", "breaths", "relaxjudge", "reel", "echo", "own", "real", "three", "have", "allright", "qualifier", "sign"];
for (const id of ids) {
  await page.evaluate(() => document.querySelector('[data-go="practice"]').click()); await page.waitForTimeout(150);
  await page.evaluate((id) => { const x = document.createElement("button"); x.dataset.act = "exstart"; x.dataset.id = id; document.body.appendChild(x); x.click(); }, id); await page.waitForTimeout(150);
  let steps = 0;
  for (; steps < 20; steps++) {
    const st = await page.evaluate(() => ({ ta: !!document.querySelector("#pr-in"), opt: document.querySelectorAll('[data-act="prpick"]').length, fin: /Finish/.test(document.querySelector('[data-act="prnext"]')?.textContent || ""), done: !document.querySelector('[data-act="prnext"]') }));
    if (st.done) break;
    if (st.ta) await page.fill("#pr-in", "x");
    else if (st.opt) await page.evaluate(() => document.querySelector('[data-act="prpick"]').click());
    await page.waitForTimeout(80);
    await page.evaluate(() => document.querySelector('[data-act="prnext"]')?.click()); await page.waitForTimeout(120);
  }
  ok(steps > 1 && steps < 20, id + " runs to the end in " + steps + " steps");
}
ok(errs.length === 0, "no page errors" + (errs[0] ? ": " + errs[0] : ""));
await b.close(); srv.kill(); process.exit(fails.length ? 1 : 0);
