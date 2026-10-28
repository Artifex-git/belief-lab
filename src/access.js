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
      <h3>Connect your coach</h3>
      <p class="hint" style="margin-top:6px">Paste your own Claude API key (starts with sk-ant-). It stays on this device and goes only to Anthropic. Or enter the invite code you were sent.</p>
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
