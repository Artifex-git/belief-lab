// POST with x-invite-code -> {ok:true} when the code is valid. Used by the access gate on first launch.
import { json, sameOrigin, validCode, underCap } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false });
  if (!sameOrigin(req)) return json(res, 403, { ok: false });
  // Slow down guessing: a small cap per instance per day on failed tries.
  if (!validCode(req)) return json(res, underCap("bad", 200) ? 401 : 429, { ok: false });
  return json(res, 200, { ok: true });
}
