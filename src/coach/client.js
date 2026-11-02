// Runs the coaching engine inside the app. Used when there is no server to do it: your own key on the device, or the claude.ai viewer.
import { makeDb, buildPrompt, normalize, localFallback } from "./engine.js";
let DB;
export const getDb = async () => (DB ||= makeDb((await import("../../data/beliefs_seed.json")).default));

export async function coachLocal(payload, sample) {
  const db = await getDb();
  const r = await sample(buildPrompt({ db, ...payload }), { cache: false, json: true });
  const data = normalize(r.text, db);
  if (!data) throw new Error("ai shape");
  return data;
}
/** No AI available: the closest library beliefs. */
export async function coachOffline(payload) { return localFallback(await getDb(), payload.text, payload.ctx); }
