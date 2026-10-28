# The Belief Lab

Private companion app to *Follow the Pull*. Installable on iPhone and iPad (PWA). See `CLAUDE.md` for project rules and `docs/ROADMAP.md` for what comes next.

## Put it on your iPhone and iPad (about 10 minutes, free)

1. **Deploy** (from this folder, on your computer):
   ```
   npm install
   npx vercel login      # sign up or log in; choose "Continue with Email" if you like
   npx vercel --prod     # accept the defaults; it prints your link, e.g. https://belief-lab.vercel.app
   ```
2. **On the iPhone / iPad:** open that link in **Safari** → Share → **Add to Home Screen** → Add. Open it from the icon.
3. **Turn on the coach (your own Claude):** open any coach feature (for example Talk). A box asks for a key. Create one at console.anthropic.com → API keys (set a low monthly limit there), paste it once. It stays on that device and goes only to Anthropic. Repeat on each device.
   *Note:* a Claude.ai subscription login can't be used by outside apps; the API key is billed separately, per use. Inside the claude.ai artifact version the coach still uses your subscription.
4. **Feedback to GitHub issues (optional, later):** see `docs/FEEDBACK_SYSTEM.md` and `START_HERE.md` step 6. Without it, the Feedback button saves reports on the device and retries.

## Commands
`npm run dev` · `npm test` · `npm run test:safety` · `npm run build` · `npm run e2e` (after build) · `npm run icons`

## Where things are
- `src/legacy-app.js` the original app, unchanged apart from small hooks. `src/platform.js` replaces the claude.ai runtime (AI, downloads).
- `src/feedback.js`, `src/telemetry.js` Feedback pill and automatic error reports. `api/` serverless functions (`ai`, `feedback`, `error`).
