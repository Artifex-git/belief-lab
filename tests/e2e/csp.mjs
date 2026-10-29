// Serves dist with the exact headers from vercel.json, then checks the app still works and nothing is blocked.
import { chromium, devices } from "playwright-core";
import { createServer } from "node:http"; import { readFileSync, existsSync, statSync } from "node:fs"; import { extname, join } from "node:path";
const hdr = Object.fromEntries(JSON.parse(readFileSync("vercel.json", "utf8")).headers[0].headers.map((h) => [h.key, h.value]));
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".wasm": "application/wasm", ".webmanifest": "application/manifest+json" };
const srv = createServer((q, r) => { let f = join("dist", decodeURIComponent(q.url.split("?")[0])); if (!existsSync(f) || statSync(f).isDirectory()) f = "dist/index.html"; for (const k in hdr) r.setHeader(k, hdr[k]); r.setHeader("content-type", types[extname(f)] || "application/octet-stream"); r.end(readFileSync(f)); }).listen(4188);
const fails = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--use-file-for-fake-audio-capture=" + (process.env.WAV || "/tmp/claude-1000/aud/jfk.wav")] });
const ctx = await b.newContext({ ...devices["iPhone 13"], permissions: ["microphone"] });
await ctx.addInitScript(() => { localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, created_at: 1 }])); });
const page = await ctx.newPage();
const bad = []; page.on("console", (m) => { if (process.env.DBG) console.log("console:", m.type(), m.text().slice(0, 200)); if (/Content Security Policy|Refused to/i.test(m.text())) bad.push(m.text().slice(0, 140)); });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.goto("http://localhost:4188/"); await page.waitForSelector("#nav button", { state: "attached" });
for (const v of ["today", "talk", "practice", "journey", "you"]) { await page.evaluate((v) => document.querySelector(`[data-go="${v}"]`)?.click(), v); await page.waitForTimeout(250); }
await page.evaluate(() => document.querySelector('[data-go="talk"]').click()); await page.waitForTimeout(300);
await page.evaluate(() => document.querySelector(".mic").click()); await page.waitForTimeout(8000);
ok(await page.evaluate(() => !!document.querySelector(".vrec canvas")), "recorder works under the policy");
await page.evaluate(() => document.querySelector('[data-act="micdone"]').click());
await page.waitForFunction(() => { const t = document.querySelector("textarea"); return t && t.value.length > 3; }, null, { timeout: 200000 }).catch(() => {});
console.log("STATE:", await page.evaluate(() => [...document.querySelectorAll(".microw")].map((e) => e.textContent.trim()).join(" | ")));
ok((await page.evaluate(() => document.querySelector("textarea").value)).length > 3, "speech turned into text under the policy");
ok(bad.length === 0, "no policy violations" + (bad[0] ? ": " + bad[0] : ""));
ok(errs.length === 0, "no page errors" + (errs[0] ? ": " + errs[0] : ""));
await b.close(); srv.close(); process.exit(fails.length ? 1 : 0);
