# UI/UX Audit Dossier — ScribeAI (`Scrible_with_Ai`)

> **Audit Type:** Read-Only UI/UX & Design System Architecture Audit  
> **Target Project:** ScribeAI — Live Writing Practice Studio (`https://github.com/coderdoctor97/Scrible_with_Ai.git`)  
> **Auditor:** `/audit-ui-ux` skill  
> **Scope:** Presentation layer, typographic rhythm, design tokens, spatial consistency, accessibility, and zero-logic-regression boundaries.

---

## Executive Summary

ScribeAI is an open-source, client-side, live writing coach ported from a single-file prototype (`ai_guided_writing.html`) to a React SPA. The application is built around **"The Editor's Desk"** aesthetic — evoking physical broadsheet typography, typewriter marginalia, editor pencil marks, and warm paper tones.

While the conceptual branding and copy are strong, an audit of the codebase reveals significant **presentation debt and styling friction**:
1. **Severe Inline Style Proliferation:** Over 65% of color, border, and background styling is written directly as inline `style={{ borderColor: "var(--border-ink)", background: "var(--panel)", color: "var(--text)" }}` rather than idiomatic Tailwind CSS utility classes.
2. **Typographic Disarray:** Four disparate font families are loaded with unstandardized font sizes (`text-[10px]`, `text-[10.5px]`, `text-[11px]`, `text-[11.5px]`, `text-[12px]`, `text-[12.5px]`, `text-[13px]`, `text-[15.5px]`, `text-[22px]`, etc.) and chaotic line-height combinations.
3. **Weak Depth & Elevation in Dark Mode:** In dark mode, borders and cards lack tactile depth and contrast. Shadow tokens produce muddy dark blurs rather than crisp, multi-layered elevation.
4. **Interactive & Feedback Latency:** The Studio lacks animated transitions, loading skeletons during the `Reviewing...` phase, accessible focus-visible rings on multiple controls, and micro-interaction polish.
5. **Rigid Layout & Breakpoint Gaps:** Tablet screens (768px–1023px) are needlessly forced into the mobile single-tab layout, while desktop fixed-pixel dimensions (`300px 1fr 380px`) do not adapt gracefully to varying display widths.

Crucially, ScribeAI has a strict **Prime Directive**: **Zero Feature Regressions**. All state, debounced timers, `AbortController` cancellation flows, localStorage keys, and OpenAI-compatible SSE streaming logic are cataloged in the **Logic Freeze Matrix** and must remain completely untouched during redesign.

---

## Section 1: Environment & Configuration Discovery

| Parameter | Detected Value | Verification Source |
| :--- | :--- | :--- |
| **Framework / Runtime** | Vite v8.2.2 + React SPA | `package.json`, `vite.config.ts` |
| **React Version** | `^19.2.8` (React 19) | `package.json` |
| **Routing Architecture** | `react-router-dom` v7.18.3 (Client-side SPA) | `src/App.tsx` |
| **TypeScript Version** | `~6.0.2` (Strict mode configured) | `tsconfig.app.json` |
| **Styling Foundation** | Tailwind CSS `^3.4.1` + PostCSS `^8.5.28` + Autoprefixer | `tailwind.config.js`, `postcss.config.js` |
| **Utility Class Helpers** | Naive custom `cn()` (`filter(Boolean).join(" ")`). **Missing `clsx` and `tailwind-merge`** | `src/lib/utils.ts` |
| **Design Tokens** | CSS Variables in `:root` and `.dark` (Solar Workshop palette) | `src/index.css` |
| **Dark Mode Implementation** | Class-based (`.dark` on `document.documentElement`) | `src/App.tsx`, `src/components/layout/SiteHeader.tsx` |
| **Component Libraries** | None installed. Hand-rolled UI primitives; vendored MagicUI patterns | `src/components/magicui/` |
| **Icon Libraries** | None installed. Raw inline SVG icons | `SiteHeader.tsx`, `Studio.tsx` |
| **Motion & Animation** | `framer-motion` `^13.2.0` | `package.json`, `src/pages/Landing.tsx` |
| **Markdown Rendering** | `marked` `^18.0.11` | `src/pages/Studio.tsx` |
| **Linter / Checker** | `oxlint` `^1.79.0` (4 warnings detected on `useCallback` deps) | `.oxlintrc.json` |

---

## Section 2: Codebase Topology & Component Hierarchy

### Route Map
```
/           → src/pages/Landing.tsx   (Marketing & Interactive Demo)
/app        → src/pages/Studio.tsx    (Core 3-Panel Writing Coach Studio)
* (fallback)→ None configured (redirects to default route)
```

### Component Hierarchy Categorization

#### 1. Layout Wrappers
- **`src/App.tsx` (`AppShell`)**: Root layout orchestrating `BrowserRouter`, theme initialization, sticky `SiteHeader`, dynamic content container (`main.flex-1`), and `SiteFooter`.
- **`src/components/layout/SiteHeader.tsx`**: Top navigation header (56px) containing theme-responsive logo image, mode label, Site/Studio switcher button, theme toggle button (`SunIcon`/`MoonIcon`), and local storage reset button (`TrashIcon`).
- **`src/components/layout/SiteFooter.tsx`**: Clean broadsheet footer with copyright, studio link, and privacy/offline reminder.

#### 2. Domain & Feature Components
- **`src/pages/Studio.tsx` (Main Studio Workspace)**:
  - *Panel 1 (Left Sidebar / Drawer)*: API Base URL input, API Key password input, Model selector with Refresh & Test buttons, Save Settings button, mobile close drawer button.
  - *Panel 2 (Center Workspace)*: Task/Prompt textarea with saved prompts dropdown and Save button, Draft editor textarea with Newsreader serif, live HUD footer (words, chars, read time, auto-save status, live typing/coaching status), and .txt/.md file importer.
  - *Panel 3 (Right Margin)*: Live Critique container with status chip (`Listening`, `Reviewing...`, `Live`, `Error`), 3-step empty-state guide, and streaming Markdown critique render via `marked`.
- **`src/components/ui/WritingDemo.tsx`**: Self-playing interactive typing and critique simulation on the landing page, demonstrating the 1.5s pause trigger and live margin feedback.
- **`src/pages/Landing.tsx`**: Long-form editorial landing page featuring Masthead, Loop overview, Editorial Markup preview, Studio wireframe diagram, Manifesto footnotes, and Ink CTA banner.

#### 3. Atomic Primitives & Utilities
- **`src/components/ui/Toast.tsx` (`ToastStack`)**: Floating notification stack anchored at `bottom-4 right-4` with status glyphs (`✓`, `✕`, `•`) and colored accent borders.
- **`src/components/ui/Reveal.tsx` (`Reveal`, `SectionHead`)**: Framer Motion scroll-reveal wrappers and broadsheet folio section headers.
- **`src/components/magicui/*`**: Vendored visual components (`BlurFade`, `BorderBeam`, `DotPattern`, `Marquee`, `ShimmerButton`).

---

## Section 3: Logic & State Freeze Matrix (The Unbreakable Boundary)

During the redesign, **no logic, state lifecycles, debounced timers, or API contracts may be modified**. The table below establishes the logic-freeze contract:

| Component / File | Component Type | Critical State Hooks & Refs | Critical Event Handlers | External APIs, Storage & Contracts |
| :--- | :--- | :--- | :--- | :--- |
| **`src/pages/Studio.tsx`** | Client Component | `useState` (`apiBase`, `apiKey`, `selectedModel`, `prompt`, `draft`, `savedPrompts`, `modelOptions`, `wordCount`, `charCount`, `readTime`, `saveStatus`, `liveLabel`, `liveColor`, `coachStatus`, `feedbackHtml`, `hasFeedback`, `mobileTab`, `showSettings`)<br>`useRef` (`abortRef`, `lastFingerprint`, `saveTimeout`, `liveTimer`, `fileInputRef`, `feedbackRef`, `draftRef`, `promptRef`) | `triggerAutoSave` (600ms debounce)<br>`scheduleLiveAnalysis` (1500ms debounce, 8-word check)<br>`executeLiveAnalysis` (streaming runner)<br>`saveSettings`<br>`handleFetchModels`<br>`handleTest`<br>`handleFile`<br>`handleSavePrompt` | **LocalStorage Keys:** `scribe_api_base`, `scribe_api_key`, `scribe_model`, `scribe_prompt`, `scribe_draft`, `scribe_saved_prompts`<br>**API:** `streamCritique` (SSE streaming POST `/chat/completions`), `fetchModels` (GET `/models`), `testConnection` (POST `/chat/completions`)<br>**Parser:** `marked.parse` |
| **`src/components/layout/SiteHeader.tsx`** | Client Component | `useState` (`scrolled`, `dark`)<br>`useEffect` with `MutationObserver` on `document.documentElement` class list | `toggleTheme`<br>`clear` (`localStorage.clear()`, `location.reload()`) | **LocalStorage Key:** `scribe_theme`<br>**DOM Class:** `.dark` on `<html>` |
| **`src/hooks/useToast.ts`** | Client Hook | `useState` (`toasts`) | `show(msg, type)`<br>3200ms `setTimeout` auto-dismiss | In-memory notification state |
| **`src/lib/api.ts`** | Core Logic Module | None (Pure async functions) | `streamCritique`<br>`fetchModels`<br>`testConnection` | OpenAI SSE streaming protocol (`data:` chunks, `[DONE]`), `SYSTEM_PROMPT` evaluation template |
| **`src/lib/storage.ts`** | Storage Module | None (Synchronous storage helpers) | `getLS`<br>`setLS`<br>`getSavedPrompts` | `localStorage` serialization & fallback safety |
| **`src/components/ui/WritingDemo.tsx`** | Client Component | `useState` (`sceneIndex`, `text`, `notesShown`, `status`)<br>`useMemo` (`reduced`, `words`) | Looping scene timer runner (`later()`) | Media query `(prefers-reduced-motion: reduce)` |

---

## Section 4: Visual Debt & Inconsistency Inventory

### 1. Typography Inconsistencies
- **Fragmented Arbitrary Sizes:** Instead of standard Tailwind typography steps (`text-xs`, `text-sm`, `text-base`, `text-lg`), the codebase contains arbitrary values:
  - `Studio.tsx`: `text-[10px]`, `text-[11px]`, `text-[11.5px]`, `text-[12px]`, `text-[12.5px]`, `text-[13px]`, `text-[15.5px]`, `text-[22px]`.
  - `Landing.tsx`: `text-[13.5px]`, `text-[14px]`, `text-[14.5px]`, `text-[15.5px]`, `text-[16px]`, `text-[17.5px]`, `text-[18px]`, `text-[19px]`, `text-[20px]`, `text-[30px]`, `text-[34px]`, `text-[40px]`, `text-[44px]`, `text-[46px]`, `text-[48px]`, `text-[56px]`, `text-[68px]`.
- **Inconsistent Line Heights & Tracking:** Heading styles lack cohesive vertical metrics. Arbitrary leading includes `leading-[0.98]`, `leading-[1.02]`, `leading-[1.04]`, `leading-[1.15]`, `leading-[1.75]`, `leading-[1.8]`, `leading-[1.85]`, and `leading-[1.9]`. Tracking varies between arbitrary negative tracking (`tracking-[-0.03em]`, `tracking-[-0.025em]`, `tracking-[-0.01em]`) and arbitrary positive tracking (`!tracking-[0.08em]`, `!tracking-[0.1em]`, `letter-spacing: 0.14em`, `0.18em`).
- **Font Stack Conflicts:** Four distinct Google Web Fonts are imported synchronously in `index.html` without fallback font metric overrides, causing subtle layout shifts (CLS) on initial load.

### 2. Spatial Bottlenecks & Arbitrary Values
- **Rampant Inline Style Pollution:**
  ```tsx
  // Example from Studio.tsx:
  style={{ borderColor: "var(--border-ink)", background: "var(--panel)", color: "var(--text)" }}
  ```
  Over 80 occurrences of inline `style={{ ... }}` bypass Tailwind's utility engine, breaking responsive overrides, pseudo-classes, and CSS containment.
- **Rigid Fixed-Width Grids:**
  - `Studio.tsx` defines `lg:grid-cols-[300px_1fr_380px]`. On standard 1280px laptops, the editor is constrained to ~540px while sidebar and feedback occupy fixed real estate regardless of screen proportion.
  - The studio blueprint preview in `Landing.tsx` uses `md:grid-cols-[240px_1fr_300px]`.
- **Arbitrary Container Constraints:** Hardcoded widths like `max-w-[160px]` on the saved prompts dropdown, `max-w-[300px]` on empty state, and prose widths `max-w-[50ch]`, `max-w-[54ch]`, `max-w-[22ch]`, `max-w-[28ch]`, `max-w-[20ch]`.

### 3. Elevation & Depth Flaws
- **Weak Dark Mode Contrast:** The delta between `--bg` (`#0C1015`), `--panel` (`#131A21`), and `--panel-soft` (`#18212B`) is under 6% lightness difference. As a result, panel divisions blur together into a muddy dark surface.
- **One-Dimensional Flat Borders:** All panel boundaries use a single `1px solid var(--border-ink)`. There are no subtle highlights (e.g. `inset 0 1px 0 0 rgba(255,255,255,0.06)`), causing cards to feel flat and stamped rather than elevated.
- **Shadow Washout:** `--shadow-lg` in dark mode (`0 24px 64px rgba(0, 0, 0, 0.5)`) produces a diffuse black halo without ambient occlusion or structural sharpness.

### 4. Interactive & Accessibility Gaps
- **Missing Focus-Visible States:** Buttons in `SiteHeader.tsx` (`SunIcon`, `TrashIcon`) and secondary controls in `Studio.tsx` (`Refresh`, `Import .txt/.md`, saved prompt select) lack dedicated `focus-visible:` focus rings, failing WCAG 2.4.7.
- **Missing Loading & Transition Skeletons:** When the coach enters the `Reviewing...` state, the critique container either retains stale text or displays a blank space until streaming chunks arrive. There is no subtle shimmer skeleton or progress indicator.
- **Button Disabled / Loading States:** When `handleFetchModels` or `handleTest` runs, buttons remain interactive with no visual spinner, disabled styling (`disabled:opacity-50 disabled:cursor-not-allowed`), or `aria-busy="true"`.
- **Unsafe Class Merging:** `src/lib/utils.ts` implements `cn()` as `classes.filter(Boolean).join(" ")`. Without `tailwind-merge`, passing `className="p-4"` to a component with default `p-6` results in non-deterministic class application.

### 5. Responsive Breakpoint Failures
- **Tablet Dead-Zone (768px – 1023px):** On iPad and medium tablets, `Studio.tsx` defaults to the mobile tabbed view (`lg:flex` is only active at 1024px+). Users with 800px–1000px of screen real estate are unnecessarily forced to toggle back and forth between "Write" and "Coach" tabs.
- **Cramped Mobile Settings Drawer:** On mobile, clicking the settings icon displays an un-animated block overlay that pushes content offscreen rather than opening a smooth bottom sheet (e.g. Vaul-style drawer).

---

## Section 5: Priority Refactor Candidates

| Priority | Component Name | File Path | Severity | Transformation Goals |
| :---: | :--- | :--- | :---: | :--- |
| **#1** | **Studio Workspace** | `src/pages/Studio.tsx` | **HIGH** | • Replace rigid 3-column grid with a modern Bento-grid workspace layout.<br>• Purge all inline `style={{ ... }}` in favor of semantic Tailwind utility classes.<br>• Introduce real-time skeleton pulse during `Reviewing...` status.<br>• Refactor metrics bar into a polished, high-density telemetry HUD.<br>• Elevate empty-state typography with refined micro-illustrations.<br>• Optimize tablet layout (collapsible collapsible sidebar + split editor/critique). |
| **#2** | **Site Header & Navigation** | `src/components/layout/SiteHeader.tsx` | **MEDIUM** | • Elevate glassmorphism border with subtle specular rim lighting.<br>• Add tactile micro-animations to theme toggle and clear actions.<br>• Ensure 100% WCAG focus-visible compliance on all icon buttons.<br>• Clean up route transitions between `/` and `/app`. |
| **#3** | **Interactive Writing Demo** | `src/components/ui/WritingDemo.tsx` | **MEDIUM** | • Upgrade manuscript card with Aceternity/MagicUI subtle border-beam accent.<br>• Enhance animated note entry transitions with fluid spring physics.<br>• Refactor status badge with ambient pulsing glow and crisp typographic hierarchy. |
| **#4** | **Editorial Landing Page** | `src/pages/Landing.tsx` | **MEDIUM** | • Harmonize typographic scale from arbitrary pixels to disciplined broadsheet scales.<br>• Convert wireframe studio diagram into an interactive, high-fidelity Bento preview.<br>• Clean up inline style clutter and replace with Tailwind tokens.<br>• Polish scroll reveals and button hover micro-interactions. |
| **#5** | **Toast & Notification System** | `src/components/ui/Toast.tsx` | **LOW** | • Upgrade from primitive pills to Sonner-grade stacked feedback cards.<br>• Add spring exit animations and accessible status semantics. |
| **#6** | **Utility & Token Foundation** | `src/lib/utils.ts`, `tailwind.config.js` | **LOW** | • Upgrade `cn()` to incorporate conflict-safe merging (`clsx` + `tailwind-merge`).<br>• Map CSS variables directly to Tailwind semantic utility names (`bg-panel`, `border-ink`, `text-faint`) to eliminate inline styles forever. |

---

## Machine-Readable UI/UX Audit JSON Dossier

```json
{
  "project_metadata": {
    "next_version": "none (Vite 8.2.2 SPA)",
    "router_type": "client-side (react-router-dom v7.18.3)",
    "react_version": "^19.2.8",
    "tailwind_version": "^3.4.1",
    "installed_ui_libraries": [
      "none (hand-rolled primitives, vendored magicui patterns)"
    ],
    "installed_icon_libraries": [
      "none (inline SVG icons)"
    ],
    "installed_motion_libraries": [
      "framer-motion ^13.2.0"
    ],
    "utility_helpers": [
      "custom cn() filter(Boolean).join(' ')"
    ]
  },
  "design_system_status": {
    "custom_tokens_defined": true,
    "color_palette_type": "custom-css-variables",
    "typography_found": [
      "Bricolage Grotesque",
      "DM Sans",
      "Newsreader",
      "JetBrains Mono",
      "arbitrary px values"
    ],
    "dark_mode_supported": true,
    "global_css_overrides": [
      "src/index.css (:root & .dark tokens, .grain, .mono-label, .hairline, .caret-block, .mk-strike, .mk-ins, .mk-note, .prose-ai, .glass)"
    ]
  },
  "logic_freeze_matrix": [
    {
      "component_path": "src/pages/Studio.tsx",
      "component_type": "Client Component",
      "critical_state_hooks": [
        "useState(apiBase)",
        "useState(apiKey)",
        "useState(selectedModel)",
        "useState(prompt)",
        "useState(draft)",
        "useState(savedPrompts)",
        "useState(modelOptions)",
        "useState(wordCount)",
        "useState(charCount)",
        "useState(readTime)",
        "useState(saveStatus)",
        "useState(liveLabel)",
        "useState(liveColor)",
        "useState(coachStatus)",
        "useState(feedbackHtml)",
        "useState(hasFeedback)",
        "useState(mobileTab)",
        "useState(showSettings)",
        "useRef(abortRef)",
        "useRef(lastFingerprint)",
        "useRef(saveTimeout)",
        "useRef(liveTimer)",
        "useRef(draftRef)",
        "useRef(promptRef)"
      ],
      "critical_handlers": [
        "triggerAutoSave",
        "scheduleLiveAnalysis",
        "executeLiveAnalysis",
        "saveSettings",
        "handleFetchModels",
        "handleTest",
        "handleFile",
        "handleSavePrompt",
        "setDraftNow",
        "setPromptNow"
      ],
      "external_apis_or_actions": [
        "localStorage.getItem(scribe_*)",
        "localStorage.setItem(scribe_*)",
        "streamCritique (POST /chat/completions SSE)",
        "fetchModels (GET /models)",
        "testConnection (POST /chat/completions)",
        "marked.parse(html)"
      ]
    },
    {
      "component_path": "src/components/layout/SiteHeader.tsx",
      "component_type": "Client Component",
      "critical_state_hooks": [
        "useState(scrolled)",
        "useState(dark)",
        "useEffect(MutationObserver)"
      ],
      "critical_handlers": [
        "toggleTheme",
        "clear"
      ],
      "external_apis_or_actions": [
        "document.documentElement.classList.toggle('dark')",
        "localStorage.setItem('scribe_theme')",
        "localStorage.clear()",
        "location.reload()"
      ]
    },
    {
      "component_path": "src/hooks/useToast.ts",
      "component_type": "Client Hook",
      "critical_state_hooks": [
        "useState(toasts)"
      ],
      "critical_handlers": [
        "show"
      ],
      "external_apis_or_actions": [
        "setTimeout(autoDismiss, 3200)"
      ]
    },
    {
      "component_path": "src/components/ui/WritingDemo.tsx",
      "component_type": "Client Component",
      "critical_state_hooks": [
        "useState(sceneIndex)",
        "useState(text)",
        "useState(notesShown)",
        "useState(status)",
        "useMemo(words)"
      ],
      "critical_handlers": [
        "runScene",
        "later"
      ],
      "external_apis_or_actions": [
        "window.matchMedia('(prefers-reduced-motion: reduce)')"
      ]
    }
  ],
  "visual_debt_audit": {
    "typography_inconsistencies": [
      "Over 20 distinct arbitrary font sizes (text-[10px], text-[11.5px], text-[13px], text-[15.5px], text-[22px], text-[44px], text-[56px], text-[68px])",
      "Inconsistent line-height tokens across headings and body (leading-[0.98] through leading-[1.9])",
      "Arbitrary tracking declarations (!tracking-[0.08em], tracking-[-0.03em], letter-spacing: 0.14em)",
      "Unsynchronized Google Fonts import causing layout shifts on cold load"
    ],
    "spatial_bottlenecks": [
      "Extreme proliferation of inline styles: style={{ borderColor: 'var(--border-ink)', background: 'var(--panel)' }} on >80 JSX nodes",
      "Rigid desktop 3-column grid (lg:grid-cols-[300px_1fr_380px]) that does not adapt fluidly on widescreen or 1280px laptops",
      "Hardcoded pixel heights (h-[56px], lg:h-[calc(100vh-56px)], min-h-[60vh])",
      "Inconsistent section padding rhythm between landing sections and studio panels"
    ],
    "arbitrary_values_detected": [
      "max-w-[160px] on prompt selector",
      "max-w-[300px] on empty state container",
      "Arbitrary prose line lengths max-w-[50ch], max-w-[54ch], max-w-[22ch], max-w-[28ch], max-w-[20ch]",
      "Raw hex color values hardcoded in tailwind.config.js without full CSS variable binding"
    ],
    "elevation_and_depth_flaws": [
      "Flat 1px borders with insufficient contrast in dark mode (--border: #253140 on --bg: #0C1015)",
      "Low luminance delta between --bg (#0C1015), --panel (#131A21), and --panel-soft (#18212B)",
      "Muddy dark mode drop shadows without ambient occlusion or rim highlights",
      "No elevation layering (z-axis depth) across panel hierarchy"
    ],
    "accessibility_and_contrast_gaps": [
      "Missing focus-visible indicators on theme toggle, trash, and refresh buttons (WCAG 2.4.7 violation)",
      "Absence of loading skeleton and aria-busy state while critique is streaming or refreshing models",
      "No aria-expanded or aria-controls on mobile settings drawer toggle",
      "Class conflicts possible due to naive cn() implementation lacking tailwind-merge"
    ],
    "responsive_breakpoint_failures": [
      "Tablet dead-zone between 768px and 1023px needlessly forced into mobile single-tab layout",
      "Mobile settings drawer pushes main content down rather than opening in a clean modal/sheet",
      "Prompt select and Draft action header wrap unpredictably on small mobile screens (<360px)"
    ]
  },
  "priority_refactor_candidates": [
    {
      "component_name": "Studio Workspace",
      "file_path": "src/pages/Studio.tsx",
      "severity": "high",
      "transformation_goals": "Transition from rigid 3-column layout to Bento-grid layout; eliminate inline styles; add real-time critique loading skeleton; elevate word/char telemetry HUD; optimize tablet breakpoint."
    },
    {
      "component_name": "Site Header & Navigation",
      "file_path": "src/components/layout/SiteHeader.tsx",
      "severity": "medium",
      "transformation_goals": "Refine glassmorphism with subtle specular rim light; add spring micro-interactions to icon buttons; guarantee WCAG focus-visible compliance."
    },
    {
      "component_name": "Interactive Writing Demo",
      "file_path": "src/components/ui/WritingDemo.tsx",
      "severity": "medium",
      "transformation_goals": "Enhance manuscript card with subtle border beam accent; polish animated note entry spring physics; elevate status badge."
    },
    {
      "component_name": "Editorial Landing Page",
      "file_path": "src/pages/Landing.tsx",
      "severity": "medium",
      "transformation_goals": "Harmonize typographic scale; replace arbitrary pixel values with broadsheet type scale; upgrade wireframe diagram to high-fidelity Bento preview."
    },
    {
      "component_name": "Toast & Notification System",
      "file_path": "src/components/ui/Toast.tsx",
      "severity": "low",
      "transformation_goals": "Upgrade notification pills to Sonner-grade stacked cards with fluid spring entrance/exit and accessible semantics."
    },
    {
      "component_name": "Utility & Token Foundation",
      "file_path": "src/lib/utils.ts",
      "severity": "low",
      "transformation_goals": "Upgrade cn() with clsx and tailwind-merge; map CSS variables directly into Tailwind utilities to eliminate inline style overrides."
    }
  ]
}
```
