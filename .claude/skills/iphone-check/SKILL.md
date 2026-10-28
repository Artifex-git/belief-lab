---
name: iphone-check
description: See screens the way they look on an iPhone — Playwright WebKit at three iPhone sizes in light and dark mode — and check for iOS pitfalls (input zoom, safe areas, tap targets, overflow, contrast, console errors). Use after any UI change and before shipping.
---

# iPhone check

## Run it

```bash
npm run check:iphone -- --screens today,talk,practice   # or omit --screens for all
```

If `check:iphone` doesn't exist yet, create `tests/iphone-check.ts` (Playwright) to this spec and add the script to `package.json`:

- **Browsers and devices:** WebKit only. Use Playwright's device profiles for **iPhone SE** (375×667), **iPhone 15** (393×852) and **iPhone 15 Pro Max** (430×932), each in light and dark `colorScheme`.
- **Seed data:** load `tests/fixtures/rich-user.json` (synthetic: entries, moods, pulses, practices, belief marks) through the storage adapter, so screens aren't empty. Also run one pass with an **empty** profile to check first-run states.
- **Screens:** visit every route (`#today`, `#talk`, `#practice`, `#compass`, `#journey`, `#tree`, `#lab`, `#library`, `#you`, `#welcome`) and open the main sheets (pulse, breath, care, feedback, what's new). Save screenshots to `test-results/iphone/<device>-<theme>-<screen>.png`.
- **Automatic assertions**, collected into a report rather than stopping at the first failure:
  - no horizontal overflow (`scrollWidth <= innerWidth`)
  - every `input`, `textarea` and `select` has a computed font-size ≥ 16px (otherwise iOS zooms on focus)
  - interactive elements are at least 44×44 CSS px (list the offenders)
  - no clipped text (an element with `overflow:hidden` and `scrollWidth > clientWidth`)
  - `@axe-core/playwright` finds no serious or critical WCAG AA issues, contrast especially
  - fixed or sticky header, nav and sheets use `env(safe-area-inset-*)`
  - no console errors during the run
- If Playwright's WebKit can't be installed in this environment, say so and rely on the CI job, which uploads the same screenshots as artifacts.

## Then look

Open the screenshots for the changed screens with the Read tool and judge them as a designer would:

- Is there **one** bold element per screen, with everything else quiet (the app's design rule)?
- Crowding, odd wrapping, misalignment, buttons hidden behind the nav, dark-mode colours that are too harsh or invisible.
- Does the first screen of a flow make the next step obvious?

## Report

Give a short table (screen · device · issue · fix) and fix the clear problems. End with **"Please check on your real iPhone"**, listing only what emulation can't show for this change. Typical items: the keyboard covering the input, dictation, launching from the home-screen icon, the swipe-back gesture, how the app looks after it's been in the background, and haptics or sound if relevant.
