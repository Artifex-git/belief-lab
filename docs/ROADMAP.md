# Roadmap

Work through the phases in order, as small PRs. Each phase ends when its **"Done when"** checklist has been tested on the owner's iPhone. Before starting any phase, re-read `docs/STATE.md` so existing features are improved rather than rebuilt.

Owner tasks (accounts, keys, approvals) are marked **👤 Owner**. When you reach one, stop and give the owner the exact clicks.

---

## Phase 0 — Set up the repo (one session, one PR)

- Move `claude-setup/skills/*` to `.claude/skills/` and delete `claude-setup/`. The skills ship in a visible folder because hidden folders often get lost in uploads.
- Add `.gitignore` (node, `.env*`, `.vercel`, `playwright-report`, `test-results`), a short `README.md`, and `CHANGELOG.md` with an `## Unreleased` section.
- Extract the book to text for searching: `docs/book/follow-the-pull-v13.md`, using `pdftotext` or similar. Keep the PDF.
- Compare the legacy inline belief array (`const B=[…]`, `const CORES=[…]`) with `data/beliefs_seed.json`: counts (529 surface beliefs, 37 cores), ids, text and core assignment. Report every difference. Do not fix anything yet.
- Write `docs/STATE.md`, an inventory of the legacy app:
  - every view and sheet, and what it does
  - every record `kind` in storage (entry, mood, compass, pulse, practice, session, brief, insight, memory, beliefmap, investigation, profile, stateinsight, …) with its fields
  - every AI call: where it is triggered, prompt name, expected output, failure fallback
  - existing safety features (distress regex, care sheet, sustained-low check, body flag, history toggle)
  - known bugs, dead code and risks you noticed while reading
- **Done when:** the PR is merged, `/` shows the five skills, and the owner has read the five most important questions or risks you list in the PR description.

## Phase 1 — Lift and shift, with no behaviour change

- Set up a Vite + TypeScript project (`allowJs`). Move the legacy script into modules with as few edits as possible, and move the CSS into `src/styles/`. The UI must look identical.
- Add platform adapters (`src/platform/`):
  - `ai`: for now `mock` returns a friendly "Coaching arrives in the next update" message, and `artifact` keeps the claude.ai path.
  - `storage`: IndexedDB by default, with a one-time migration from `localStorage["bl-items"]`.
  - `downloads`: on iPhone, use the Share sheet (`navigator.share` with a file), falling back to a download link.
- **Import:** You → "Import data" accepts the legacy export format `{app:"The Belief Lab", exported_at, items:[…]}`. It merges by `_id`, previews the counts first, and never overwrites without confirmation. This is how the owner moves his own data out of the claude.ai version.
- Load beliefs from `data/beliefs_seed.json` only. Move prompts into `src/prompts/`. Move the book title into `src/config/book.ts`.
- **Tests:**
  - Unit: `stateScore`, `dayScore`, `momentum`, `levelOf`, `streakInfo`, `suggestFromLibrary`, distress detection in English and Dutch, `sustainedLow`, import/merge.
  - E2E smoke: welcome → morning check-in → Lab quick mode → save → Journey shows the entry; Talk with the mock AI; export → import round-trip.
  - The `npm run check:iphone` script (see the `/iphone-check` skill) and a synthetic `tests/fixtures/rich-user.json`.
- Add CI with GitHub Actions on every PR: typecheck, unit, safety suite, e2e (WebKit iPhone profile and Chromium). Upload screenshots as artifacts.
- **👤 Owner:** connect Vercel (see START_HERE step 4). After that, every PR gets a preview link.
- **Done when:** on the iPhone, the Vercel URL does everything the artifact did except AI, and the owner's real export from the claude.ai version imports cleanly.

## Phase 2 — An installable iPhone app (PWA)

- Manifest: `name` "The Belief Lab", `short_name` "Belief Lab" (12 characters or fewer, for the home-screen label), `id`, `start_url`, `display: standalone`, light and dark theme colours, and icons including a 180px `apple-touch-icon` and a maskable icon. Add iOS meta tags and splash screens.
  - Icon: the spiral from the book cover, simplified, in the app's teal on paper. Propose two or three options as images in the PR and let the owner choose.
- Service worker: offline app shell, fonts and belief data. When an update arrives, show "New version — tap to refresh", and never reload mid-entry.
- Call `navigator.storage.persist()`. Autosave every text field as a draft. Add a gentle monthly backup reminder ("Save a copy of your data") that exports through the Share sheet.
- Standalone polish: safe areas, in-app back navigation on every view, the swipe-back gesture, 16px inputs, `dvh`, no layout jump when the keyboard opens, no white flash on launch in dark mode.
- Install helper: when opened in iOS Safari but not installed, show a dismissible card explaining Add to Home Screen in three steps, with small illustrations.
- About section under You: version, build (git sha), channel (preview or production), build date.
- **Done when:** the owner installs from Safari, the app opens full-screen with its icon, works in airplane mode (except AI), keeps a half-written entry after switching apps, and shows the update prompt after a merge.

## Phase 3 — The AI backend

- `api/ai.ts` takes `POST {task, input, lang}` and returns `{ok, text}` or `{ok:false, reason}`.
  - The server builds the full prompt from `src/prompts/` for a fixed list of **known tasks** (talk, tip, reflect, thoughts, brief, insight, memory, stepFeedback, compassOptions, …; derive the list from `docs/STATE.md`). It refuses unknown tasks. This stops the endpoint being used as a free general-purpose chatbot.
  - Models per task live in `src/config/models.ts`: a fast model for short tips (e.g. `claude-haiku-5-5`) and a stronger one for Talk, briefs and insights (e.g. `claude-sonnet-5-5`). Check the current model IDs in Anthropic's API docs before you ship.
  - Use prompt caching for the static system blocks. Set a 25-second timeout. Stream Talk responses if it is simple; otherwise do it later.
  - Server-side distress check (same rules as the client, see SAFETY.md). On a match, return `{ok:false, reason:"care"}` and the client shows the care sheet.
- **Access:** invite codes from the env var `INVITE_CODES` (comma-separated, one per tester). The code is entered once on first launch, stored on the device and sent as a header. Add a per-code daily cap; propose Upstash Redis (free tier, via the Vercel Marketplace) or something simpler. The monthly spend limit in the Anthropic Console is the hard stop.
- **Privacy screen** on first launch and under You → Privacy: what is sent and to whom (Vercel, Anthropic), that we do not store it, how the "coach remembers me" toggle works (`bl-hist`), and "a thinking aid, not therapy". The owner approves the wording.
- Keep the `artifact` AI adapter working.
- **👤 Owner:** create the API key, set the monthly limit, and add `ANTHROPIC_API_KEY` and `INVITE_CODES` in Vercel (START_HERE step 5).
- **Done when:** Talk, tips, the daily brief, insights and coach memory all work on the iPhone with an invite code. Without a code, the app explains how to get one. A test message containing a distress phrase shows the care sheet and gets no coaching reply.

## Phase 4 — Feedback and error loop

Build `docs/FEEDBACK_SYSTEM.md` exactly as specified:

- Feedback pill → sheet → `/api/feedback` → GitHub issue, with an optional screenshot.
- Automatic error capture → `/api/error` → one deduplicated issue per error.
- The 👎 on an AI reply opens feedback prefilled with "This reply didn't land". Including the reply text is an opt-in checkbox, off by default.
- A "What's new" sheet built from `CHANGELOG.md`, with a marker on items that came from tester feedback ("You asked for this").
- Optional, owner decides: anonymous usage counts (opt-in), shown as funnels in the weekly triage report.
- **👤 Owner:** create a fine-grained GitHub token and add `GITHUB_FEEDBACK_TOKEN` and `GITHUB_REPO` in Vercel (START_HERE step 6).
- **Done when:** the owner taps Feedback on the iPhone, writes one line, attaches a screenshot and sends it, and the issue appears on GitHub within a minute with device, screen and version. A forced test error creates one `auto-error` issue, and repeating it adds a count instead of a new issue. `/triage-feedback` produces a report from real issues.

## Phase 5 — Next-level experience

Pick from this list with the owner, guided by triage. Each item is its own PR. Check `docs/STATE.md` first, because some of these partly exist.

1. **Book alignment.** Apply the *Follow the Pull* title and subtitle. Make the six moves visible: map Lab steps, practices and Compass to Notice · Pause · Read · Follow · Release · Allow. Add chapter references on practices ("From Chapter 10 — The Pull").
2. **The Anchor for dips** (Appendix F). An "I'm in a dip" button, and automatic routing when today's mood is 3 or lower, lead to name it → stop feeding it → the four C's → the smallest true step → kindness. The Lab is never offered in a dip.
3. **Morning Practice** (Appendix I) as a guided 5–10 minute flow, including the book's breathwork safety note.
4. **Loop Audit** (Appendix B) and **Excitement Field Guide** (Appendix C) as practices.
5. **Weekly ritual.** "Run the Lab on the belief that cost you most this week." Turn it into the game loop, tuned so it never shames: no broken-streak messages, and missed days are neutral.
6. **Recurring roots.** In Journey: "3 of your last 5 Labs trace back to *I have to earn my worth*", with a link to that core in the tree.
7. **Search** across the whole log (the book promises "searchable").
8. **Gentle daily reminder.** Opt-in web push at a time the person chooses (home-screen app, iOS 16.4+).
9. **Full Dutch UI** (`src/i18n/`), with a language switch under You. The AI already answers in the person's language.
10. **Accessibility pass.** VoiceOver labels, Dynamic Type, reduced motion, contrast in both themes.

## Phase 6 — Only if needed (owner decision)

- **Sync across devices.** Supabase (EU region, magic-link login, row-level security) or similar. This needs a privacy review and explicit consent, because the data is sensitive.
- **Native app.** A Capacitor wrapper → Xcode → TestFlight. It needs the Apple Developer Program (yearly fee) and a Mac with Xcode, or a cloud build service. Gains: App Store presence, TestFlight's built-in screenshot feedback, widgets, more reliable notifications and microphone. Do not start this before the PWA has run with testers for a few weeks.
- **Sentry** for error tracking, if error volume outgrows GitHub issues.
