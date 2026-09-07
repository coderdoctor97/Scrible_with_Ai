import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

const STATUS_META: Record<Status, { dot: string; label: string; pulse?: boolean }> = {
  Listening: { dot: "var(--text-faint)", label: "Listening" },
  Typing: { dot: "var(--primary)", label: "Typing…" },
  Reviewing: { dot: "var(--primary)", label: "Reviewing…", pulse: true },
  Live: { dot: "var(--success)", label: "Live" },
};

export function WritingDemo() {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [sceneIndex, setSceneIndex] = useState(0);
  const [text, setText] = useState(() => (reduced ? SCENES[0].draft : ""));
  const [notesShown, setNotesShown] = useState(() => (reduced ? SCENES[0].notes.length : 0));
  const [status, setStatus] = useState<Status>(() => (reduced ? "Live" : "Listening"));

  const scene = SCENES[sceneIndex % SCENES.length];
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0), [text]);

  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = STATUS_META[status];

  return (
    <div
      className="relative overflow-hidden rounded-lg border bg-[var(--panel)]"
      style={{ borderColor: "var(--border-ink)", boxShadow: "var(--shadow-lg)" }}
    >
      {/* sheet header */}
      <div
        className="flex items-center justify-between border-b px-4 py-2.5 md:px-5"
        style={{ borderColor: "var(--border-ink)", background: "var(--panel-soft)" }}
      >
        <span className="mono-label" style={{ color: "var(--text-faint)" }}>
          Draft — live session
        </span>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 ${meta.pulse ? "animate-pulse" : ""}`}
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.dot }} />
          <span className="mono-label !tracking-[0.1em]" style={{ color: status === "Live" ? "var(--success)" : status === "Listening" ? "var(--text-faint)" : "var(--accent-ink)" }}>
            {meta.label}
          </span>
        </span>
      </div>

      <div className="grid md:grid-cols-[1.35fr_1fr]">
        {/* manuscript */}
        <div className="border-b px-4 py-5 md:border-b-0 md:border-r md:px-6 md:py-6" style={{ borderColor: "var(--border-ink)" }}>
          <p className="mono-label mb-3" style={{ color: "var(--text-faint)" }}>
            Prompt — “{scene.prompt}”
          </p>
          <p
            className="min-h-[9.5rem] text-[15.5px] leading-[1.75] md:min-h-[10.5rem] md:text-[16.5px]"
            style={{ fontFamily: '"Newsreader", Georgia, serif', color: "var(--text)" }}
          >
            {text}
            {(status === "Typing" || status === "Listening") && <span className="caret-block ml-0.5" aria-hidden="true" />}
          </p>
          <div className="mt-4 flex items-center justify-between" style={{ color: "var(--text-faint)" }}>
            <span className="mono-label">{words} words</span>
            <span className="mono-label">Auto-saved</span>
          </div>
        </div>

        {/* margin notes */}
        <div className="px-4 py-5 md:px-5 md:py-6">
          <p className="mono-label mb-3" style={{ color: "var(--accent-ink)" }}>
            Coach — marks in the margin
          </p>
          <div className="flex min-h-[9.5rem] flex-col gap-2.5 md:min-h-[10.5rem]">
            <AnimatePresence mode="popLayout">
              {scene.notes.slice(0, notesShown).map((n) => (
                <motion.div
                  key={`${sceneIndex}-${n.tag}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                  className="border-l-2 pl-3"
                  style={{ borderColor: "var(--primary)" }}
                >
                  <div className="mk-note">{n.tag}</div>
                  <div className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "var(--text)" }}>
                    {n.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {notesShown === 0 && (
              <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
                {status === "Reviewing" ? "Reading your draft…" : "Marks appear here the moment you pause."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* sheet footer */}
      <div
        className="flex items-center justify-between border-t px-4 py-2 md:px-5"
        style={{ borderColor: "var(--border-ink)", background: "var(--panel-soft)" }}
      >
        <span className="mono-label" style={{ color: "var(--text-faint)" }}>
          1.5 s pause · 8-word minimum
        </span>
        <span className="mono-label" style={{ color: "var(--text-faint)" }}>
          Streaming markdown
        </span>
      </div>
    </div>
  );
}
