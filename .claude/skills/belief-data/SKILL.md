---
name: belief-data
description: Add, edit, move, retire or import limiting beliefs in data/beliefs_seed.json following the belief-tree rules (one core per belief, MECE placement, permanent ids, believable preferred belief, area, type, sources, safety tags). Use when the owner shares new beliefs, research notes or a new database version.
---

# Belief data

**Source of truth:** `data/beliefs_seed.json`. The human-readable views are `docs/research/LIMITING_BELIEFS_DATABASE.md` (v0.6: 5 roots → 37 cores → 529 surface beliefs) and the research notes in `docs/research/`.

## The rules

1. **Structure.** Root → core → surface belief. Every surface belief sits under **exactly one** core.
2. **Ids are permanent.** Never renumber, reuse or delete an id. Users' tree marks (`beliefmap.marks`) and history point at them. New ids follow `V<version>-<core>-<n>`. To remove a belief, set `"retired": true`. Moving a belief changes its `core`, never its id.
3. **Placement test for effort beliefs.** If hard work makes the result *count* → `earn`. If hard work *produces* the result → `grind`. If enjoyment is only *allowed* after hardship → `deserve` / `joy`.
4. **A new core** is allowed only if it protects against something no existing core does **and** needs a different exercise. Otherwise the belief goes under the closest existing core. If `helpless` or the `self` area keeps absorbing items, flag it, because the database notes predict a split.
5. **The preferred belief** must be believable today (the book's step 8: about 4/10 or more). It dissolves the either/or instead of mirroring it, and says "can" or "often", never a promise. ✗ "I am always enough." ✓ "I'm enough to begin, and I can grow from here."
6. **Fields.** Match the existing entries exactly.
   - **Required:** `id`, `cluster`, `core`, `root` (worth, belonging, safety, control, enjoy), `area` (work, money, love, family, social, body, create, self, rest, emotions, meaning), `move` (push, brace, chase, soothe), `type` (rule, prediction, attitude), `script` (the belief: first person, the blunt version), `reframe` (the preferred belief), `status`.
   - **`status`** is `draft` for anything you add until the owner approves it, then `model`.
   - **Optional:** `recognition` (how it shows up in daily life), `source` (provenance; mark extrapolations as such), and `safety` (grief / low-mood / blame / medical / money) where SAFETY.md §3 applies.
   - Core-level fields live in `cores[]`: `belief`, `preferred`, `protects`, `costs`, `rules`.
7. **Secular only.** Translate Bashar material into plain language. Never include metaphysical claims, victim-blame framing, or "quit and trust" money advice.
8. **No duplicates.** Compare normalised text (lower-case, no punctuation, stemmed) against every existing belief and each core's own rules. Near-duplicates get merged, and the stronger wording wins.

## Steps

1. Parse the input (a list, notes, a new database file).
2. Propose a placement table and **wait for the owner's approval**:

   | Belief | Core | Area | Type | Preferred belief | Source | Safety | Note |

   Put close calls in the Note column, for example "could also be `fused`; chose `enough` because…".
3. Edit the JSON. Bump `version`.
4. Run `npm run validate:data`, which checks: schema, unique ids, existing cores/roots/areas, no exact or near duplicates, every safety-tagged id still routed, and counts. If the script doesn't exist yet, create it.
5. Regenerate or update the counts in `docs/research/LIMITING_BELIEFS_DATABASE.md`. Add a changelog line, e.g. "12 new beliefs about rest and family."
6. Run `/voice-safety-review` on the new texts.
