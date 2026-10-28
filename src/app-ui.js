// Install helper, import, What's new, About line, update prompt.
import info from "./build-info.json";
import changelog from "../CHANGELOG.md?raw";
import { openFeedback, toast, closeSheet, myIssues } from "./feedback.js";
import { isStandalone } from "./telemetry.js";

const BL = () => window.BL;
const SEEN = "bl-seen-version";

/* ---------- import (legacy export format {app, exported_at, items}) ---------- */
export function parseImport(text) {
  let j; try { j = JSON.parse(text); } catch { return { error: "That file isn't a Belief Lab backup." }; }
  if (!j || j.app !== "The Belief Lab" || !Array.isArray(j.items)) return { error: "That file isn't a Belief Lab backup." };
  return { items: j.items.filter((x) => x && x._id && x.kind) };
}
export function mergeItems(current, incoming) {
  const have = new Set(current.map((x) => x._id));
  const fresh = incoming.filter((x) => !have.has(x._id));
  return { merged: [...current, ...fresh], added: fresh.length, skipped: incoming.length - fresh.length };
}
function pickFile() {
  return new Promise((res) => {
    const i = Object.assign(document.createElement("input"), { type: "file", accept: "application/json,.json" });
    i.onchange = () => res(i.files[0] || null); i.click();
  });
}
async function doImport() {
  const f = await pickFile(); if (!f) return;
  const r = parseImport(await f.text());
  if (r.error) { toast(r.error); return; }
  const cur = BL().store.items.filter((x) => !x.example);
  const m = mergeItems(cur, r.items);
  const o = sheet(`<h3>Import this backup?</h3><p style="margin-top:8px">${m.added} new item${m.added === 1 ? "" : "s"} will be added. ${m.skipped} already here will be left as they are. Nothing is overwritten.</p>
    <div class="row" style="margin-top:12px"><button class="btn" id="imp-ok" ${m.added ? "" : "disabled"}>Import</button><button class="btn ghost" id="imp-no">Cancel</button></div>`);
  o.querySelector("#imp-no").onclick = closeSheet;
  o.querySelector("#imp-ok").onclick = async () => {
    const add = r.items.filter((x) => !cur.some((c) => c._id === x._id));
    for (const it of add) await BL().put(it);
    closeSheet(); toast(`Imported ${m.added}.`);
  };
}

function sheet(html) {
  let o = document.getElementById("fb-ov");
  if (!o) { o = document.createElement("div"); o.id = "fb-ov"; o.className = "care-ov sheet-ov"; document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) closeSheet(); }); }
  o.innerHTML = `<div class="care" role="dialog" aria-modal="true">${html}</div>`; o.classList.add("on"); return o;
}

/* ---------- What's new ---------- */
export function changelogEntries(md, max = 5) {
  const out = []; let ver = "";
  for (const l of md.split("\n")) {
    const h = l.match(/^## (.+)/); if (h) { ver = h[1].trim(); continue; }
    const b = l.match(/^- (.+)/); if (b && ver && ver !== "Unreleased") out.push({ ver, text: b[1] });
  }
  return out.slice(0, max);
}
export function showWhatsNew() {
  const mine = new Set(myIssues().map(String));
  const items = changelogEntries(changelog).map((e) => {
    const n = (e.text.match(/\(#(\d+)\)/) || [])[1];
    return `<li>${e.text.replace(/\s*\(#\d+\)/, "").replace(/</g, "&lt;")}${n && mine.has(n) ? ' <span class="pill">You asked for this</span>' : ""}</li>`;
  }).join("");
  const o = sheet(`<h3>What's new</h3><ul class="wn">${items || "<li>Nothing yet.</li>"}</ul><div class="row" style="margin-top:12px"><button class="btn" id="wn-ok">Got it</button></div>`);
  o.querySelector("#wn-ok").onclick = closeSheet;
}
function maybeWhatsNew() {
  let seen = null; try { seen = localStorage.getItem(SEEN); } catch {}
  try { localStorage.setItem(SEEN, info.version); } catch {}
  if (seen && seen !== info.version) setTimeout(showWhatsNew, 1200);
}

/* ---------- Install helper (iOS Safari, not yet installed) ---------- */
function installCard() {
  const ios = /iphone|ipad/i.test(navigator.userAgent);
  let dismissed = false; try { dismissed = localStorage.getItem("bl-install-dismissed") === "1"; } catch {}
  if (!ios || isStandalone() || dismissed) return;
  const c = document.createElement("div"); c.className = "installcard"; c.setAttribute("role", "region"); c.setAttribute("aria-label", "Install");
  c.innerHTML = `<b>Put it on your home screen</b><ol><li>Tap the Share button <span aria-hidden="true">⎙</span> at the bottom of Safari.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Open it from the icon.</li></ol><button class="linkbtn" id="inst-x">Not now</button>`;
  document.body.insertBefore(c, document.body.firstChild);
  c.querySelector("#inst-x").onclick = () => { try { localStorage.setItem("bl-install-dismissed", "1"); } catch {} c.remove(); };
}

/* ---------- About line under You ---------- */
function aboutLine() {
  const el = document.getElementById("about-line");
  const t = `Version ${info.version} · build ${info.build} · ${info.channel} · ${info.date}`;
  if (el && el.textContent !== t) el.textContent = t;

}

/* ---------- Update prompt ---------- */
export function updatePrompt(apply) {
  if (document.getElementById("upd")) return;
  const b = document.createElement("button"); b.id = "upd"; b.className = "updbar"; b.type = "button";
  b.textContent = "New version — tap to refresh";
  b.onclick = () => { const busy = document.activeElement && /TEXTAREA|INPUT/.test(document.activeElement.tagName) && document.activeElement.value; if (busy && !confirm("You have text in progress. Refresh anyway?")) return; apply(); };
  document.body.appendChild(b);
}

export function startAppUi() {
  const A = BL().ACT;
  A.import = doImport; A.feedback = () => openFeedback(); A.whatsnew = showWhatsNew;
  new MutationObserver(aboutLine).observe(document.querySelector("main"), { childList: true, subtree: true });
  maybeWhatsNew(); installCard();
}
