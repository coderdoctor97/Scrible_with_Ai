import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WritingDemo } from "../components/ui/WritingDemo";
import { Reveal, SectionHead } from "../components/ui/Reveal";

const USE_CASES = [
  "Essay prompts",
  "Cover letters",
  "Short fiction",
  "Research notes",
  "Product copy",
  "Journaling",
  "Interview prep",
  "Thesis drafts",
];

const LOOP = [
  {
    n: "01",
    title: "You type",
    desc: "The draft is a plain writing surface. Word count, read time and auto-save run quietly underneath.",
  },
  {
    n: "02",
    title: "You pause",
    desc: "One and a half seconds of stillness. That pause is the entire trigger — no buttons, no tab-switching.",
  },
  {
    n: "03",
    title: "The coach reads",
    desc: "Your prompt and draft go straight to the model you configured. Nothing passes through a server of ours.",
  },
  {
    n: "04",
    title: "Marks stream in",
    desc: "A scorecard, strengths, next steps, and one concrete rewrite — streamed word by word into the margin.",
  },
];

const MARKUP_NOTES = [
  { tag: "Scorecard", text: "Clarity 7/10 · Relevance 8/10 · Style 6/10", accent: false },
  { tag: "Strength", text: "A quiet, concrete scene. Nothing abstract, nothing padded.", accent: false },
  { tag: "Next step", text: "Give the birds one specific habit — one is worth ten details.", accent: false },
  { tag: "Suggestion", text: "“very slowly” → “as if the square belonged to him.”", accent: true },
];

const FOOTNOTES = [
  { n: "01", t: "No server", d: "The browser talks straight to the API you configure. There is no middleman to trust." },
  { n: "02", t: "Keys stay local", d: "Settings, prompts and drafts live in localStorage. Clear data wipes everything, for real." },
  { n: "03", t: "MIT licensed", d: "Fork it, self-host it, rewrite the coach's prompt to grade differently." },
];

export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-app transition-colors">
      {/* ============ MASTHEAD ============ */}
      <section className="grain relative bg-app">
        {/* Metadata strip */}
        <div className="border-b border-border-ink">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 md:px-6">
            <span className="mono-label">Open source · MIT</span>
            <span className="mono-label hidden sm:inline">Runs entirely in your browser</span>
            <span className="mono-label hidden md:inline">No accounts · No server</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 md:px-6 md:pb-20 md:pt-14 lg:grid-cols-[2.5rem_1fr_minmax(0,540px)] lg:gap-8">
          {/* Marginalia */}
          <div className="hidden lg:flex justify-center">
            <span className="marginalia-v mt-2">Fig. A — a live session, looping</span>
          </div>

          {/* Headline block */}
          <div>
            <Reveal>
              <h1 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl md:text-6xl lg:text-[68px] text-main">
                Writing that
                <br />
                <span className="font-serif italic font-medium text-accent-ink tracking-tight">
                  improves
                </span>{" "}
                while
                <br />
                you type.
                <span className="caret-block ml-3 !h-[0.78em] align-baseline" aria-hidden="true" />
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[50ch] text-base leading-relaxed md:text-lg text-muted">
                ScribeAI is a live writing coach. Paste a prompt, start drafting, and critique
                streams into the margin the moment you pause. The draft below is a real session,
                replayed.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/app"
                  className="group inline-flex h-12 items-center rounded-xl bg-main px-6 text-sm font-semibold text-app shadow-sm transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span>Open the Studio</span>
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block text-primary transition-transform duration-200 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
                <a
                  href="#loop"
                  className="text-sm font-semibold text-main underline decoration-border-ink underline-offset-[6px] transition-colors hover:decoration-primary focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  How the loop works
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10 hidden items-baseline gap-4 sm:flex">
                <span className="mono-label text-faint">
                  Bring your own model
                </span>
                <span className="hairline mb-1 flex-1 bg-border-ink" />
                <span className="mono-label text-faint">
                  OpenAI · Ollama · LM Studio
                </span>
              </div>
            </Reveal>
          </div>

          {/* Live demo */}
          <Reveal delay={0.15} y={20} className="lg:pt-2">
            <WritingDemo />
          </Reveal>
        </div>

        {/* Use-case strip */}
        <div className="border-y border-border-ink">
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3.5 md:px-6">
            <span className="mono-label mr-2 text-accent-ink">
              Start with anything
            </span>
            {USE_CASES.map((u, i) => (
              <span
                key={u}
                className={`flex items-baseline gap-3 ${i >= USE_CASES.length - 2 ? "hidden 2xl:flex" : ""}`}
              >
                {i > 0 && <span aria-hidden="true" className="text-[10px] text-faint">·</span>}
                <span className="mono-label">{u}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Nº 01 — THE LOOP ============ */}
      <section id="loop" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
        <SectionHead
          no="01"
          title={
            <>
              No analyze button.
              <br />
              A pause is the whole interface.
            </>
          }
          standfirst="ScribeAI listens while you write. Stop for a beat and the coach starts reading; start again and the stream cancels mid-sentence. Momentum is the design."
        />

        <div className="relative mt-14">
          {/* The rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: [0.25, 0.4, 0.25, 1] }}
            className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-primary md:block"
          />
          <div className="absolute left-[7px] top-0 h-full w-px bg-primary md:hidden" />

          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {LOOP.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="flex gap-5 md:block">
                  <span
                    className="mt-1 inline-block h-[15px] w-[15px] shrink-0 rounded-full border-2 border-primary bg-app"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="mono-label text-faint">{s.n}</div>
                    <h3 className="font-display mt-1.5 text-lg font-bold tracking-tight text-main md:mt-2">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <p className="mono-label mt-12 text-faint">
            Footnote — feedback starts at eight words; typing again aborts the stream instantly
          </p>
        </Reveal>
      </section>

      {/* ============ Nº 02 — THE MARK-UP ============ */}
      <section id="markup" className="border-y border-border-ink bg-panel-soft/60 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <SectionHead
            no="02"
            title={
              <>
                Feedback like an editor,
                <br />
                not a chatbot.
              </>
            }
            standfirst="Every critique arrives in the same four marks — a scorecard, what works, what to do next, and one concrete rewrite you can steal. Here is how that looks in practice."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.25fr_1fr]">
            {/* Manuscript preview */}
            <Reveal>
              <div className="bento-card relative rounded-xl border border-border-ink bg-panel p-6 shadow-subtle md:p-8">
                <div className="flex items-center justify-between">
                  <span className="mono-label text-faint">
                    Prompt — “Describe an old man in a square.”
                  </span>
                  <span className="mono-label hidden text-faint sm:inline">Draft · 31 words</span>
                </div>
                <p className="font-serif mt-6 text-lg leading-[1.85] text-main md:text-xl">
                  The old man walked <span className="mk-strike">very slowly</span>{" "}
                  <span className="mk-ins">as if the square belonged to him</span> across the
                  morning square, stopping to feed the pigeons that gathered at his feet like a
                  debt he was happy to pay.
                </p>
                <div className="mt-8 flex items-baseline gap-3">
                  <span className="mk-note">Editor's pencil</span>
                  <span className="hairline mb-1 flex-1 bg-border-ink" />
                  <span className="mono-label text-faint">1 of 4 marks shown</span>
                </div>
              </div>
            </Reveal>

            {/* Margin notes */}
            <Reveal delay={0.12}>
              <div className="flex h-full flex-col justify-center gap-5 lg:pl-2">
                {MARKUP_NOTES.map((n) => (
                  <div
                    key={n.tag}
                    className={`border-l-2 pl-4 rounded-r-lg bg-panel/40 p-3 ${
                      n.accent ? "border-primary" : "border-border-ink"
                    }`}
                  >
                    <div className="mk-note" style={n.accent ? undefined : { color: "var(--text-faint)" }}>
                      {n.tag}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-main">
                      {n.text}
                    </p>
                  </div>
                ))}
                <p className="mono-label text-faint lg:pl-4">
                  Streaming live while you keep writing
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ Nº 03 — THE STUDIO BENTO ============ */}
      <section id="studio" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
        <SectionHead
          no="03"
          title="One room. Three panes. Zero ceremony."
          standfirst="Settings, draft and critique sit side by side. They scroll independently and remember everything — reload and your session is exactly where you left it."
        />

        <Reveal delay={0.1}>
          <div className="graph-paper relative mt-14 rounded-2xl border border-border-ink bg-panel p-4 shadow-elevated md:p-8">
            <div className="grid gap-3.5 md:grid-cols-[240px_1fr_300px]">
              {/* 01 settings */}
              <div className="flex flex-col rounded-xl border border-border-ink bg-app shadow-sm">
                <div className="border-b border-border-ink px-3 py-2.5 bg-panel-soft/60">
                  <span className="mono-label text-faint">01 · Settings — 300px</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                  {[86, 100, 72].map((w, i) => (
                    <div
                      key={i}
                      className="h-6 rounded-md border border-border bg-panel-soft"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                  <div className="mt-1 h-7 w-[62%] rounded-md bg-main" />
                </div>
              </div>
              {/* 02 draft */}
              <div className="flex flex-col rounded-xl border border-border-ink bg-app shadow-sm">
                <div className="border-b border-border-ink px-3 py-2.5 bg-panel-soft/60">
                  <span className="mono-label text-faint">02 · Draft — fluid canvas</span>
                </div>
                <div className="flex-1 p-4">
                  <p className="font-serif text-sm leading-[1.85] text-muted">
                    The review is due Friday, and yet the memo keeps circling the same three
                    sentences…
                    <span className="caret-block ml-0.5" aria-hidden="true" />
                  </p>
                </div>
                <div className="flex justify-between border-t border-border-ink px-3 py-2 bg-panel-soft/60 font-mono text-xs">
                  <span className="mono-label text-faint">Words · chars · read</span>
                  <span className="mono-label text-success">Up to date</span>
                </div>
              </div>
              {/* 03 critique */}
              <div className="flex flex-col rounded-xl border border-border-ink bg-app shadow-sm">
                <div className="border-b border-border-ink px-3 py-2.5 bg-panel-soft/60">
                  <span className="mono-label text-accent-ink">03 · Live critique — 380px</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                  {["Scorecard", "Strengths", "Next steps", "Suggestion"].map((t) => (
                    <div key={t} className="border-l-2 border-primary pl-2.5 py-0.5">
                      <span className="mk-note">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Dimension ticks */}
            <div className="mt-3.5 hidden items-center justify-between font-mono text-xs md:flex">
              <span className="mono-label text-faint">├─ 300px ─┤</span>
              <span className="mono-label text-faint">├──── fluid canvas ────┤</span>
              <span className="mono-label text-faint">├─ 380px ─┤</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/app"
              className="group inline-flex h-11 items-center rounded-xl bg-main px-5 text-sm font-semibold text-app shadow-sm transition-all hover:bg-primary-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Open the Studio</span>
              <span aria-hidden="true" className="ml-2 text-primary transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <span className="mono-label text-faint">
              Import .txt / .md · saved prompt library · light & dark
            </span>
          </div>
        </Reveal>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section className="border-t border-border-ink bg-panel-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <p className="font-serif italic font-medium max-w-[22ch] text-3xl leading-[1.15] tracking-tight sm:max-w-[28ch] md:text-4xl lg:text-5xl text-main">
              Your words never leave{" "}
              <span className="text-accent-ink">your machine.</span>
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {FOOTNOTES.map((f, i) => (
              <Reveal key={f.n} delay={i * 0.08}>
                <div className="border-t border-border-ink pt-4">
                  <span className="mono-label text-faint">{f.n}</span>
                  <h3 className="mt-2 text-base font-bold text-main">{f.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INK CTA ============ */}
      <section className="bg-main text-app">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-20">
          <Reveal>
            <p className="mono-label text-faint">
              Ready when you are
            </p>
            <h2 className="font-display mt-3 max-w-[20ch] text-3xl font-extrabold leading-[1.02] tracking-tight md:text-4xl lg:text-5xl text-app">
              Start writing. Get feedback before you overthink.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              to="/app"
              className="group inline-flex h-13 shrink-0 items-center gap-2 rounded-xl bg-app px-7 py-4 text-base font-bold text-main shadow-lg transition-all hover:bg-primary hover:text-white active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span>Open the Studio</span>
              <span aria-hidden="true" className="text-primary group-hover:text-white transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
