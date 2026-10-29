import { chromium, devices } from "playwright-core";
import { spawn } from "node:child_process";
const srv = spawn("npx", ["vite", "preview", "--port", "4182", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const fails = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ ...devices["iPhone 13"] });
await ctx.addInitScript(() => {
  localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, created_at: 1 }]));
  window.__starts = 0; window.__mode = "phrase";
  window.SpeechRecognition = window.webkitSpeechRecognition = class {
    start() { window.__starts++; const me = this; setTimeout(() => {
      if (window.__mode === "deny") { me.onerror && me.onerror({ error: "service-not-allowed" }); me.onend && me.onend(); return; }
      const res = [{ 0: { transcript: "hello " + window.__starts }, isFinal: true, length: 1 }]; res.item = (i) => res[i];
      me.onresult && me.onresult({ resultIndex: 0, results: res }); me.onend && me.onend(); }, 80); }
    stop() { this._stopped = true; }
  };
});
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.goto("http://localhost:4182/"); await page.waitForSelector("#nav button", { state: "attached" });
await page.evaluate(() => document.querySelector('[data-go="talk"]').click()); await page.waitForTimeout(500);
const id = await page.evaluate(() => document.querySelector(".mic")?.dataset.for);
ok(!!id, "mic button present");
await page.evaluate(() => document.querySelector(".mic").click()); await page.waitForTimeout(700);
ok(await page.evaluate(() => window.__starts) >= 3, "keeps listening across sessions");
const v = await page.evaluate((id) => document.getElementById(id).value, id);
ok(/hello 1/.test(v) && /hello 2/.test(v), "phrases accumulate: " + v.trim());
await page.evaluate(() => document.querySelector(".mic").click()); await page.waitForTimeout(300);
const n = await page.evaluate(() => window.__starts); await page.waitForTimeout(400);
ok(n === await page.evaluate(() => window.__starts), "stops when tapped");
await page.evaluate(() => { window.__mode = "deny"; }); await page.evaluate(() => document.querySelector(".mic").click()); await page.waitForTimeout(400);
ok((await page.textContent("main")).includes("Enable Dictation"), "explains how to enable dictation");
ok(await page.evaluate(() => window.__starts) === n + 1, "no restart loop after an error");
ok(errs.length === 0, "no page errors" + (errs[0] ? ": " + errs[0] : ""));
await b.close(); srv.kill(); process.exit(fails.length ? 1 : 0);
