// The single-file build must use the host's own window.claude (subscription AI) when present.
import { chromium, devices } from "playwright-core";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox", "--allow-file-access-from-files"] });
const page = await (await b.newContext({ ...devices["iPhone 13"] })).newPage();
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
await page.addInitScript(() => { window.__calls = 0; window.claude = { use: async (n) => n === "sample" ? async () => { window.__calls++; return { text: "host reply" }; } : undefined }; });
await page.route("**/fonts.g*/**", (r) => r.abort());
await page.goto("file://" + process.cwd() + "/dist-artifact/index.html");
await page.waitForSelector("#fbpill");
const r = await page.evaluate(async () => (await (await window.claude.use("sample"))("x")).text);
console.log(r === "host reply" && !errs.length ? "PASS artifact build keeps host runtime, no errors" : "FAIL " + errs[0]);
await b.close(); process.exit(r === "host reply" && !errs.length ? 0 : 1);
