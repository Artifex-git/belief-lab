// Smoke test in a real browser at iPhone size. Run: npm run e2e  (needs `npm run build` first)
import { chromium, devices } from "playwright-core";
import { spawn } from "node:child_process";

const exe = process.env.CHROMIUM || "/usr/bin/chromium";
const srv = spawn("npx", ["vite", "preview", "--port", "4173", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const fails = [];
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
try {
  const b = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
  const ctx = await b.newContext({ ...devices["iPhone 13"], colorScheme: "light" });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(e.message)); page.on("crash", () => console.log("PAGE CRASH")); page.on("close", () => console.log("PAGE CLOSED"));
  const sent = [];
  await page.route("**/api/feedback", (r) => { sent.push(JSON.parse(r.request().postData())); r.fulfill({ json: { ok: true, issue: 7 } }); });
  await page.route("**/api/ai", (r) => r.fulfill({ json: { ok: true, text: "A mocked coach reply." } }));
  await page.route("**/fonts.g*/**", (r) => r.abort());
  await page.goto("http://localhost:4173/");
  await page.waitForSelector("#nav button", { state: "attached", timeout: 8000 });
  await page.waitForTimeout(500);
  ok(true, "app boots, nav rendered");
  await page.screenshot({ path: "shots/01-first-screen.png" });
  const manifest = await (await page.request.get("http://localhost:4173/manifest.webmanifest")).json();
  ok(manifest.display === "standalone" && manifest.short_name.length <= 12, "manifest standalone, short name ≤ 12");
  ok(await page.locator("#fbpill").isVisible(), "feedback pill visible on the very first screen");
  // walk through onboarding
  for (let i = 0; i < 4 && await page.locator('[data-act="wnext"]').count(); i++) await page.click('[data-act="wnext"]');
  if (await page.locator('[data-act="wdone"]').count()) await page.click('[data-act="wdone"]');
  await page.waitForSelector("#v-today.on, #v-today:not([hidden])", { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/01b-today.png" });
  ok(await page.locator("#fbpill").isVisible() && await page.locator("#pulsefab").isVisible(), "pill and Pulse button both visible on Today");
  const pb = await page.locator("#fbpill").boundingBox(), nb = await page.locator("#nav").boundingBox();
  ok(pb.y + pb.height <= nb.y + 1, "pill sits above the bottom nav");
  const box = await page.locator("#fbpill").boundingBox();
  ok(box.height >= 44, "pill tap target ≥ 44pt");
  await page.click("#fbpill");
  await page.waitForSelector("#fb-text");
  const fs = await page.$eval("#fb-text", (e) => parseFloat(getComputedStyle(e).fontSize));
  ok(fs >= 16, "feedback textarea ≥ 16px (no iOS zoom)");
  await page.screenshot({ path: "shots/02-feedback-sheet.png" });
  await page.click("#fb-send");
  ok((await page.textContent("#fb-err")).includes("Pick one"), "validation: must pick a type");
  await page.click('[data-fbt="confusing"]');
  await page.fill("#fb-text", "I did not know what Pulse means. I expected a short explanation.");
  await page.click("#fb-send");
  await page.waitForFunction(() => document.getElementById("toast")?.classList.contains("on"));
  ok(sent.length === 1 && sent[0].type === "confusing" && sent[0].screen, "feedback payload sent with type and screen");
  ok(!!sent[0].app.version && !!sent[0].tester, "payload has app version and tester id");
  // distress in feedback → care sheet, flagged sensitive
  await page.click("#fbpill"); await page.click('[data-fbt="bug"]');
  await page.fill("#fb-text", "ik wil niet meer leven");
  await page.click("#fb-send");
  await page.waitForSelector("#care-ov.on", { timeout: 3000 });
  ok(sent.length === 2 && sent[1].sensitive === true, "distress text → care sheet + flagged sensitive");
  ok((await page.textContent("#care-ov")).includes("113"), "care sheet shows the 113 number");
  await page.screenshot({ path: "shots/03-care-sheet.png" });
  // You tab
  await page.evaluate(() => document.getElementById("care-ov").classList.remove("on"));
  await page.evaluate(() => document.getElementById("me").click()); await page.waitForTimeout(600);
  await page.waitForSelector("#about-line", { timeout: 5000 });
  ok((await page.textContent("#about-line")).includes("Version 0.1.0"), "About line shows version");
  ok(await page.locator('[data-act="import"]').count() === 1, "Import data button present");
  await page.screenshot({ path: "shots/04-you.png", fullPage: true });
  // dark mode
  const d = await (await b.newContext({ ...devices["iPhone 13"], colorScheme: "dark" })).newPage();
  await d.route("**/fonts.g*/**", (r) => r.abort());
  await d.goto("http://localhost:4173/"); await d.waitForSelector("#fbpill");
  await d.screenshot({ path: "shots/05-dark.png" });
  ok(errors.length === 0, "no uncaught page errors" + (errors.length ? ": " + errors[0] : ""));
  await b.close();
} catch (e) { console.log("FAIL exception:", e.message); fails.push(e.message); }
srv.kill();
process.exit(fails.length ? 1 : 0);
