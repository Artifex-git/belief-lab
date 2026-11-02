// The coach panel, Talk choices and the "keeps coming back" card, with the AI stubbed so no network or key is needed.
import { chromium, devices } from "playwright-core";
import { createServer } from "node:http"; import { readFileSync, existsSync, statSync } from "node:fs"; import { extname, join } from "node:path";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const srv = createServer((q, r) => { let f = join("dist", decodeURIComponent(q.url.split("?")[0])); if (!existsSync(f) || statSync(f).isDirectory()) f = "dist/index.html"; r.setHeader("content-type", types[extname(f)] || "application/octet-stream"); r.end(readFileSync(f)); }).listen(4291);
const fails = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ ...devices["iPad (gen 7)"], viewport: { width: 1024, height: 900 } });
await ctx.addInitScript(() => { localStorage.setItem("bl-invite", "x");
  const d = new Date(), ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  localStorage.setItem("bl-items", JSON.stringify([{ _id: "profile", kind: "profile", onboarded: true, name: "L", created_at: 1 }, { _id: "m", kind: "mood", mood: 7, date: ds, created_at: Date.now() - 1000 },
    { _id: "e1", kind: "entry", created_at: Date.now() - 2e5, belief_raw: "I have to earn my rest.", core: "earn", root: "worth" }, { _id: "e2", kind: "entry", created_at: Date.now() - 1e5, belief_raw: "If I stop I fall behind.", core: "earn", root: "worth" }])); });
const page = await ctx.newPage(); const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.goto("http://localhost:4291/#today"); await page.waitForSelector("#nav button", { state: "attached" }); await page.waitForTimeout(600);
let seen = [];
await page.evaluate(() => { window.__calls = []; window.claude.use = async (n) => {
  if (n === "coach") return async (p) => { window.__calls.push(p); return { reading: "Two feelings may rest on one belief.", options: [
    { text: "Where others end up says where I stand.", claim: "I'm someone who measures myself against others.", why: "Both reactions compare you.", id: "J1", reframe: "Where they are is their path.", core: "judged", coreBelief: "I'm judged by how I compare." },
    { text: "Choosing fun meant giving up the top.", claim: "", why: "", id: "", core: "", coreBelief: "" }], question: "Would you swap places?" }; };
  if (n === "sample") return async (p) => { window.__calls.push({ prompt: p }); return { text: JSON.stringify({ reply: "Here are three possibilities.", stage: 3, capture: {}, done: false, options: [{ text: "If I stop, things fall apart.", id: "V5-control-7", core: "control" }, { text: "I have to carry it all.", id: "", core: "" }] }) }; };
  return undefined; }; });
// --- Lab step 2
await page.evaluate(() => window.BL.ACT.start({ dataset: { mode: "full" } })); await page.waitForTimeout(400);
await page.fill("#f-situation", "colleague made managing partner and it stings"); await page.evaluate(() => document.querySelector('[data-act="next"]').click()); await page.waitForTimeout(300);
ok(await page.evaluate(() => !!document.querySelector('#v-lab [data-act="assist"]')), "Coach button next to Speak on the Lab step");
await page.fill("#f-belief_raw", "I do not know, jealous maybe"); await page.evaluate(() => document.querySelector('#v-lab [data-act="assist"]').click()); await page.waitForTimeout(500);
ok(await page.evaluate(() => document.querySelectorAll(".aopt").length === 2), "two candidate beliefs shown");
ok(await page.evaluate(() => /From the library/.test(document.querySelector(".aopt").textContent) && /Coach's guess/.test(document.querySelectorAll(".aopt")[1].textContent)), "library and coach's guess are labelled");
ok(await page.evaluate(() => /Model/.test(document.querySelector(".assist .ah").textContent)), "marked as a Model");
await page.evaluate(() => document.querySelectorAll('[data-act="ano"]')[1].click()); await page.waitForTimeout(200);
ok(await page.evaluate(() => document.querySelectorAll(".aopt").length === 1), "Not quite removes the option");
await page.fill("[id^=asteer-]", "more about being judged"); await page.evaluate(() => document.querySelector('[data-act="asteer"]').click()); await page.waitForTimeout(500);
const last = await page.evaluate(() => window.__calls[window.__calls.length - 1]);
ok(last.feedback.steer === "more about being judged" && last.feedback.rejected.length === 1 && last.feedback.rejectedIds.length === 0, "steer and the rejected option go back to the coach");
await page.evaluate(() => document.querySelector('[data-act="aok"]').click()); await page.waitForTimeout(500);
ok(await page.inputValue("#f-belief_raw") === "Where others end up says where I stand.", "That fits writes the belief into the field");
ok(await page.evaluate(() => document.querySelector("#f-belief_raw") && true), "stays on the same step");
await page.evaluate(() => document.querySelector('[data-act="next"]').click()); await page.waitForTimeout(300);
ok(await page.inputValue("#f-self_claim") === "I'm someone who measures myself against others.", "the claim carries to the next step");
ok(await page.evaluate(() => (JSON.parse(localStorage.getItem("bl-aifb")) || []).length >= 3), "taps are logged on the device");
ok(await page.evaluate(() => !JSON.stringify(JSON.parse(localStorage.getItem("bl-aifb"))).includes("jealous")), "the log holds no text");
// --- distress never reaches the coach
await page.evaluate(() => { window.__calls.length = 0; });
await page.fill("#f-self_claim", "I want to kill myself"); await page.evaluate(() => document.querySelector('#v-lab [data-act="assist"]').click()); await page.waitForTimeout(400);
ok(await page.evaluate(() => window.__calls.length === 0 && document.getElementById("care-ov")?.classList.contains("on")), "distress shows the care sheet and sends nothing");
await page.evaluate(() => { document.getElementById("care-ov").classList.remove("on"); });
// --- Talk
await page.evaluate(() => { window.BL.ACT.reset(); window.BL.ACT.talk(); }); await page.waitForTimeout(400);
await page.fill("#talk-in", "the last 20 percent keeps piling up, can you help find the belief behind it?"); await page.evaluate(() => document.querySelector('[data-act="talksend"]').click()); await page.waitForTimeout(900);
ok(await page.evaluate(() => document.querySelectorAll(".talkopts .chip").length >= 3), "Talk offers candidate beliefs as chips instead of asking again");
const tp = await page.evaluate(() => window.__calls.find((c) => c.prompt)?.prompt || "");
ok(/LIBRARY/.test(tp) && /CORE BELIEFS/.test(tp) && /do NOT ask the question back/.test(tp), "the Talk prompt carries the library and the rule");
await page.evaluate(() => document.querySelector('[data-act="talkopt"]').click()); await page.waitForTimeout(900);
ok(await page.evaluate(() => /That fits/.test(document.querySelector("#talk-log").textContent)), "tapping a chip sends it as the reply");
// --- Journey
await page.evaluate(() => document.querySelector('[data-go="journey"]').click()); await page.waitForTimeout(500);
ok(await page.evaluate(() => /What keeps coming back/.test(document.querySelector("#v-journey").textContent) && /earn my worth/i.test(document.querySelector("#v-journey").textContent)), "Journey shows the core belief two entries share");
ok(errs.length === 0, "no page errors" + (errs.length ? ": " + errs[0] : ""));
await b.close(); srv.close(); process.exit(fails.length ? 1 : 0);
