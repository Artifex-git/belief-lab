// Breadcrumbs + automatic error reports. Never includes anything the person wrote.
import info from "./build-info.json";
import { getInviteCode } from "./access.js";

const crumbs = [];
const errors = [];
let sent = 0;
const sentFp = new Set();
const NOISE = /ResizeObserver loop|^Script error\.?$|extension:\/\//i;

export const getCrumbs = () => crumbs.map((c) => ({ t: c.t - Date.now(), a: c.a }));
export const crumb = (a) => { crumbs.push({ t: Date.now(), a: String(a).slice(0, 40) }); if (crumbs.length > 30) crumbs.shift(); };
export const screen = () => (location.hash || "#today").slice(1) || "today";

export function scrub(s) {
  return String(s ?? "")
    .replace(/"[^"]{20,}"/g, '"…"').replace(/'[^']{20,}'/g, "'…'")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "<email>").replace(/\d{6,}/g, "<n>")
    .slice(0, 300);
}

export function fingerprint(msg, stack) {
  const norm = scrub(msg).replace(/\d+/g, "N");
  const top = (String(stack || "").split("\n").find((l) => /\.js|\.ts/.test(l)) || "").replace(/-[\w]{6,}\.js/, ".js").replace(/[?#].*$/, "").replace(/:\d+\)?$/, "");
  let h = 5381; const str = norm + "|" + top;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

export const recentErrors = () => errors.map((e) => ({ msg: e.msg, where: e.where, t: e.t - Date.now() }));
export const appInfo = () => ({ version: info.version, build: info.build, channel: info.channel });

export function report({ msg, stack = "" }) {
  const m = scrub(msg);
  if (!m || NOISE.test(m)) return;
  const where = (String(stack).split("\n").find((l) => /\.js|\.ts/.test(l)) || "").trim().slice(0, 120);
  errors.push({ msg: m, where, t: Date.now() }); if (errors.length > 10) errors.shift();
  const fp = fingerprint(m, stack);
  if (sent >= 5 || info.channel === "local" || sentFp.has(fp)) return;
  sentFp.add(fp); sent++;
  const body = JSON.stringify({ fp, msg: m, stack: scrub(stack).slice(0, 600), screen: screen(), app: appInfo(), device: { standalone: isStandalone(), ua: navigator.userAgent } });
  try { fetch("/api/error", { method: "POST", headers: { "content-type": "application/json", "x-invite-code": getInviteCode() }, body, keepalive: true }).catch(() => {}); } catch {}
}

export const isStandalone = () => !!(navigator.standalone || matchMedia("(display-mode: standalone)").matches);

export function startTelemetry() {
  window.addEventListener("error", (e) => report({ msg: e.message, stack: e.error && e.error.stack }));
  window.addEventListener("unhandledrejection", (e) => { const r = e.reason; report({ msg: (r && r.message) || String(r), stack: r && r.stack }); });
  document.addEventListener("click", (e) => {
    const el = e.target.closest && e.target.closest("[data-act],[data-go]");
    if (el) crumb(el.dataset.act ? "act:" + el.dataset.act : "go:" + el.dataset.go);
  }, true);
  window.addEventListener("hashchange", () => crumb("go:" + screen()));
}
