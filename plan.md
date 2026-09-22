# UI/UX Redesign Plan — ScribeAI (`Scrible_with_Ai`)

## Block A — Header

- **Project:** ScribeAI — Live Writing Practice Studio (`https://github.com/coderdoctor97/Scrible_with_Ai.git`)
- **Date:** September 21, 2026
- **Planning Mode:** **Best-Result Mode** (executed directly following `/audit-ui-ux`, bypassing optional `/qna-plan`)
- **Chosen Archetype:** **Editorial BroadSheet meets Linear Precision (Modern Bento Studio)**
  - *Why this archetype:* ScribeAI is a high-focus writing tool built around "The Editor's Desk" aesthetic (warm paper `#FFFBF5`, printer's ink `#0F1419`, solar amber `#FF6B35`, serif Newsreader, and monospaced marginalia). The Linear precision archetype brings high-density keyboard ergonomics, disciplined dark-mode ramps, zero-latency HUD metrics, and subtle specular borders, while Bento grid architecture transforms the rigid 3-panel split into an adaptable, cohesive workstation.
- **Curated Sources Subset:**
  - **#1 shadcn/ui** — Semantic class tokens, clean primitive patterns, Radix-style focus rings
  - **#3 Motion (Framer Motion)** — Spring physics, layout morphing, exit presence
  - **#4 Aceternity UI** — Subtle border beam and specular rim highlights for cards
  - **#5 Magic UI** — Vendored Marquee, BlurFade, and Shimmer patterns aligned with app theme
  - **#6 Emil Kowalski / Animations on the Web** — Fluid micro-interactions, gesture fluidity, tactile feedback
  - **#9 Sonner** — Stackable, spring-animated feedback toast notifications
  - **#10 Vaul** — Mobile-first bottom sheet drawer mechanics for settings
  - **#11 Refactoring UI** — Systematic typography scale, depth without muddy borders, optical balance
  - **#12 Steve Schoger Design Tips** — Shadow layering, button padding ratios, dark-mode border contrast
  - **#13 Linear Method** — High-density telemetry HUD, keyboard-driven UI, zero-latency feedback
  - **#14 Geist Design System** — Monospaced numeric metrics, high-contrast readouts, disciplined grayscale
  - **#15 Tailwind CSS Documentation** — Semantic CSS variable mapping, container queries, variant modifiers
  - **#16 class-variance-authority (CVA)** — Type-safe button and chip variant definitions
  - **#17 tailwind-merge & clsx** — Conflict-free dynamic utility class merging in `cn()`
  - **#23 Bento Grids** — Asymmetric workspace layout rhythm, content density, and modular panels
  - **#24 W3C WAI-ARIA Authoring Practices Guide** — Full keyboard focus rings, `aria-live`, `aria-busy`, dialog semantics

---

## Block B — The 5 Logic-Freeze Instructions

*The following 5 instructions are the immutable logic-freeze contract that `/implement-plan` must adhere to for every file modification:*

1. **Preserve every state and hook.** Every `useState`, `useReducer`, `useRef`, `useMemo`, `useCallback`, `useContext`, and third-party hook (`useQuery`, `useForm`, `useRouter`, `useSearchParams`) keeps its exact name, dependency array, and internal logic. Change only how the output is presented.
2. **Preserve every handler and event.** Every `onClick`, `onSubmit`, `onChange`, `onKeyDown`, `onBlur`, and custom callback stays attached to its element with an unchanged signature and payload. Change only that element's appearance.
3. **Preserve every API and mutation.** Server actions, API-route requests, React Query mutations, and SWR revalidations keep identical arguments and effects.
4. **Stay inside the visual layer.** Every change comes from JSX restructure, Tailwind utility swaps, added decorative sub-elements, and accessible/motion wrappers around existing elements — never from data flow, validation, or side effects.
5. **Merge classes safely.** Any concatenated or prop-passed class string goes through `cn()` (clsx + tailwind-merge) so styles never collide.

---

## Block C — The 5 Phases

### Phase 1: Foundation & Design Tokens
- **Goal:** Cleanse styling foundations, purge inline style dependencies, upgrade `cn()` to conflict-safe class merging, and map all CSS variables into first-class Tailwind theme utilities.
- **Target Components & Files:**
  - `src/lib/utils.ts`
  - `tailwind.config.js`
  - `src/index.css`
- **Specific Transformations:**
  1. *Conflict-Free Class Merging (`src/lib/utils.ts`):* Install and integrate `clsx` and `tailwind-merge` into `cn(...inputs)` so override classes (e.g. padding, colors, shadows) never collide. *(Sources: #17 tailwind-merge & clsx, #1 shadcn/ui)*
  2. *First-Class Tailwind Semantic Tokens (`tailwind.config.js`):* Extend Tailwind theme with semantic color tokens linked directly to CSS variables (`bg-app`, `bg-panel`, `bg-panel-soft`, `text-main`, `text-muted`, `text-faint`, `border-theme`, `border-ink`, `accent-amber`, `accent-teal`, `accent-danger`, `accent-success`). *(Sources: #15 Tailwind CSS, #14 Geist)*
  3. *Elevation & Dark Mode Depth Ramp (`src/index.css`):*
     - Elevate dark mode luminance ramps: `--bg: #0B0F14`, `--panel: #121820`, `--panel-soft: #19222E`, with crisp specular borders `--border: rgba(255, 255, 255, 0.08)` and `--border-ink: rgba(255, 255, 255, 0.12)`.
     - Replace muddy dark shadows with multi-layered specular elevation: `box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.5)`. *(Sources: #11 Refactoring UI, #12 Steve Schoger)*
  4. *Disciplined Type Scale (`src/index.css`):* Establish a systematic modular scale replacing random pixel sizes (`text-[10px]`, `text-[13px]`, `text-[15.5px]`) with standardized scale steps (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl`).
- **Sources Drawn From:** #11 Refactoring UI, #12 Steve Schoger, #14 Geist Design System, #15 Tailwind CSS, #17 tailwind-merge & clsx.
- **Definition of Done:** `cn()` uses `clsx` + `tailwind-merge`; Tailwind recognizes all semantic tokens without arbitrary class brackets; zero build or lint regression; CSS variables compile cleanly.

---

### Phase 2: Atomic Components & Primitives
- **Goal:** Standardize buttons, inputs, dropdowns, status chips, and toasts into resilient, accessible primitives with consistent focus rings, hover states, and variant definitions.
- **Target Components & Files:**
  - `src/pages/Studio.tsx` (Input elements, buttons, select menus, status chips)
  - `src/components/ui/Toast.tsx` (`ToastStack`)
  - `src/components/layout/SiteHeader.tsx` (Icon action buttons)
- **Specific Transformations:**
  1. *Form Controls & Inputs:* Refactor input and textarea controls to use semantic utility classes (`bg-panel-soft/60 border border-border-theme focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm rounded-lg transition-all duration-150`). *(Sources: #1 shadcn/ui, #18 Origin UI)*
  2. *Interactive Buttons:* Standardize primary and secondary button hierarchies with active press compression (`active:scale-[0.98]`), accessible focus-visible rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`), and disabled states (`disabled:opacity-50 disabled:cursor-not-allowed`). *(Sources: #6 Emil Kowalski, #13 Linear Method, #24 WAI-ARIA)*
  3. *Model & Prompt Selectors:* Upgrade standard `<select>` dropdowns into polished controls with custom chevron icons, crisp hover borders, and proper focus containment. *(Sources: #1 shadcn/ui)*
  4. *Studio Status Chips:* Transform the critique status indicator (`Listening`, `Reviewing...`, `Live`, `Error`) into a glowing status pill with an animated pulse dot and semantic color tokens (`accent-success`, `accent-amber`, `accent-danger`). *(Sources: #13 Linear Method, #18 Origin UI)*
  5. *Toast Notifications (`src/components/ui/Toast.tsx`):* Upgrade toast pills to Sonner-grade stacked feedback cards with subtle glassmorphism (`backdrop-blur-md`), layered border highlights, and status icons. *(Sources: #9 Sonner, #6 Emil Kowalski)*
- **Sources Drawn From:** #1 shadcn/ui, #6 Emil Kowalski, #9 Sonner, #13 Linear Method, #18 Origin UI, #24 WAI-ARIA.
- **Definition of Done:** All buttons, inputs, and selects share unified padding, borders, and focus rings; toasts stack with spring motion; all interactive elements pass keyboard focus tests.

---

### Phase 3: Layout & Domain Components (Bento Studio & BroadSheet)
- **Goal:** Overhaul the layout architecture of the Studio workspace and Landing page into an ergonomic Modern Bento grid, eliminate all remaining inline styles, and polish header and footer chrome.
- **Target Components & Files:**
  - `src/pages/Studio.tsx`
  - `src/pages/Landing.tsx`
  - `src/components/layout/SiteHeader.tsx`
  - `src/components/layout/SiteFooter.tsx`
- **Specific Transformations:**
  1. *Studio Bento Grid Workspace (`src/pages/Studio.tsx`):*
     - Replace rigid `lg:grid-cols-[300px_1fr_380px]` with an adaptive Bento workstation: `lg:grid-cols-[280px_minmax(0,1fr)_360px] xl:grid-cols-[300px_minmax(0,1fr)_400px]`.
     - Wrap each of the 3 panels (Settings, Editor, Live Critique) in unified Bento card shells with rounded corners (`rounded-xl`), subtle interior grain, and specular rim borders (`ring-1 ring-black/5 dark:ring-white/10`).
     - Elevate the Draft Editor writing surface with genuine paper texture feel, refined Newsreader typography, and an auto-expanding responsive canvas.
     - Transform the bottom metrics bar into a high-density Linear-style Telemetry HUD: monospaced tabular figures (`font-mono tabular-nums`), live typing indicator, and subtle auto-save status icon. *(Sources: #13 Linear Method, #14 Geist, #23 Bento Grids)*
  2. *Site Header Glassmorphism (`src/components/layout/SiteHeader.tsx`):*
     - Refine sticky header with dynamic glass backdrop (`backdrop-blur-xl bg-app/80`), hairline border gradient, theme-toggle icon rotation, and tooltips on clear-data and studio buttons. *(Sources: #4 Aceternity UI, #7 Rauno Freiberg)*
  3. *Landing Page Architecture (`src/pages/Landing.tsx`):*
     - Replace repetitive inline styles with semantic Tailwind tokens.
     - Convert the static studio wireframe diagram into an interactive, high-fidelity Bento blueprint with illuminated panel borders.
     - Upgrade section headers with crisp folio numbering (`Nº 01`), hairline accent dividers, and fluid responsive headline typography (`clamp()` scale). *(Sources: #11 Refactoring UI, #23 Bento Grids, #27 Josh W. Comeau)*
  4. *Site Footer (`src/components/layout/SiteFooter.tsx`):*
     - Align footer layout to 8pt spatial grid with subtle border-t gradient and clean typographic metadata. *(Sources: #11 Refactoring UI)*
- **Sources Drawn From:** #4 Aceternity UI, #7 Rauno Freiberg, #11 Refactoring UI, #13 Linear Method, #14 Geist Design System, #23 Bento Grids, #27 Josh W. Comeau.
- **Definition of Done:** Zero inline `style={{ ... }}` remaining in Studio or Landing layouts; Studio renders in responsive Bento grid; desktop panels scroll smoothly; header glass effect persists on scroll.

---

### Phase 4: Motion, Micro-Interactions & Feedback
- **Goal:** Introduce fluid spring animations, real-time loading skeletons, interactive typing transitions, and polish the critique margin.
- **Target Components & Files:**
  - `src/pages/Studio.tsx` (Critique streaming panel)
  - `src/components/ui/WritingDemo.tsx`
  - `src/components/ui/Reveal.tsx`
- **Specific Transformations:**
  1. *Real-Time Streaming Skeleton (`src/pages/Studio.tsx`):*
     - When `coachStatus === "Reviewing..."`, render a pulsing shimmer skeleton with multi-line markdown placeholders before the first SSE streaming chunk arrives.
     - Smoothly fade in incoming streaming tokens with zero layout shift (`CLS = 0`). *(Sources: #3 Motion, #6 Emil Kowalski, #26 Lee Robinson)*
  2. *Interactive Writing Demo Refinement (`src/components/ui/WritingDemo.tsx`):*
     - Add an Aceternity-style subtle animated border beam (`BorderBeam`) around the demo manuscript container.
     - Polish critique note insertions with Framer Motion spring physics (`type: "spring", stiffness: 350, damping: 25`).
     - Refactor demo status badge with ambient pulsing aura. *(Sources: #3 Motion, #4 Aceternity UI, #6 Emil Kowalski)*
  3. *Scroll Reveals & Micro-Delight (`src/components/ui/Reveal.tsx`):*
     - Polish scroll reveals with subtle ease curves (`ease: [0.25, 0.4, 0.25, 1]`) and viewport caching so elements do not re-trigger jarringly. *(Sources: #3 Motion, #5 Magic UI)*
- **Sources Drawn From:** #3 Motion (Framer Motion), #4 Aceternity UI, #5 Magic UI, #6 Emil Kowalski, #26 Lee Robinson.
- **Definition of Done:** Reviewing state displays animated skeleton; demo features smooth spring note entries; no visual jitter or layout thrashing during streaming.

---

### Phase 5: Responsive Parity, Accessibility & Verification
- **Goal:** Resolve mobile and tablet ergonomics, guarantee WCAG 2.1 AA accessibility compliance, and execute the final zero-regression verification suite.
- **Target Components & Files:**
  - `src/pages/Studio.tsx`
  - `src/components/layout/SiteHeader.tsx`
  - `src/components/ui/Toast.tsx`
  - Full codebase
- **Specific Transformations:**
  1. *Tablet Breakpoint Optimization (768px – 1023px):*
     - Eliminate the tablet dead-zone: on screens $\ge 768px$, display the Draft Editor and Live Critique side-by-side with a collapsible slide-over settings panel, removing the need to switch tabs constantly. *(Sources: #13 Linear Method, #15 Tailwind CSS)*
  2. *Mobile Ergonomics & Bottom Sheet:*
     - On mobile screens ($< 768px$), upgrade the cramped settings drawer into an accessible slide-up bottom sheet with swipe-down dismiss and backdrop blur (Vaul drawer pattern).
     - Ensure all interactive touch targets meet the $\ge 44 \times 44\text{px}$ minimum requirement with `touch-manipulation`. *(Sources: #10 Vaul, #24 WAI-ARIA)*
  3. *Accessibility & Contrast Audit:*
     - Implement visible keyboard focus rings across all icon buttons and action triggers (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
     - Add `aria-live="polite"` to the live critique and word count regions so assistive technology stays synchronized.
     - Add `aria-busy="true"` and loading spinners to model refresh and connection test triggers. *(Sources: #2 Radix Primitives, #24 WAI-ARIA)*
  4. *Zero-Regression Verification:*
     - Run `npm run build` (`tsc -b && vite build`) and `npm run lint` (`oxlint`).
     - Test complete user journey: API key configuration, Model refresh, Prompt saving, Draft typing, Debounced auto-save (600ms), Live critique streaming (1500ms debounce), AbortController cancel on typing, and Theme toggle.
- **Sources Drawn From:** #2 Radix Primitives, #10 Vaul, #13 Linear Method, #15 Tailwind CSS, #24 WAI-ARIA.
- **Definition of Done:** Tablet displays side-by-side workspace; mobile settings uses smooth bottom sheet; all touch targets $\ge 44\text{px}$; 100% WCAG focus-visible compliance; clean production build with zero functional regressions.
