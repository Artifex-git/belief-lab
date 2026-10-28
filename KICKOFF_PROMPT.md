# Prompts to paste into Claude Code

Use these in Claude Code with the `belief-lab` repository selected: on the web at claude.ai/code, or in the **Code** tab of the Claude app on your iPhone. Paste one at a time. Wait for the pull request, test it, merge it, then move on to the next.

---

### Prompt 1 — Set up (Phase 0)

```
Read CLAUDE.md, START_HERE.md and docs/ROADMAP.md first.

Do Phase 0 of the roadmap as one pull request:
- move claude-setup/skills into .claude/skills and delete claude-setup
- add .gitignore, a short README and CHANGELOG.md
- extract the book PDF to docs/book/follow-the-pull-v13.md
- compare the beliefs inside legacy/The_Belief_Lab.html with data/beliefs_seed.json and report the differences
- write docs/STATE.md: a full inventory of the legacy app (views, stored record kinds and fields, every AI call, safety features, bugs and risks you noticed)

In the PR description, explain in plain language what you found, and list the 5 most important questions or risks for me. Don't start Phase 1 until I say go.
```

### Prompt 2 — Same app, new foundation (Phase 1)

```
Go with Phase 1 from docs/ROADMAP.md. Split it into small PRs that I can each test in a few minutes, and use /ship before every PR.
The app must look and behave exactly like the legacy version, except that AI shows the friendly "coming in the next update" message.
When the first PR is ready, tell me exactly how to connect Vercel so I get a preview link on my iPhone.
```

### Prompt 3 — Put it on my home screen (Phase 2)

```
Go with Phase 2 (installable iPhone app). Start with the icon: show me 2–3 options based on the spiral from the book cover, and I'll pick one.
```

### Prompt 4 — Turn the coach back on (Phase 3)

```
Go with Phase 3 (AI backend). Before you write code, show me the privacy text and the list of AI tasks for my approval, and tell me step by step what I need to set up in the Anthropic Console and in Vercel.
```

### Prompt 5 — The feedback button (Phase 4)

```
Go with Phase 4 exactly as specified in docs/FEEDBACK_SYSTEM.md. Tell me step by step how to create the GitHub token. Afterwards, send a test feedback report and force a test error, so I can see both arrive as issues.
```

---

## Every week (about 20 minutes)

```
/triage-feedback
```
Read the report. Then reply, for example:
```
Go with 1 and 3. One PR each, /ship each.
```

## Other useful ones

- **Bug you see yourself:** `On my iPhone, on the Talk screen, <what happens>. I expected <what>. Fix it, /ship.`
- **New beliefs from research:** `/belief-data` and paste the list or attach the notes.
- **New book version:** `I've added docs/book/FOLLOW_THE_PULL_v14.pdf. Re-extract it, list what changed that affects the app (vocabulary, Lab steps, appendices, quotes), and propose updates.`
- **Something broke after a merge:** `Production is broken: <what you see>. Check the newest auto-error issues and the last merged PR. Tell me whether to roll back in Vercel, and fix it.`
- **Next level:** `Look at docs/ROADMAP.md Phase 5 and the last two feedback reports. Propose the 3 most valuable next steps for testers, with effort and how I'd test each.`
