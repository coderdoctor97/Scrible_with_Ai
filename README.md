# ScribeAI — Intelligent Writing Practice Studio

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/Icon/logo_dark.png" />
  <img src="assets/Icon/logo.png" alt="ScribeAI — live writing coach" width="420" />
</picture>

Live or on-demand AI writing coach. Paste a prompt, write your draft, and choose whether feedback streams while you work or waits until you ask for a review. Export your question and answer as Markdown, a Word document, or a PDF. 100% open-source, client-side only — your API key never leaves the browser.

> Ported from a single-file prototype (`ai_guided_writing.html`) to a production React app, then extended with a user-requested review mode, Markdown suggestion copying, and writing exports.

## Why this exists

Writing improves with useful feedback at the right moment. Keep Live Critique on for a tight feedback loop, or pause it and write uninterrupted. In review mode, ask for feedback when you are ready, then copy the concrete suggestion or export the question and answer.

## Features

- **API Settings** — Base URL, API key, model selector with `Refresh` (`/models`) and `Test` (`/chat/completions`), `Save Settings` persisted to `localStorage`
- **Task / Prompt** — textarea + `Save` + `Load saved…` dropdown (persisted array)
- **Draft editor** — serif writing surface, word/char/read-time metrics, auto-save every 600 ms, `.txt`/`.md` import, and export options for `.md`, Word-compatible `.doc`, and PDF
- **Flexible critique** — toggle Live Critique on for streaming feedback after a pause, or turn it off and choose `Review now` when your draft is ready; the preference is remembered locally
- **Review tools** — critique Markdown rendered in the margin, `Copy suggestion` copies the Concrete Suggestion section as raw Markdown, and Markdown in the prompt and answer is rendered for DOC/PDF exports
- **Chrome** — header with theme toggle and `Clear All Data`, toasts, light/dark via CSS variables

## Tech stack

- **Vite + React 18 + TypeScript**
- **React Router** — `/` landing, `/app` studio
- **Tailwind CSS 3**
- **Framer Motion** — scroll reveals, marquee, shimmer
- **marked** — Markdown rendering
- **MagicUI patterns** — vendored as source under `src/components/magicui/` (`Marquee`, `ShimmerButton`, `DotPattern`, `BlurFade`, `BorderBeam`); currently unused by the pages but kept for reference. Original design system lives in `/magicui` (cloned per request) and is attributed below.

## Getting started

```bash
# install
npm install

# dev
npm run dev        # http://localhost:5173

# production build
npm run build
npm run preview
```

No backend, no env file required. All config lives in the Studio sidebar and `localStorage`.

### Using the coach

1. In **Studio** (`/app`) set **Base URL** (e.g. `https://api.openai.com/v1`, `http://localhost:11434/v1` for Ollama, LM Studio) + **API Key** if needed + **Model**, hit **Save Settings** → **Test**.
2. Paste a prompt in **Task / Prompt** (optionally **Save** it).
3. In the **Critique** panel, leave **Live** on for automatic streaming (after eight words and a 1.5-second pause), or switch it off to draft without interruption. In review mode, choose **Review now** when you are ready.
4. Copy the **Concrete Suggestion** as Markdown, or use **Export** above the draft to save the question and answer as `.md`, `.doc`, or PDF (choose **Save as PDF** in the print dialog).
5. **Import** a `.txt`/`.md` file or **Clear All Data** from the header.

## Project structure

```
src/
  App.tsx                 Router + theme bootstrap
  main.tsx
  index.css               Design tokens, grain, prose-ai
  lib/
    storage.ts            KEYS + localStorage helpers
    api.ts                SYSTEM_PROMPT, fetchModels, streamCritique
    utils.ts              cn()
  hooks/useToast.ts
  components/
    ui/Toast.tsx
    magicui/              Marquee, ShimmerButton, DotPattern, BlurFade, BorderBeam
    layout/               SiteHeader, SiteFooter
  pages/
    Landing.tsx           Open-source landing with scroll animation
    Studio.tsx            3-panel writing studio with live/manual critique and export tools
```

## Design notes

- **Principle: keep the writing flow flexible.** Feedback is available as-you-write or on demand, and exports keep the question and answer portable.
- **Aesthetic: The Editor's Desk** — editorial broadsheet language on the Solar Workshop palette: warm paper `#FFFBF5`, ink `#0F1419`, solar amber `#FF6B35` with an AA-safe `--accent-ink` for small amber text. Mono marginalia (`Nº 01`), hairline rules, folio labels, editor's pencil marks (`.mk-strike` / `.mk-ins` / `.mk-note`), a blinking block caret as the product glyph, and serif Newsreader italic accents. No emoji icon tiles, badge pills, blobs, or fake browser chrome. Type: **Bricolage Grotesque** (display), **DM Sans** (UI + italic), **Newsreader** (draft + italic accents), **JetBrains Mono** (marginalia + code).
- **Responsiveness:** desktop 3-col (`300px 1fr 380px`); tablet/mobile collapses to stacked layout with `Write` / `Critique` tabs and collapsible settings drawer. Editor and critique panels scroll independently on desktop, naturally on mobile.
- **Hallmark / Impeccable:** copy is direct, human, no AI filler (“delve”, “tapestry”, “elevate”, “seamless” etc. are avoided). Grammar and punctuation audited.
- **Ponytail:** one `storage.ts`, one `api.ts`, no over-abstracted contexts or prop-drilling layers. Studio holds state locally; effects are explicit and debounced with `setTimeout`/`AbortController`.

## Deployment

Static build — deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host:

```bash
npm run build
# then upload dist/
```

## Attribution

- MagicUI — https://magicui.design — components vendored under MIT. Full registry cloned to `/magicui` for reference (as requested). Individual components in `src/components/magicui/` note their origin.
- Prototype HTML preserved as `ai_guided_writing.html` for audit.

## License

MIT. Fork, self-host, change the system prompt.

## Docs for agents

- `AGENT.md` — guidance for future agents working in this repo
- `.claude/CLAUDE.md` — Claude-specific entry point referencing `AGENT.md`
- `manifest.json` — machine-readable work log of this conversion
