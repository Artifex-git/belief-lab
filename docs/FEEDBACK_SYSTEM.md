# Feedback and error system

**Goal:** a tester can report anything in about 15 seconds, errors report themselves, and everything lands in **one inbox: GitHub Issues in this private repo**, where Claude Code triages it with `/triage-feedback`. There is no extra service to log into.

```
iPhone ──Feedback pill──▶ /api/feedback ──▶ GitHub issue (label: feedback)
       ──JS error──────▶ /api/error    ──▶ GitHub issue (label: auto-error, deduplicated)
GitHub issues ──/triage-feedback──▶ weekly report + plan ──▶ PRs ("Fixes #12") ──▶ What's new in the app
```

## 1. The feedback pill (client)

- A small "Feedback" pill sits bottom-right, above the nav and inside the safe area, on every screen while `FLAGS.beta` is true. It is always also available under You → "Send feedback".
- Tapping it opens a sheet:
  1. **Four large choices:** Something broke · Confusing · Idea · I love this
  2. **One text box** ("What happened, and what did you expect?"), with the existing Speak button / dictation hint
  3. **Add screenshot (optional):** a photo picker (`<input type="file" accept="image/*">`), so the tester can take an iPhone screenshot first, mark it up, then attach it. Resize on the device to a long edge of 1280px or less, as JPEG at quality 0.8 or below.
  4. A **"What gets sent"** line that expands: your message, the screenshot if you add one, the screen, the app version, the device type and recent error messages. Never your journal, beliefs or mood.
  5. **Send** → thank-you toast: "Thanks — it's on the list." The sheet closes.
- If offline, queue the report in IndexedDB and send it on the next launch.
- Run the distress check on the text first (SAFETY.md §1).

## 2. Payload (`POST /api/feedback`)

```json
{
  "type": "bug | confusing | idea | love",
  "text": "string, max 4000 chars",
  "screen": "talk",
  "screenshot": "data:image/jpeg;base64,... (optional, max ~1 MB)",
  "app": { "version": "0.7.0", "build": "a1b2c3d", "channel": "preview | production" },
  "device": { "ua": "…", "standalone": true, "viewport": "393x852", "dark": true, "lang": "nl-NL" },
  "tester": "t_8f3k2q",
  "breadcrumbs": [ { "t": -42000, "a": "go:talk" }, { "t": -9000, "a": "act:send" } ],
  "errors": [ { "msg": "…", "where": "views/talk.ts:120", "t": -3000 } ],
  "sensitive": false
}
```

- `tester` is a random id generated on first launch, so reports from one person can be grouped. If the tester entered a first name under You, the client may add it. Nothing else identifies them.
- **Breadcrumbs** are a ring buffer of the last 30 navigation and `data-act` names. Never input values or any text.
- **Errors:** the last 10, scrubbed (§4).

## 3. Server: `api/feedback.ts`

- Check that `Origin` is our domain, the invite code is valid (once Phase 3 exists), payload size limits, and a rate limit of 20 reports per tester per day.
- **Screenshot:** commit it with the GitHub Contents API to the branch `feedback-assets` at `feedback/YYYY/MM/<timestamp>-<tester>.jpg`, creating the branch on first use. Link it in the issue. The repo is private, so only collaborators can see it.
- **Create the issue:**
  - Title: `[<type>] <screen>: <first 60 chars of text>`
  - Labels: `feedback`, `type:<type>`, `screen:<screen>`, `channel:<channel>`, plus `sensitive` when flagged
  - Body: the text as a quote, the screenshot link, then a collapsed `<details>` block with app, device, breadcrumbs and errors
- **Sensitive reports:** title `[sensitive] feedback — please read personally` and the body text as-is. Triage never quotes, summarises or copies it anywhere else.
- **Env vars:** `GITHUB_FEEDBACK_TOKEN` (a fine-grained PAT for **this repo only**: Issues read/write, Contents read/write) and `GITHUB_REPO` (`owner/name`).
- Return `{ok:true, issue: <number>}`. The client stores the issue number, so You → "My feedback" can show "Fixed in 0.8" later.

## 4. Automatic errors: `api/error.ts`

- **Client** capture:
  - `window.onerror`, `unhandledrejection`
  - failed `/api/*` calls (status code and task name only)
  - AI calls slower than 20s (as `slow:<task>`)
- **Client** limits: at most 5 reports per session. Ignore known noise ("ResizeObserver loop…", "Script error." without a stack, browser-extension URLs).
- **Scrubbing** before anything leaves the device: cut messages to 300 chars, replace any quoted string longer than 20 chars with `"…"`, remove emails and long numbers. Error messages can accidentally contain user text (for example JSON parse errors), so scrub everything.
- **Fingerprint:** a hash of the normalised message plus the top stack frame (`file:line` without the build hash). Send it as `[err:<first 8 chars>]`.
- **Server:**
  - Search open issues labelled `auto-error` for that fingerprint in the title.
  - If one exists, add at most **one comment per day**, with an updated count, latest build and device.
  - If none exists, create `[err:abcd1234] <message>` with labels `auto-error`, `channel:<channel>`, and the stack in the body.
  - If the matching issue was closed as fixed and the error comes back in a **newer build**, reopen it and comment "regressed in <build>".

## 5. Closing the loop for testers

- **What's new:** on first launch after an update, a small sheet lists the new `CHANGELOG.md` entries (plain language, at most 5). Entries that fixed feedback issues get "You asked for this" when the issue number is in this tester's stored list.
- When a PR with `Fixes #n` merges, `/ship` comments on the issue: "Shipped in v0.8 — thank you." GitHub closes it automatically.

## 6. Optional: anonymous usage counts (owner decides, opt-in)

- Ask once in onboarding: "Help improve the app by sharing anonymous usage counts?" The default is **off**.
- When it is on, send only event names and timestamps rounded to the day: `view:<name>`, `lab:start`, `lab:step:<n>`, `lab:done`, `practice:start/done:<id>`, `talk:session`, `ai:thumb:up/down:<task>`. No ids, no text, no mood values.
- Store daily counters (for example in Upstash Redis). `/triage-feedback` turns them into funnels: "12 Labs started, 5 finished — most drop-off at step 4 (Test it)."

## 7. Tests

- **Payload snapshots** prove no user content leaks: run with a fixture full of entries, then assert the feedback and error payloads contain none of the fixture strings. [safety suite]
- **Fingerprint dedupe** unit test. **Scrubber** unit test.
- **E2E:** open sheet → choose type → type → attach image → send against a mocked `/api/feedback` → toast.
