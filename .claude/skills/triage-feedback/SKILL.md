---
name: triage-feedback
description: Turn tester feedback and automatic error reports (GitHub issues) into a ranked, plain-language weekly plan. Use when the owner says triage, "what are testers saying", "what should we fix next", or when run on the weekly schedule.
---

# Triage feedback

You are preparing a short weekly briefing for the owner, the author of the book and not a developer. The aim is to decide **at most three changes for this week**.

## 1. Collect

```bash
gh issue list --label feedback   --state open --limit 200 --json number,title,labels,body,createdAt,comments
gh issue list --label auto-error --state open --limit 200 --json number,title,labels,body,createdAt,comments
ls docs/feedback/ 2>/dev/null | tail -1   # last report, to see what's new since then
git fetch origin feedback-assets 2>/dev/null   # screenshots; view the linked images with Read
```
If usage counts exist (FEEDBACK_SYSTEM.md §6), fetch the last 7 days.

## 2. Sensitive first

Issues labelled `sensitive`: **do not quote, summarise or paraphrase them, anywhere.** List only the issue numbers at the top of the report under "Please read these yourself", and mention them first in chat. Never put their content into a PR, commit or report.

## 3. Group and score

- Merge duplicates into clusters. Ask before closing anything. If the owner agrees, comment on each duplicate "Tracking in #N" and label it `duplicate`.
- **Severity:** 5 = safety, data loss or crash · 4 = a flow is broken · 3 = confusing · 2 = polish · 1 = idea.
- **Reach:** the number of different testers (the `tester` id) and the number of occurrences.
- **Fit:** how well it serves the product brief in CLAUDE.md (×0.5 to ×1.5). Ideas that pull away from the book score low. Say so kindly.
- **Score** = Severity × Reach × Fit. Safety items always go first, whatever their score.
- **Errors:** group by fingerprint. For each group give the count, last build and device, a likely cause (read the code), and whether it is already fixed in a newer build.
- **"I love this" reports:** collect them. They show what must not break.

## 4. Write the report

Write `docs/feedback/YYYY-Www.md` using the ISO week:

```markdown
# Week 44 — feedback report
**In three sentences:** …
## Please read these yourself
#31 (sensitive)
## Proposed for this week (max 3)
1. **<plain-language change>** — why (issues #12 #15, 4 testers) · effort S/M/L · how you'll test it on your iPhone: …
## Everything else
| # | What | Severity | Testers | Proposal |
## What testers love (keep it)
> "…" (#18)
## Errors
| Fingerprint | Count | Last seen | Likely cause | Status |
## Usage (if enabled)
Lab: 12 started → 5 finished (drop-off: step 4)
```

## 5. Hand over

- In chat, give the three-sentence summary and the proposed top 3, and ask: "Go with these, or pick others?"
- **Don't start building** unless the owner already approved, for example "triage and fix the top 3".
- Label the chosen issues `planned` and all reviewed issues `triaged`. Commit the report on a branch `chore/feedback-week-NN` and open a PR, or include it in the first fix PR.
- When building the approved items: one PR per item, each with `Fixes #n`, then run `/ship`.
