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
    <div className="overflow-x-hidden" style={{ background: "var(--bg)" }}>
      {/* ============ MASTHEAD ============ */}
      <section className="grain relative" style={{ background: "var(--bg)" }}>
        {/* metadata strip */}
        <div className="border-b" style={{ borderColor: "var(--border-ink)" }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 md:px-6">
            <span className="mono-label">Open source · MIT</span>
            <span className="mono-label hidden sm:inline">Runs entirely in your browser</span>
            <span className="mono-label hidden md:inline">No accounts · No server</span>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 md:px-6 md:pb-20 md:pt-14 lg:grid-cols-[2.5rem_1fr_minmax(0,540px)] lg:gap-8">
          {/* marginalia */}
          <div className="hidden lg:flex justify-center">
            <span className="marginalia-v mt-2">Fig. A — a live session, looping</span>
          </div>

          {/* headline block */}
          <div>
            <Reveal>
              <h1
                className="text-[44px] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-[56px] md:text-[68px]"
                style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--text)" }}
              >
                Writing that
                <br />
                <span
                  style={{ fontFamily: '"Newsreader", serif', fontStyle: "italic", fontWeight: 500, color: "var(--accent-ink)", letterSpacing: "-0.01em" }}
                >
                  improves
                </span>{" "}
                while
                <br />
                you type.
                <span className="caret-block ml-3 !h-[0.78em] align-baseline" aria-hidden="true" />
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-[50ch] text-[16px] leading-relaxed md:text-[17.5px]" style={{ color: "var(--text-muted)" }}>
                ScribeAI is a live writing coach. Paste a prompt, start drafting, and critique
                streams into the margin the moment you pause. The draft below is a real session,
                replayed.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  to="/app"
                  className="group inline-flex h-12 items-center rounded-lg px-6 text-[14.5px] font-semibold transition-colors duration-200 hover:bg-[var(--primary-hover)]"
                  style={{ background: "var(--text)", color: "var(--bg)" }}
                >
                  Open the Studio
                  <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1" style={{ color: "var(--primary)" }}>
                    →
                  </span>
                </Link>
                <a
                  href="#loop"
                  className="text-[14px] font-semibold underline decoration-[var(--border-ink)] underline-offset-[6px] transition-colors hover:decoration-[var(--primary)]"
                  style={{ color: "var(--text)" }}
                >
                  How the loop works
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-10 hidden items-baseline gap-4 sm:flex">
                <span className="mono-label" style={{ color: "var(--text-faint)" }}>
                  Bring your own model
                </span>
                <span className="hairline mb-1 flex-1" style={{ background: "var(--border-ink)" }} />
                <span className="mono-label" style={{ color: "var(--text-faint)" }}>
                  OpenAI · Ollama · LM Studio
                </span>
              </div>
            </Reveal>
          </div>

          {/* live demo */}
          <Reveal delay={0.15} y={20} className="lg:pt-2">
            <WritingDemo />
          </Reveal>
        </div>

        {/* use-case strip */}
        <div className="border-y" style={{ borderColor: "var(--border-ink)" }}>
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3.5 md:px-6">
            <span className="mono-label mr-2" style={{ color: "var(--accent-ink)" }}>
              Start with anything
            </span>
            {USE_CASES.map((u, i) => (
              <span
                key={u}
                className={`flex items-baseline gap-3 ${i >= USE_CASES.length - 2 ? "hidden 2xl:flex" : ""}`}
              >
                {i > 0 && <span aria-hidden="true" className="text-[10px]" style={{ color: "var(--text-faint)" }}>·</span>}
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
          {/* the rule */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: [0.25, 0.4, 0.25, 1] }}
            className="absolute left-0 right-0 top-[7px] hidden h-px origin-left md:block"
            style={{ background: "var(--primary)" }}
          />
          <div className="absolute left-[7px] top-0 h-full w-px md:hidden" style={{ background: "var(--primary)" }} />

          <div className="grid gap-10 md:grid-cols-4 md:gap-6">
            {LOOP.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="flex gap-5 md:block">
                  <span className="mt-1 inline-block h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-[var(--bg)]" style={{ borderColor: "var(--primary)" }} aria-hidden="true" />
                  <div>
                    <div className="mono-label" style={{ color: "var(--text-faint)" }}>{s.n}</div>
                    <h3
                      className="mt-1.5 text-[19px] font-bold tracking-[-0.01em] md:mt-2"
                      style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--text)" }}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.15}>
          <p className="mono-label mt-12" style={{ color: "var(--text-faint)" }}>
            Footnote — feedback starts at eight words; typing again aborts the stream instantly
          </p>
        </Reveal>
      </section>

      {/* ============ Nº 02 — THE MARK-UP ============ */}
      <section id="markup" className="border-y scroll-mt-20" style={{ borderColor: "var(--border-ink)", background: "var(--panel-soft)" }}>
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
            standfirst="Every critique arrives in the same four marks — a scorecard, what works, what to do next, and one concrete rewrite you can steal. Here is a real pass, on paper."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
            {/* manuscript */}
            <Reveal>
              <div className="relative border bg-[var(--panel)] p-6 md:p-9" style={{ borderColor: "var(--border-ink)", boxShadow: "var(--shadow)" }}>
                <div className="flex items-center justify-between">
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>
                    Prompt — “Describe an old man in a square.”
                  </span>
                  <span className="mono-label hidden sm:inline" style={{ color: "var(--text-faint)" }}>Draft · 31 words</span>
                </div>
                <p
                  className="mt-6 text-[18px] leading-[1.85] md:text-[20px]"
                  style={{ fontFamily: '"Newsreader", Georgia, serif', color: "var(--text)" }}
                >
                  The old man walked <span className="mk-strike">very slowly</span>{" "}
                  <span className="mk-ins">as if the square belonged to him</span> across the
                  morning square, stopping to feed the pigeons that gathered at his feet like a
                  debt he was happy to pay.
                </p>
                <div className="mt-8 flex items-baseline gap-3">
                  <span className="mk-note">Editor's pencil</span>
                  <span className="hairline mb-1 flex-1" style={{ background: "var(--border-ink)" }} />
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>1 of 4 marks shown</span>
                </div>
              </div>
            </Reveal>

            {/* margin notes */}
            <Reveal delay={0.12}>
              <div className="flex h-full flex-col justify-center gap-6 lg:pl-2">
                {MARKUP_NOTES.map((n) => (
                  <div
                    key={n.tag}
                    className={n.accent ? "border-l-2 pl-4" : "border-l pl-4"}
                    style={{ borderColor: n.accent ? "var(--primary)" : "var(--border-ink)" }}
                  >
                    <div className="mk-note" style={n.accent ? undefined : { color: "var(--text-faint)" }}>{n.tag}</div>
                    <p className="mt-1 text-[14px] leading-relaxed" style={{ color: "var(--text)" }}>
                      {n.text}
                    </p>
                  </div>
                ))}
                <p className="mono-label lg:pl-5" style={{ color: "var(--text-faint)" }}>
                  Streaming live while you keep writing
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ Nº 03 — THE STUDIO ============ */}
      <section id="studio" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:px-6 md:py-24">
        <SectionHead
          no="03"
          title="One room. Three panes. Zero ceremony."
          standfirst="Settings, draft and critique sit side by side. They scroll independently and remember everything — reload and your session is exactly where you left it."
        />

        <Reveal delay={0.1}>
          <div className="graph-paper relative mt-14 rounded-lg border p-4 md:p-8" style={{ borderColor: "var(--border-ink)", background: "var(--panel)" }}>
            <div className="grid gap-3 md:grid-cols-[240px_1fr_300px]">
              {/* 01 settings */}
              <div className="flex flex-col rounded-md border bg-[var(--bg)]" style={{ borderColor: "var(--border-ink)" }}>
                <div className="border-b px-3 py-2" style={{ borderColor: "var(--border-ink)" }}>
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>01 · Settings — 300px</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-3">
                  {[86, 100, 72].map((w, i) => (
                    <div key={i} className="h-6 rounded-[3px] border" style={{ width: `${w}%`, borderColor: "var(--border)", background: "var(--panel-soft)" }} />
                  ))}
                  <div className="mt-1 h-7 w-[62%] rounded-[3px]" style={{ background: "var(--text)" }} />
                </div>
              </div>
              {/* 02 draft */}
              <div className="flex flex-col rounded-md border bg-[var(--bg)]" style={{ borderColor: "var(--border-ink)" }}>
                <div className="border-b px-3 py-2" style={{ borderColor: "var(--border-ink)" }}>
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>02 · Draft — fluid</span>
                </div>
                <div className="flex-1 p-4">
                  <p className="text-[14px] leading-[1.9]" style={{ fontFamily: '"Newsreader", Georgia, serif', color: "var(--text-muted)" }}>
                    The review is due Friday, and yet the memo keeps circling the same three
                    sentences…
                    <span className="caret-block ml-0.5" aria-hidden="true" />
                  </p>
                </div>
                <div className="flex justify-between border-t px-3 py-2" style={{ borderColor: "var(--border-ink)" }}>
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>Words · chars · read time</span>
                  <span className="mono-label" style={{ color: "var(--success)" }}>Up to date</span>
                </div>
              </div>
              {/* 03 critique */}
              <div className="flex flex-col rounded-md border bg-[var(--bg)]" style={{ borderColor: "var(--border-ink)" }}>
                <div className="border-b px-3 py-2" style={{ borderColor: "var(--border-ink)" }}>
                  <span className="mono-label" style={{ color: "var(--accent-ink)" }}>03 · Live critique — 380px</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-3">
                  {["Scorecard", "Strengths", "Next steps", "Suggestion"].map((t) => (
                    <div key={t} className="border-l-2 pl-2.5" style={{ borderColor: "var(--primary)" }}>
                      <span className="mk-note">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* dimension ticks */}
            <div className="mt-3 hidden items-center justify-between md:flex">
              <span className="mono-label" style={{ color: "var(--text-faint)" }}>├─ 300px ─┤</span>
              <span className="mono-label" style={{ color: "var(--text-faint)" }}>├──── fluid ────┤</span>
              <span className="mono-label" style={{ color: "var(--text-faint)" }}>├─ 380px ─┤</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to="/app"
              className="group inline-flex h-11 items-center rounded-lg px-5 text-[14px] font-semibold transition-colors hover:bg-[var(--primary-hover)]"
              style={{ background: "var(--text)", color: "var(--bg)" }}
            >
              Open the Studio
              <span aria-hidden="true" className="ml-2 transition-transform duration-200 group-hover:translate-x-1" style={{ color: "var(--primary)" }}>→</span>
            </Link>
            <span className="mono-label" style={{ color: "var(--text-faint)" }}>
              Import .txt / .md · saved prompt library · light & dark
            </span>
          </div>
        </Reveal>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section className="border-t" style={{ borderColor: "var(--border-ink)", background: "var(--panel-soft)" }}>
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <Reveal>
            <p
              className="max-w-[22ch] text-[34px] leading-[1.15] tracking-[-0.01em] sm:max-w-[28ch] md:text-[46px]"
              style={{ fontFamily: '"Newsreader", serif', fontStyle: "italic", fontWeight: 500, color: "var(--text)" }}
            >
              Your words never leave{" "}
              <span style={{ color: "var(--accent-ink)" }}>your machine.</span>
            </p>
          </Reveal>

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {FOOTNOTES.map((f, i) => (
              <Reveal key={f.n} delay={i * 0.08}>
                <div className="border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
                  <span className="mono-label" style={{ color: "var(--text-faint)" }}>{f.n}</span>
                  <h3 className="mt-2 text-[15px] font-bold" style={{ color: "var(--text)" }}>{f.t}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INK CTA ============ */}
      <section style={{ background: "var(--text)" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-end md:justify-between md:px-6 md:py-20">
          <Reveal>
            <p className="mono-label" style={{ color: "var(--text-faint)" }}>
              Ready when you are
            </p>
            <h2
              className="mt-3 max-w-[20ch] text-[34px] font-extrabold leading-[1.02] tracking-[-0.025em] md:text-[48px]"
              style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--bg)" }}
            >
              Start writing. Get feedback before you overthink.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <Link
              to="/app"
              className="group inline-flex h-13 shrink-0 items-center gap-2 rounded-lg px-7 py-4 text-[15px] font-bold transition-colors hover:bg-[var(--primary)]"
              style={{ background: "var(--bg)", color: "var(--text)" }}
            >
              Open the Studio
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" style={{ color: "var(--primary)" }}>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
