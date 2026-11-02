// The coach panel, Talk choices and the "keeps coming back" card, with the AI stubbed so no network or key is needed.
import { chromium, devices } from "playwright-core";
import { createServer } from "node:http"; import { readFileSync, existsSync, statSync } from "node:fs"; import { extname, join } from "node:path";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const srv = createServer((q, r) => { let f = join("dist", decodeURIComponent(q.url.split("?")[0])); if (!existsSync(f) || statSync(f).isDirectory()) f = "dist/index.html"; r.setHeader("content-type", types[extname(f)] || "application/octet-stream"); r.end(readFileSync(f)); }).listen(4291);
const fails = []; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails.push(m); };
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
const ctx = await b.newContext({ ...devices["iPad (gen 7)"], viewport: { width: 1024, height: 900 }, acceptDownloads: true });
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
// --- Today is simple: the coach is the front door, the rest sits under "More for today"
await page.evaluate(() => window.BL.ACT.reset());
ok(await page.evaluate(() => !!document.querySelector("#v-today .talkcta [data-act=talk]") && document.querySelector("details.more-today") && !document.querySelector("details.more-today").open), "Today offers 'Talk it through' and keeps the extras under More for today");
ok(await page.evaluate(() => [...document.querySelectorAll("#v-today .card")].filter((c) => !c.closest("details:not([open])")).length <= 4), "Today shows at most a few cards at once");
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
let last = await page.evaluate(() => window.__calls[window.__calls.length - 1]);
ok(last.feedback.reply === "more about being judged" && last.feedback.rejected.length === 1, "a reply goes back to the coach with what was rejected");
await page.fill("[id^=asteer-]", "and my wife does it too, so it is not only me"); await page.evaluate(() => document.querySelector('[data-act="asteer"]').click()); await page.waitForTimeout(500);
last = await page.evaluate(() => window.__calls[window.__calls.length - 1]);
ok(last.feedback.thread.length === 1 && last.feedback.thread[0].y === "more about being judged" && /Two feelings/.test(last.feedback.thread[0].c), "the second reply carries the conversation so far");
ok(await page.evaluate(() => /Earlier in this conversation \(2\)/.test(document.querySelector(".assist").textContent)), "earlier turns stay visible");
await page.evaluate(() => document.querySelector('[data-act="adown"]').click()); await page.waitForTimeout(500);
last = await page.evaluate(() => window.__calls[window.__calls.length - 1]);
ok(last.task === "deeper" && last.text === "Where others end up says where I stand." && /colleague made managing partner/.test(last.ctx.situation) && last.ctx.original.includes("jealous"), "Go deeper builds on that suggestion and keeps the original words");
await page.evaluate(() => document.querySelector('[data-act="aok"]').click()); await page.waitForTimeout(500);
ok(await page.inputValue("#f-belief_raw") === "Where others end up says where I stand.", "That fits writes the belief into the field");
ok(await page.evaluate(() => document.querySelector("#f-belief_raw") && true), "stays on the same step");
await page.evaluate(() => document.querySelector('[data-act="next"]').click()); await page.waitForTimeout(300);
ok(await page.inputValue("#f-self_claim") === "I'm someone who measures myself against others.", "the claim carries to the next step");
ok(await page.evaluate(() => (JSON.parse(localStorage.getItem("bl-aifb")) || []).length >= 3), "taps are logged on the device");
ok(await page.evaluate(() => !JSON.stringify(JSON.parse(localStorage.getItem("bl-aifb"))).includes("jealous")), "the log holds no text");
ok(await page.evaluate(() => { const p = JSON.parse(localStorage.getItem("bl-items")).find((x) => x._id === "coreprofile"); return !!p && p.cores.judged && p.cores.judged.n === 1 && p.cores.judged.beliefs[0].t.startsWith("Where others end up"); }), "accepting a belief with a core saves it to the core profile on the device");
await page.fill("#f-self_claim", "I measure myself against others"); await page.evaluate(() => { window.__calls.length = 0; document.querySelector('#v-lab [data-act="assist"]').click(); }); await page.waitForTimeout(500);
ok(await page.evaluate(() => window.__calls[0] && window.__calls[0].profile.length === 1 && /opinions decide my value/i.test(window.__calls[0].profile[0]) && /Where others end up/.test(window.__calls[0].profile[0])), "the next coaching call carries the profile");
await page.evaluate(() => document.querySelector('[data-act="aclose"]').click());
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
ok(await page.evaluate(() => /Your core beliefs/.test(document.querySelector("#v-journey").textContent) && /earn my worth/i.test(document.querySelector("#v-journey").textContent) && /opinions decide my value/i.test(document.querySelector("#v-journey").textContent)), "Journey shows the core beliefs from the entries and the coach");
// --- report and export
await page.evaluate(() => window.BL.ACT.report()); await page.waitForTimeout(300);
ok(await page.evaluate(() => /sent to the AI/.test(document.querySelector("#report-ov").textContent) && /Without AI/.test(document.querySelector("#report-ov").textContent)), "the report asks before anything is sent, and offers a version without AI");
await page.evaluate(() => { window.__calls.length = 0; window.claude.use = async (n) => n === "coach" ? async (x) => { window.__calls.push(x); return { headline: "A headline", summary: "A summary of the pattern.", patterns: [{ core: "earn", insight: "An insight.", loosen: "A way to loosen it." }], strengths: "S", next: "N" }; } : undefined; });
await page.evaluate(() => window.BL.ACT.reportgo({ dataset: { ai: "1" } })); await page.waitForTimeout(600);
ok(await page.evaluate(() => window.__calls[0].task === "report" && window.__calls[0].cores.includes("earn") && /Beliefs worked: 2/.test(window.__calls[0].text)), "the report sends a short summary, not the whole log");
ok(await page.evaluate(() => /A headline/.test(document.querySelector(".report").textContent) && /I have to earn my worth/.test(document.querySelector(".report").textContent) && /A way to loosen it/.test(document.querySelector(".report").textContent)), "the report shows the AI reading beside the core beliefs");
const [dl] = await Promise.all([page.waitForEvent("download"), page.evaluate(() => window.BL.ACT.profileexport())]);
const exp = JSON.parse((await import("node:fs")).readFileSync(await dl.path(), "utf8"));
ok(exp.kind === "core-belief-profile" && exp.core_beliefs.some((c) => c.id === "earn") && exp.beliefs_worked.length === 2, "the core belief profile exports as a file");
await page.evaluate(() => window.BL.ACT.reportgo({ dataset: { ai: "0" } })); await page.waitForTimeout(300);
ok(await page.evaluate(() => /Your belief/.test(document.querySelector(".report h1").textContent) && !/A headline/.test(document.querySelector(".report").textContent)), "Without AI still gives a complete report from the database");
ok(errs.length === 0, "no page errors" + (errs.length ? ": " + errs[0] : ""));
await b.close(); srv.close(); process.exit(fails.length ? 1 : 0);
