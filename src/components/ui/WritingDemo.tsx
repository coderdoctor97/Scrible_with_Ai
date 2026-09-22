import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { BorderBeam } from "../magicui/BorderBeam";

type Note = { tag: string; text: string };
type Scene = { prompt: string; draft: string; notes: Note[] };

const SCENES: Scene[] = [
  {
    prompt: "Describe a city street after rain.",
    draft:
      "The city exhaled after the rain, and every neon sign trembled in the puddles like something nervous. Mira counted the streets by the color of their light.",
    notes: [
      { tag: "Scorecard", text: "Clarity 8/10 · Relevance 9/10 · Style 7/10" },
      { tag: "Strength", text: "The first image lands — a city that breathes." },
      { tag: "Suggestion", text: "“trembled” → “shivered.” A colder verb for colder light." },
    ],
  },
  {
    prompt: "Why this role, in your own words.",
    draft:
      "I am writing to express my interest in the junior designer role. I believe I would be a great fit because I am passionate about design and a hard worker.",
    notes: [
      { tag: "Scorecard", text: "Clarity 6/10 · Relevance 5/10 · Style 3/10" },
      { tag: "Next step", text: "Cut the boilerplate. Open with one shipped project." },
      { tag: "Suggestion", text: "“passionate about design” → name what you designed, and for whom." },
    ],
  },
];

type Status = "Listening" | "Typing" | "Reviewing" | "Live";

const STATUS_META: Record<
  Status,
  { dot: string; label: string; chipCls: string; pulse?: boolean }
> = {
  Listening: {
    dot: "bg-faint",
    label: "Listening",
    chipCls: "border-border text-faint bg-panel",
  },
  Typing: {
    dot: "bg-primary",
    label: "Typing…",
    chipCls: "border-primary/30 text-primary bg-primary/10",
  },
  Reviewing: {
    dot: "bg-primary animate-ping",
    label: "Reviewing…",
    chipCls: "border-primary/40 text-primary bg-primary/10 animate-pulse",
    pulse: true,
  },
  Live: {
    dot: "bg-success",
    label: "Live",
    chipCls: "border-success/30 text-success bg-success/10",
  },
};

export function WritingDemo() {
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [sceneIndex, setSceneIndex] = useState(0);
  const [text, setText] = useState(() => (reduced ? SCENES[0].draft : ""));
  const [notesShown, setNotesShown] = useState(() =>
    reduced ? SCENES[0].notes.length : 0
  );
  const [status, setStatus] = useState<Status>(() =>
    reduced ? "Live" : "Listening"
  );

  const scene = SCENES[sceneIndex % SCENES.length];
  const words = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0),
    [text]
  );

  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) =>
      timers.push(window.setTimeout(fn, ms));

    const runScene = (i: number) => {
      const s = SCENES[i % SCENES.length];
      setSceneIndex(i % SCENES.length);
      setText("");
      setNotesShown(0);
      setStatus("Listening");
      const speed = 22;
      let t = 600;
      later(() => setStatus("Typing"), t);
      for (let c = 1; c <= s.draft.length; c++) {
        const snap = c;
        later(() => setText(s.draft.slice(0, snap)), t + c * speed);
      }
      t += s.draft.length * speed + 550;
      later(() => setStatus("Reviewing"), t);
      s.notes.forEach((_, n) => {
        later(() => {
          setNotesShown(n + 1);
          if (n === 0) setStatus("Live");
        }, t + 480 + n * 420);
      });
      t += 480 + s.notes.length * 420 + 3000;
      later(() => runScene(i + 1), t);
    };

    runScene(0);
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reduced]);

  const meta = STATUS_META[status];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-ink bg-panel shadow-elevated">
      <BorderBeam size={220} duration={12} colorFrom="#FF6B35" colorTo="#0D9488" />

      {/* Sheet header */}
      <div className="flex items-center justify-between border-b border-border-ink bg-panel-soft/80 px-4 py-3 md:px-5">
        <span className="mono-label text-faint">
          Draft Session · Interactive Replay
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200",
            meta.chipCls
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          <span className="mono-label !tracking-wider text-[10px]">
            {meta.label}
          </span>
        </span>
      </div>

      <div className="grid md:grid-cols-[1.35fr_1fr]">
        {/* Manuscript */}
        <div className="border-b border-border-ink px-5 py-6 md:border-b-0 md:border-r md:px-6">
          <p className="mono-label mb-3 text-faint">
            Prompt — “{scene.prompt}”
          </p>
          <p className="min-h-[9.5rem] font-serif text-[16px] leading-[1.78] text-main md:min-h-[10.5rem] md:text-[17px]">
            {text}
            {(status === "Typing" || status === "Listening") && (
              <span className="caret-block ml-0.5" aria-hidden="true" />
            )}
          </p>
          <div className="mt-4 flex items-center justify-between font-mono text-xs tabular-nums text-faint">
            <span className="mono-label">{words} words</span>
            <span className="mono-label">Auto-saved</span>
          </div>
        </div>

        {/* Margin notes */}
        <div className="bg-panel-soft/40 px-5 py-6">
          <p className="mono-label mb-3 text-accent-ink">
            Coach — marks in the margin
          </p>
          <div className="flex min-h-[9.5rem] flex-col gap-3 md:min-h-[10.5rem]">
            <AnimatePresence mode="popLayout">
              {scene.notes.slice(0, notesShown).map((n) => (
                <motion.div
                  key={`${sceneIndex}-${n.tag}`}
                  initial={{ opacity: 0, x: 12, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="rounded-r-lg border-l-2 border-primary bg-panel/60 p-2.5 shadow-sm"
                >
                  <div className="mk-note">{n.tag}</div>
                  <div className="mt-1 text-xs leading-relaxed text-main">
                    {n.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {notesShown === 0 && (
              <p className="text-xs leading-relaxed text-faint">
                {status === "Reviewing"
                  ? "Evaluating draft rhythm…"
                  : "Critique streams here the moment you pause."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sheet footer */}
      <div className="flex items-center justify-between border-t border-border-ink bg-panel-soft/80 px-4 py-2.5 md:px-5">
        <span className="mono-label text-faint">
          1.5 s pause · 8-word minimum
        </span>
        <span className="mono-label text-faint">
          Streaming Markdown
        </span>
      </div>
    </div>
  );
}
