# The AI coach: how it works and how to tune it

## What the person sees
A **Coach** button sits next to **Speak** on the Lab steps, Compass, the morning and evening lines and the practices. It shows 2 to 3 candidates (beliefs, claims, questions or steps). The person taps **That fits** (the words go into the field), **Not quite** (the option is dropped and remembered), or types a steer ("more about being judged") and taps **Try again**. **One layer deeper** runs the downward arrow towards the core beliefs. Talk offers the same choices as chips. Journey shows the core that several worked beliefs share.

## How it is grounded
`src/coach/engine.js` (pure, tested in `tests/unit/coach.test.js`):
1. `retrieve()` ranks all 529 beliefs in `data/beliefs_seed.json` against what the person wrote (BM25 on the belief, reframe, recognition, area and cluster, plus a small English and Dutch concept map that points everyday words like "jealous" at a cluster). It also ranks the 37 core beliefs.
2. `buildPrompt()` puts the book vocabulary, style rules, safety boundaries, the 10 closest library entries, the closest cores and all core ids into the prompt. The person's words only ever appear inside `<data>` tags.
3. `normalize()` checks the reply. A library id or core id the model made up is dropped, so only real database entries are labelled "From the library". Everything else is labelled "Coach's guess". Both carry the **Model** label.
4. `gentleFlags()` adds gentle-handling instructions for grief, low mood, blame, medical and money (docs/SAFETY.md section 3).
5. With no AI available, `localFallback()` still offers the closest library beliefs.

The server (`api/coach.js`) owns the prompt: it accepts a fixed list of tasks (`TASK_IDS`), checks the invite code and the distress phrases, then calls the provider in JSON mode. With the person's own key on the device, or inside claude.ai, the same engine runs in the app (`src/coach/client.js`).

## Tuning
- **Wording and rules:** `src/coach/prompts.js` (shared) and `TASKS` in `engine.js` (one instruction per window).
- **Retrieval:** `CONCEPTS` in `engine.js`. When a real example retrieves badly, add the everyday words to the right cluster and add a test.
- **Model:** `AI_PROVIDER`, `AI_MODEL`, `GEMINI_MODEL` in Vercel. `DAILY_CAP` (default 300) is calls per invite code per day.
- **Evaluate before changing:** add the example to `tests/unit/coach.test.js` (does the right cluster or core come up?) and run `npm test`.

## Feedback for tuning, and what is not collected
Each tap is logged **on the device only**, in `localStorage["bl-aifb"]`: time, task, library id, core id and `yes`, `no`, `steer` or `deeper`. It holds **no text**, and nothing is sent anywhere. That is enough to see which library entries and cores people accept or reject. To train or fine-tune a model on real text, the app would need an explicit opt-in screen first (CLAUDE.md: ask the owner before anything new leaves the device).

## Safety
The prompts reuse the existing boundaries (no diagnosis, no promises, no metaphysical claims, `<data>` wrapping, the reach principle for steps). The distress check runs in the app and again on the server before any call. The Coach button is hidden on dip days and in the Anchor. `tests/safety/distress.test.js` checks that no prompt, including a full grounded one, trips the distress filter.
