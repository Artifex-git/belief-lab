import { chromium, devices } from "playwright-core";
import { spawn } from "node:child_process";
const srv = spawn("npx", ["vite", "preview", "--port", "4179", "--strictPort"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ ...devices["iPhone 13"] });
await ctx.addInitScript(() => { localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, created_at: 1 }])); });
const page = await ctx.newPage();
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.goto("http://localhost:4179/"); await page.waitForSelector("#nav button", { state: "attached" });
await page.addStyleTag({ content: "html{font-size:150%!important}" });
let fails = 0;
for (const v of ["today", "lab", "journey", "practice", "you"]) {
  await page.evaluate((v) => document.querySelector(`[data-go="${v}"]`)?.click(), v); await page.waitForTimeout(300);
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  const ok = w[0] <= 391; if (!ok) fails++;
  console.log((ok ? "PASS " : "FAIL ") + v + " no sideways scroll at 150% text " + w.join("/"));
  if (!ok) console.log(await page.evaluate(() => [...document.querySelectorAll("main *, header *")].filter(e => e.getBoundingClientRect().right > 392).slice(0, 5).map(e => e.tagName + "." + e.className + " " + Math.round(e.getBoundingClientRect().right)).join(" | ")));
}
await b.close(); srv.kill(); process.exit(fails ? 1 : 0);
