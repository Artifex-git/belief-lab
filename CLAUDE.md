# The Belief Lab — instructions for Claude Code

## What this is

The Belief Lab is the private companion app to *Follow the Pull — Six Moves to Catch the Beliefs That Run Your Life* by Lourens Bordewijk (manuscript v13 in `docs/book/`). The book itself describes the app (Appendix H), and that paragraph is the product brief:

> It walks you through the ten prompts one at a time, keeps a private, searchable log of the beliefs you've examined, quietly surfaces the roots that keep recurring, and turns the weekly habit into something closer to a game than a chore — a light, playful way to get to know yourself and the beliefs running underneath your days.

If a feature does not serve that sentence, question it before building it.

**Where it stands.** The current app is one HTML file (`legacy/The_Belief_Lab.html`, about 2,800 lines of vanilla JS) that ran as a Claude artifact on claude.ai. It relies on artifact-only runtime calls that do not exist anywhere else: `window.claude.use("sample")` for AI, `use("db")` plus `use("user")` for per-user storage, and `use("downloads")` for export. Outside claude.ai it falls back to `localStorage` key `bl-items`, and AI is unavailable.

**Where it is going.** An installable iPhone test app (a PWA on the home screen) with a safe AI backend, a 15-second feedback loop, and a codebase that improves every week. The phases are in `docs/ROADMAP.md`.

## Who you are working with

- The owner is the author, not a developer. He tests on his iPhone and reviews in plain language.
- Write every PR description and summary for a non-developer: what changed for the person using the app, why, **how to test it on the iPhone** (numbered steps with the preview link), and anything risky. Explain any technical term in one line or leave it out.
- **Ask first** before you: change or migrate stored user data; add a third-party service that receives user data; add anything with running costs; change safety copy or the safety sections of AI prompts; rename a core concept from the book. For everything else, make a reasonable choice and say which choice you made.
- Keep PRs small: one change the owner can test in under five minutes.

## Non-negotiables

1. **Safety.** Follow `docs/SAFETY.md`. Safety behaviour has tests, and a safety test is never weakened to make it pass.
2. **Privacy.** Reflections, beliefs, mood and body data are sensitive, and under GDPR they are likely health data. They stay on the device by default. They are never logged, never sent to analytics, and never included in feedback or error reports. Only three things leave the device: (a) text the person chooses to send for AI coaching, via our `/api/ai` proxy to Anthropic; (b) what they type into the feedback box; (c) error reports that contain no user content.
3. **No real user data in the repo.** That includes the owner's own exports. Tests use synthetic fixtures in `tests/fixtures/`.
4. **Secrets** live only in environment variables (Vercel project settings, GitHub secrets). Never in code, never in the client bundle, never in a committed `.env`.
5. **Voice.** `docs/VOICE.md` applies to every user-facing string and every AI prompt, in English and Dutch.
6. **Evidence labels.** Whenever the app presents an idea as true, it uses the book's four labels: Established, Plausible, Model, Open. Never present a Model as fact. Channelled or metaphysical material (Bashar, "vibration", "higher self") never appears as fact; use the secular translation or nothing.
7. **Never break existing data.** Every change to the data schema ships with a migration and a test against a fixture in the legacy export format.

## Book alignment

- **Title.** The canonical title is *Follow the Pull*. The legacy app still says "Break the Loop", which was an earlier title. Move the title and subtitle into `src/config/book.ts` and replace every hard-coded use. Confirm the title with the owner before the first release.
- **The six moves:** Notice · Pause · Read · Follow · Release · Allow. Core vocabulary: the Loop, the Script, seeing it, the pull, the Formula, Triple A (Accept, Appreciate, Allow).
- **The Lab** is Appendix H's ten steps. They are already implemented as `STEPS` in the legacy code; keep the wording aligned with the book.
- **Dips go to The Anchor (Appendix F), never the Lab.** The book says the lab "is for clear-headed investigation, not for rescue."
- Appendices the app does not cover yet: A (Calming the Nervous System), B (Loop Audit), C (Excitement Field Guide), E (Four C's), F (Anchor), I (Morning Practice). These are Phase 5 candidates.
- When copy quotes or paraphrases the book, take it from `docs/book/`. Never invent book content or chapter references.

## Architecture (target)

```
src/
  main.ts              boot + hash router (keep the legacy view names)
  views/               one module per view: today, talk, practice, compass, journey, tree, lab, library, you, welcome
  components/          ring, river, charts, sheets (pulse, breath, care, feedback, whats-new)
  domain/              pure logic, unit-tested: scores, streaks, momentum, levels, suggestFromLibrary, distress detection
  data/beliefs.ts      loads data/beliefs_seed.json, the single source of truth (no inline copies)
  prompts/             BOOK_CONTEXT, REACH_RULES, STYLE_RULES, COACH_VOICE, MEMORY_RULES, one file each
  platform/
    ai.ts              sample(task, input) → {ok, text}; adapters: api (/api/ai), artifact (window.claude), mock
    storage.ts         one interface; adapters: indexeddb (default), artifact-db, memory (tests)
    telemetry.ts       breadcrumbs, error capture, feedback client (docs/FEEDBACK_SYSTEM.md)
  config/              book.ts, flags.ts (beta channel, feature flags), models.ts
  i18n/                en.json, nl.json (Phase 5)
api/                   Vercel functions: ai.ts, feedback.ts, error.ts
tests/unit  tests/e2e  tests/fixtures
```

- **Stack:** Vite + TypeScript (start with `allowJs` and convert file by file), Vitest, Playwright, `vite-plugin-pwa`. No UI framework unless you propose one with trade-offs and the owner approves; the legacy render-function pattern is fine.
- **Hosting:** Vercel. Every PR gets a preview URL, and `main` is production. Pin functions to an EU region (`fra1`) in `vercel.json`.
- **Second build target:** `npm run build:artifact` produces a single-file build (`vite-plugin-singlefile`, artifact adapters) that can still be published on claude.ai. Keep it working until the owner retires it.

## Commands

Keep this list current whenever scripts change.

| Command | What it does |
|---|---|
| `npm run dev` | local dev server |
| `npm run typecheck` | TypeScript check |
| `npm test` | unit tests (Vitest) |
| `npm run test:safety` | safety test suite only (must always pass) |
| `npm run e2e` | Playwright, WebKit iPhone + Chromium |
| `npm run check:iphone` | iPhone screenshots + iOS pitfall checks (see `/iphone-check`) |
| `npm run validate:data` | belief database schema, ids, duplicates |
| `npm run build` / `build:artifact` | PWA build / single-file claude.ai build |

## How to work

1. Read the doc that applies before you start: `docs/ROADMAP.md` (what's next), `docs/STATE.md` (what already exists — don't rebuild it), `docs/SAFETY.md` (anything touching coaching, mood, care or beliefs), `docs/VOICE.md` (any copy), `docs/FEEDBACK_SYSTEM.md` (telemetry).
2. Branch as `feat/…` or `fix/…`. Never push to `main`.
3. Before opening or updating a PR, run `/ship`. It runs the tests, `/iphone-check`, `/voice-safety-review` when copy changed, the changelog and the PR text.
4. PRs that come from tester feedback say `Fixes #<issue>` so the loop closes automatically.
5. If a request conflicts with this file or with the book, say so in one or two sentences and propose the closest version that fits.

## iOS / Safari checklist (every UI change)

- Inputs, textareas and selects need a font size of at least 16px, or iOS zooms in on focus.
- Use safe areas: `env(safe-area-inset-*)` on the header, bottom nav and sheets, with `viewport-fit=cover`.
- Use `100dvh` / `100svh`, never `100vh`.
- Tap targets are at least 44×44pt.
- Home-screen apps have no browser back button. Every view needs its own way back.
- Speech recognition is unreliable in standalone mode, so keep the keyboard-dictation fallback hint.
- iOS can evict storage. Call `navigator.storage.persist()`, autosave drafts, and offer backups through the Share sheet.
- Web push works only for home-screen apps on iOS 16.4 or later, and only after a user tap.
- When a new service worker arrives, show "New version — tap to refresh". Never reload while someone is mid-entry.
- Test in WebKit, not only Chromium. Emulation is not a real iPhone, so list what the owner must check by hand.

## Skills in this repo (`.claude/skills/`)

| Skill | Use it for |
|---|---|
| `/triage-feedback` | weekly: GitHub feedback + error issues → ranked plain-language plan |
| `/ship` | before every PR: checks, changelog, version, PR text with iPhone test steps |
| `/iphone-check` | iPhone-size screenshots in light/dark + iOS pitfall checks |
| `/voice-safety-review` | any change to copy, practices, belief data or prompts |
| `/belief-data` | adding, moving or importing beliefs in the database |
