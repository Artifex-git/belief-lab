---
name: ship
description: Get the current branch ready for the owner to test on his iPhone and merge — run all checks, iPhone screenshots, voice and safety review, changelog, version bump, and a plain-language pull request with iPhone test steps. Use before opening or updating any pull request, and after a merge to close the loop.
---

# Ship

## Before the PR

1. **Checks.** Run `npm run typecheck && npm test && npm run test:safety && npm run e2e`. Fix whatever fails. Never weaken, skip or delete a test to get green; if a test is genuinely wrong, explain why in the PR.
2. **iPhone check.** Run `/iphone-check` on every screen this branch touches. Look at the screenshots yourself and fix what you see.
3. **Voice and safety.** If any user-facing text, practice, belief data or prompt changed, run `/voice-safety-review`.
4. **Changelog.** Under `## Unreleased` in `CHANGELOG.md`, add one or two plain-language lines per change, written for testers. These lines appear in the in-app "What's new".
   - ✓ "The Lab now remembers a half-written answer if you switch apps. (#14)"
   - ✗ "Refactor draft persistence to IndexedDB."
5. **Version.** Use semver in `package.json`: patch for fixes, minor for new features. At release, the `Unreleased` heading becomes the version.

## The PR description (use exactly these headings)

```markdown
## What changed for you
<1–3 sentences, no jargon>

## Why
<the reason; link feedback: Fixes #12, Fixes #15>

## How to test on your iPhone
Preview: <Vercel preview link — wait for the Vercel bot comment; if it isn't there yet, say "the preview link appears in the Vercel comment below in a minute or two">
1. Open the link in Safari.
2. …
3. You should see …

## Good to know
<risks, anything that changed in stored data, anything the owner must decide; or "Nothing special.">

<details><summary>Technical notes</summary>
<what you changed, tests added, screenshots checked, iOS items the emulator can't verify>
</details>
```

Keep the PR in draft until the checks pass. Ask the owner to merge, or merge yourself only if he has said so in this session.

## After a merge (when the owner says it's merged, or asks you to close the loop)

- On each linked feedback issue, comment: "Shipped in v<version> — thank you. You'll see it under What's new." (GitHub closes `Fixes #n` issues automatically.)
- If this was a release, turn `## Unreleased` into `## <version> — <date>` and start a fresh `## Unreleased`.
- If production breaks, tell the owner the fastest fix: Vercel → Deployments → the previous deployment → **Promote to Production** (instant rollback). Then fix forward in a new PR.
