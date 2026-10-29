// Invite code for the AI coach. Stored on the device, sent as a header.
const KEY = "bl-invite", KEYK = "bl-apikey";
export const getApiKey = () => { try { return localStorage.getItem(KEYK) || ""; } catch { return ""; } };
export const clearApiKey = () => { try { localStorage.removeItem(KEYK); } catch {} };
export const getInviteCode = () => { try { return localStorage.getItem(KEY) || ""; } catch { return ""; } };
export const clearInviteCode = () => { try { localStorage.removeItem(KEY); } catch {} };

export function askInviteCode() {
  return new Promise((resolve, reject) => {
    const o = document.createElement("div");
    o.className = "care-ov on";
    o.innerHTML = `<div class="care" role="dialog" aria-modal="true" aria-label="Invite code">
      <h3>Connect the coach</h3>
      <p class="hint" style="margin-top:6px">The coach needs an Anthropic API key. Paste yours (starts with sk-ant-). It stays on this device and goes only to Anthropic.</p>
      <input type="text" id="inv-in" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="sk-ant-… or invite code" style="margin-top:12px">
      <p class="hint" id="inv-err" style="margin-top:8px" role="status"></p>
      <div class="row" style="margin-top:12px"><button class="btn" id="inv-ok">Save</button><button class="btn ghost" id="inv-no">Not now</button></div></div>`;
    document.body.appendChild(o);
    const done = (fn, v) => { o.remove(); fn(v); };
    o.querySelector("#inv-no").onclick = () => done(reject, new Error("invite"));
    o.querySelector("#inv-ok").onclick = () => {
      const v = o.querySelector("#inv-in").value.trim();
      if (!v) { o.querySelector("#inv-err").textContent = "Type the code first."; return; }
      try { localStorage.setItem(/^sk-ant-/.test(v) ? KEYK : KEY, v); } catch {}
      done(resolve, v);
    };
    setTimeout(() => o.querySelector("#inv-in").focus(), 50);
  });
}

// First-launch gate for the hosted app: nothing opens until a valid invite code is entered.
export async function checkCode(code) {
  try { return (await fetch("/api/check", { method: "POST", headers: { "x-invite-code": code } })).ok; } catch { return false; }
}
export function runGate() {
  if (getInviteCode()) return Promise.resolve();
  return new Promise((resolve) => {
    const o = document.createElement("div");
    o.className = "care-ov on"; o.style.background = "var(--bg)";
    o.innerHTML = `<div class="care" role="dialog" aria-modal="true" aria-label="Invite code">
      <h3>The Belief Lab</h3>
      <p class="hint" style="margin-top:6px">This is a private test version. Enter the invite code you were sent.</p>
      <input type="text" id="gate-in" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Invite code" style="margin-top:12px">
      <p class="hint" id="gate-err" style="margin-top:8px" role="status"></p>
      <div class="row" style="margin-top:12px"><button class="btn" id="gate-ok">Open</button></div></div>`;
    document.body.appendChild(o);
    const go = async () => {
      const v = o.querySelector("#gate-in").value.trim(), err = o.querySelector("#gate-err");
      if (!v) { err.textContent = "Type the code first."; return; }
      err.textContent = "Checking…";
      if (await checkCode(v)) { try { localStorage.setItem(KEY, v); } catch {} o.remove(); resolve(); }
      else err.textContent = "That code didn't work. Check it and try again.";
    };
    o.querySelector("#gate-ok").onclick = go;
    o.querySelector("#gate-in").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    setTimeout(() => o.querySelector("#gate-in").focus(), 50);
  });
}
