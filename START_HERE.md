# Start here — The Belief Lab on your iPhone

This pack turns the Belief Lab from a page inside Claude into **your own app on your iPhone's home screen**. It comes with a **Feedback button** that you and your testers can use in 15 seconds, and a weekly rhythm in which Claude Code turns that feedback into improvements you test on your phone before they go live.

```
You / testers on iPhone
   │  tap "Feedback" (or the app hits an error by itself)
   ▼
GitHub Issues — one private inbox
   │  you type /triage-feedback in Claude Code
   ▼
Weekly report: "fix these 3?"  →  you say "go"
   │  Claude Code builds each fix as a pull request
   ▼
Preview link  →  you test it on your iPhone  →  Merge
   ▼
Live for everyone · testers see "What's new · You asked for this"
```

**What's in this pack**

| File | For | What it is |
|---|---|---|
| `START_HERE.md` | you | this guide |
| `KICKOFF_PROMPT.md` | you → Claude Code | the exact messages to paste, phase by phase |
| `CLAUDE.md` | Claude Code | the project rules it reads every session |
| `docs/ROADMAP.md` | both | six phases, each with "done when" checks you do on your iPhone |
| `docs/SAFETY.md`, `docs/VOICE.md` | Claude Code | safety rules (care sheet, Anchor for dips, grief…) and your book's voice |
| `docs/FEEDBACK_SYSTEM.md` | Claude Code | how the Feedback button and error reports work |
| `claude-setup/skills/` | Claude Code | five ready-made skills (see "Do I need skills?") |
| `legacy/`, `data/`, `docs/research/`, `docs/book/` | Claude Code | your current app, belief database, research notes and *Follow the Pull* v13 |

---

## 0. Today, with no setup

Your current version already runs on the iPhone. Open your artifact link (claude.ai/artifact/Kyg9K5Co23f8sSz5kKK1PW) in Safari or in the Claude app. In Safari, use Share → **Add to Home Screen** for an icon. The coach and saving work there because it runs inside your Claude account. Voice input is blocked inside that viewer; the microphone key on the keyboard works instead. Use it this way until Phase 2 is done.

## 1. What you need (one time)

- **GitHub** account (free), for one **private** repository. It holds your manuscript and your testers' feedback, so it must stay private.
- **Claude Code**, included in your Claude plan: at claude.ai/code, or the **Code** tab in the Claude app on your iPhone.
- **Vercel** account (free; sign up with GitHub). It hosts the app and gives every change its own preview link.
- **Anthropic Console** account (platform.claude.com), from Phase 3, for the coach in the standalone app. Pay-as-you-go, with a monthly limit you set.
- *Later, only if you want a "real" App Store app:* the Apple Developer Program (yearly fee) and a Mac. Not needed for testing.

## 2. Set up (about an hour, spread over the phases)

**Step 1 — Create the repository.** On github.com: **New repository** → name `belief-lab` → **Private** → tick "Add a README file" → **Create repository**.

**Step 2 — Upload this pack.** On a computer, unzip the pack. In your new repository, click **Add file → Upload files**, drag in **everything inside** the `belief-lab-starter` folder (files and folders), then click **Commit changes**. There are no hidden folders in the pack, so nothing gets left behind.

**Step 3 — Start Claude Code.** Open claude.ai/code (or the Code tab in the Claude app) → connect GitHub when asked → pick `belief-lab` → paste **Prompt 1** from `KICKOFF_PROMPT.md`. Claude Code will open a pull request (a proposed change you can review). Read its summary, answer its questions, then press **Merge** on GitHub.

**Step 4 — Connect Vercel** (when Claude Code says the first Phase 1 PR is ready). vercel.com → **Add New… → Project** → import `belief-lab` → **Deploy**. From then on:
- Every pull request gets a **preview link**, posted as a comment on the PR. That's where you test.
- Every merge updates your **live app** automatically.

**Step 5 — Turn on the coach** (Phase 3; Claude Code will walk you through it).
1. In the Anthropic Console, create an **API key** and set a **monthly spend limit**.
2. In Vercel → your project → **Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY`: your key
   - `INVITE_CODES`: one code per tester, separated by commas, e.g. `lourens-7k2,anna-4m9`
3. Redeploy.

**Step 6 — Turn on feedback** (Phase 4).
1. On github.com → your picture → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Repository access: **Only select repositories → belief-lab**. Permissions: **Issues: Read and write** and **Contents: Read and write**. Generate it and copy it.
3. In Vercel, add `GITHUB_FEEDBACK_TOKEN` (the token) and `GITHUB_REPO` (`yourname/belief-lab`). Redeploy.

## 3. Install it on your iPhone

1. Open your live link (Vercel shows it, e.g. `belief-lab.vercel.app`) in **Safari**.
2. Tap **Share** (the square with the arrow) → **Add to Home Screen**. If you see **Open as Web App**, leave it on → **Add**.
3. Open it from the icon. It runs full-screen, like any other app. On first launch, enter your invite code.

**Preview links** from pull requests don't need installing: just open them in Safari to test.

**Inviting testers:** send them the link, their personal invite code, the three steps above, and the note in section 9. Each tester gets their own code, so you can switch one off without affecting the others.

**Moving your own data:** in the old claude.ai version, go to You → **Export all my data**. In the new app, go to You → **Import data**. Your entries never pass through GitHub or Claude Code.

## 4. Giving feedback (15 seconds)

1. Tap the small **Feedback** pill, on any screen.
2. Choose **Something broke · Confusing · Idea · I love this**.
3. Type or dictate one line: *what happened, and what you expected*.
4. Optional: **Add screenshot**. Take it first with the side + volume-up buttons, and you can scribble on it before attaching.
5. **Send.**

The app adds the screen, version, iPhone model and any recent error messages by itself. **Never your journal, beliefs or mood.** Errors and crashes report themselves, so you don't need to do anything for those.

Tips: report it the moment it happens, one thing per report, and say what you expected. "I love this" reports matter too. They tell Claude Code what must never break.

## 5. The weekly rhythm (about 20–30 minutes)

1. **Monday:** in Claude Code, type `/triage-feedback`. You get a short report: anything sensitive to read yourself, the three changes it proposes, what testers love, and the errors.
2. Reply, for example: *"Go with 1 and 3."*
3. **During the week:** each change arrives as its own pull request, with **"How to test on your iPhone"** steps and a preview link. Test it on your phone.
   - Happy → **Merge** (on github.com or in the GitHub app).
   - Not quite → write a comment on the PR in plain words. Claude Code picks it up, and with **Auto-fix** turned on it reacts by itself.
4. Testers see **What's new** the next time they open the app, and the people whose feedback led to a change see "You asked for this".

Optional, once it's running: ask Claude Code to make the Monday triage a **scheduled task** so the report is waiting for you.

## 6. Do I need skills?

Short answer: **you don't need to create any, because the five you need are already in this pack.**

`CLAUDE.md` is the foundation: Claude Code reads it every session, and it alone makes Claude Code much better at this project. Skills add something different. They turn a job you repeat into **one command** that runs the same careful way every time:

| Skill | You type it when… | What it saves you |
|---|---|---|
| `/triage-feedback` | every week | reading every issue yourself; you get a ranked plan |
| `/ship` | Claude Code runs it before every PR | checks, iPhone screenshots, changelog and test steps, never forgotten |
| `/iphone-check` | after any screen change (automatic) | catching iPhone-only layout problems before you see them |
| `/voice-safety-review` | copy, practices or prompts change (automatic) | keeping your book's voice and the safety lines intact |
| `/belief-data` | you have new beliefs or research | correct placement in the tree, no duplicates, nothing broken |

They live in the repository (Claude Code moves them to `.claude/skills/` in Phase 0), so they work wherever Claude Code opens this project: web, iPhone and GitHub.

**When to add one:** the third time you find yourself typing the same long instruction, say *"Turn what we just did into a project skill."*

## 7. Costs, honestly

| What | Cost |
|---|---|
| GitHub private repo, Vercel Hobby, Upstash (if used) | free at test scale. Vercel's free plan is for personal, non-commercial use; move to Pro if it becomes a paid product. |
| Claude Code | part of your Claude plan, counted toward its usage limits |
| The coach for testers (Anthropic API) | pay per use. Set the monthly limit **before** inviting anyone, and check the usage page during the first weeks. |
| Apple Developer Program | only for a native App Store / TestFlight app (Phase 6) |

## 8. If something breaks

- **Quickest fix:** Vercel → Deployments → pick the last good one → **Promote to Production**. The app is back in a minute.
- Then tell Claude Code: *"Production is broken: <what you see>. Check the newest auto-error issues and the last merged PR, and fix it."*

## 9. What to tell testers (adapt as you like)

> This is a test version of The Belief Lab, the companion app to my book *Follow the Pull*. What you write stays on your phone. When you ask the coach for a reply, that text is sent to an AI service (Anthropic) to write the answer and isn't stored by me. The Feedback button sends only what you type there, plus technical details like the screen and iPhone model, to my private project inbox. The coach is a thinking aid, not therapy. If you're struggling, please talk to someone you trust or your doctor; in the Netherlands you can call 113 (0800-0113) any time.

## 10. Decisions Claude Code will ask you about

- **The title:** *Follow the Pull* everywhere? The old app still says "Break the Loop".
- **Dutch:** informal "je", and your preferred Dutch words for the book's terms ("the pull", "the Script").
- **Age:** state "for adults (18+)" in onboarding? Recommended.
- **Anonymous usage counts:** opt-in for testers? They show where people drop off, without reading anything they write.

## 11. A native App Store app, later?

This pack builds a home-screen web app first. It's the fastest, cheapest way to test and needs no Mac. A native version (wrapped with Capacitor and distributed through TestFlight) becomes worth it once testers are using the app regularly and you want an App Store presence, widgets, or TestFlight's built-in screenshot feedback. It's in `docs/ROADMAP.md` Phase 6. When you're ready, ask Claude Code for it.
