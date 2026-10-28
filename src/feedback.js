// The Feedback pill + sheet. Sends only what the person types, plus technical context.
import { appInfo, getCrumbs, recentErrors, screen, isStandalone, crumb } from "./telemetry.js";
import { getInviteCode } from "./access.js";

const TYPES = [["bug", "Something broke"], ["confusing", "Confusing"], ["idea", "Idea"], ["love", "I love this"]];
const QKEY = "bl-fb-queue", TKEY = "bl-tester", MINE = "bl-fb-mine";
const ls = { get: (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const tester = () => { let t = ls.get(TKEY); if (!t) { t = "t_" + Math.random().toString(36).slice(2, 8); ls.set(TKEY, t); } return t; };
let state = { type: "", shot: "", prefill: "" };

export async function shrinkImage(file, max = 1280, q = 0.8) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", q);
  } finally { URL.revokeObjectURL(url); }
}

function ov() {
  let o = document.getElementById("fb-ov");
  if (!o) { o = document.createElement("div"); o.id = "fb-ov"; o.className = "care-ov sheet-ov"; document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) closeSheet(); }); }
  return o;
}
export const closeSheet = () => { const o = document.getElementById("fb-ov"); if (o) { o.classList.remove("on"); o.innerHTML = ""; } };

export function openFeedback(opts = {}) {
  state = { type: opts.type || "", shot: "", prefill: opts.text || "" };
  const o = ov();
  o.innerHTML = `<div class="care fbsheet" role="dialog" aria-modal="true" aria-label="Send feedback">
    <h3>Tell us in 15 seconds</h3>
    <div class="seg fbtypes" role="group" aria-label="Type">${TYPES.map(([v, l]) => `<button type="button" data-fbt="${v}" aria-pressed="${state.type === v}">${l}</button>`).join("")}</div>
    <label class="f" for="fb-text">What happened, and what did you expect?</label>
    <textarea id="fb-text" rows="4" maxlength="4000" placeholder="One line is enough.">${(state.prefill || "").replace(/</g, "&lt;")}</textarea>
    <p class="hint" style="margin-top:6px">Tip: use your keyboard's mic key to talk instead of type.</p>
    <div class="row" style="margin-top:10px"><label class="btn small ghost" for="fb-file" style="cursor:pointer">Add screenshot</label><input type="file" id="fb-file" accept="image/*" hidden><span class="hint" id="fb-shot"></span></div>
    <details class="pmore" style="margin-top:10px"><summary>What gets sent</summary><p class="hint">Your message, the screenshot if you add one, the screen you are on, the app version, your device type and recent error messages. Never your journal, beliefs or mood.</p></details>
    <p class="hint" id="fb-err" role="status" style="margin-top:8px"></p>
    <div class="row" style="margin-top:12px"><button class="btn" id="fb-send">Send</button><button class="btn ghost" id="fb-cancel">Cancel</button></div></div>`;
  o.classList.add("on");
  o.querySelector(".fbtypes").addEventListener("click", (e) => {
    const b = e.target.closest("[data-fbt]"); if (!b) return; state.type = b.dataset.fbt;
    o.querySelectorAll("[data-fbt]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
  o.querySelector("#fb-file").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { state.shot = await shrinkImage(f); o.querySelector("#fb-shot").textContent = "Screenshot added"; } catch { o.querySelector("#fb-shot").textContent = "Couldn't read that image."; }
  });
  o.querySelector("#fb-cancel").onclick = closeSheet;
  o.querySelector("#fb-send").onclick = submit;
}

async function submit() {
  const o = ov(), text = o.querySelector("#fb-text").value.trim(), err = o.querySelector("#fb-err");
  if (!state.type) { err.textContent = "Pick one of the four first."; return; }
  if (!text && !state.shot) { err.textContent = "Write a line first."; return; }
  const BL = window.BL;
  let sensitive = false;
  if (BL && BL.distress(text)) { sensitive = true; closeSheet(); BL.showCare(); }
  const payload = {
    type: state.type, text, screen: screen(), screenshot: state.shot || undefined, sensitive,
    app: appInfo(), tester: tester(),
    device: { standalone: isStandalone(), viewport: innerWidth + "x" + innerHeight, dark: matchMedia("(prefers-color-scheme: dark)").matches, lang: navigator.language, ua: navigator.userAgent },
    breadcrumbs: getCrumbs(), errors: recentErrors(),
  };
  if (!sensitive) { o.querySelector("#fb-send").disabled = true; err.textContent = "Sending…"; }
  const ok = await send(payload);
  if (!sensitive) { closeSheet(); toast(ok ? "Thanks — it's on the list." : "Saved. It will send when you're back online."); }
}

async function send(payload) {
  try {
    const r = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json", "x-invite-code": getInviteCode() }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json(); if (j.issue) { const m = ls.get(MINE) || []; m.push(j.issue); ls.set(MINE, m); }
    return true;
  } catch { const q = ls.get(QKEY) || []; q.push(payload); ls.set(QKEY, q.slice(-10)); return false; }
}

export async function flushQueue() {
  const q = ls.get(QKEY) || []; if (!q.length || !navigator.onLine) return;
  ls.set(QKEY, []);
  for (const p of q) await send(p);
}

export const myIssues = () => ls.get(MINE) || [];

export function toast(msg) {
  const el = document.getElementById("toast") || Object.assign(document.body.appendChild(document.createElement("div")), { id: "toast" });
  el.setAttribute("role", "status"); el.textContent = msg; el.classList.add("on");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 3500);
}

export function mountPill() {
  if (document.getElementById("fbpill")) return;
  const b = document.createElement("button");
  b.id = "fbpill"; b.className = "fbpill"; b.type = "button"; b.setAttribute("aria-label", "Send feedback"); b.textContent = "Feedback";
  b.addEventListener("click", () => { crumb("act:feedback"); openFeedback(); });
  document.body.appendChild(b);
}
