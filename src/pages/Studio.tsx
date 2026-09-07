import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { KEYS, getLS, getSavedPrompts, setLS } from "../lib/storage";
import { fetchModels, streamCritique, testConnection } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ToastStack } from "../components/ui/Toast";

const inputCls =
  "w-full rounded-md border px-3 py-2.5 text-[13px] outline-none transition-shadow focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(255,107,53,0.18)]";
const inputStyle = { borderColor: "var(--border)", background: "var(--input-bg)", color: "var(--text)" } as const;

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5M4 17v2.2A1.8 1.8 0 0 0 5.8 21h12.4a1.8 1.8 0 0 0 1.8-1.8V17" />
    </svg>
  );
}

// --- Studio page: 1:1 parity with prototype, production-grade responsive ---
export default function Studio() {
  // persisted state — mirrors prototype's `state` object
  const [apiBase, setApiBase] = useState(() => getLS(KEYS.apiBase, "https://api.openai.com/v1"));
  const [apiKey, setApiKey] = useState(() => getLS(KEYS.apiKey, ""));
  const [selectedModel, setSelectedModel] = useState(() => getLS(KEYS.model, "gpt-4o-mini"));
  const [prompt, setPrompt] = useState(() => getLS(KEYS.prompt, ""));
  const [draft, setDraft] = useState(() => getLS(KEYS.draft, ""));
  const [savedPrompts, setSavedPrompts] = useState<string[]>(() => getSavedPrompts());
  const [modelOptions, setModelOptions] = useState<string[]>(() => {
    const base = ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"];
    const stored = getLS(KEYS.model, "gpt-4o-mini");
    return base.includes(stored) ? base : [stored, ...base];
  });

  // UI state
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState("0 min");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [liveLabel, setLiveLabel] = useState("● Ready");
  const [liveColor, setLiveColor] = useState<string>("var(--text-muted)");
  const [coachStatus, setCoachStatus] = useState<"Listening" | "Reviewing..." | "Live" | "Error">("Listening");
  const [feedbackHtml, setFeedbackHtml] = useState("");
  const [hasFeedback, setHasFeedback] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "coach">("write");
  const [showSettings, setShowSettings] = useState(false);

  const { toasts, show } = useToast();

  const abortRef = useRef<AbortController | null>(null);
  const lastFingerprint = useRef("");
  const saveTimeout = useRef<number | null>(null);
  const liveTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  // refs mirroring the latest draft/prompt so debounced callbacks never read a stale closure
  const draftRef = useRef(draft);
  const promptRef = useRef(prompt);
  draftRef.current = draft;
  promptRef.current = prompt;
  const setDraftNow = (v: string) => { draftRef.current = v; setDraft(v); };
  const setPromptNow = (v: string) => { promptRef.current = v; setPrompt(v); };

  const metrics = useMemo(() => {
    const t = draft.trim();
    const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
    return { words, chars: t.length, read: Math.ceil(words / 200) };
  }, [draft]);

  useEffect(() => {
    setWordCount(metrics.words);
    setCharCount(metrics.chars);
    setReadTime(`${metrics.read} min`);
  }, [metrics]);

  // auto-save draft + prompt (600ms) – prototype parity
  const triggerAutoSave = useCallback((nextDraft?: string, nextPrompt?: string) => {
    setSaveStatus("Saving...");
    if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
    saveTimeout.current = window.setTimeout(() => {
      setLS(KEYS.draft, nextDraft ?? draft);
      setLS(KEYS.prompt, nextPrompt ?? prompt);
      setSaveStatus("Saved");
    }, 600) as unknown as number;
  }, [draft, prompt]);

  useEffect(() => {
    triggerAutoSave();
  }, [draft, prompt, triggerAutoSave]);

  // live analysis engine (intentionally captures executeLiveAnalysis via closure; deps cover draft/prompt/api)
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const scheduleLiveAnalysis = useCallback((delay = 1500) => {
    const text = draftRef.current.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    if (words < 8) {
      setLiveLabel("● Typing (needs 8+ words)");
      setLiveColor("var(--text-muted)");
      return;
    }
    setLiveLabel("✍️ Typing...");
    setLiveColor("var(--primary)");
    if (liveTimer.current) window.clearTimeout(liveTimer.current);
    liveTimer.current = window.setTimeout(() => executeLiveAnalysis(), delay) as unknown as number;
  }, [apiBase, apiKey, selectedModel]);

  // initial trigger if draft already has >=8 words
  useEffect(() => {
    if (metrics.words >= 8) scheduleLiveAnalysis(500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function executeLiveAnalysis() {
    const d = draftRef.current.trim();
    const p = promptRef.current.trim();
    const base = apiBase.trim().replace(/\/$/, "");
    const key = apiKey.trim();
    const model = selectedModel || "gpt-4o-mini";
    const fingerprint = `${p}:::${d}`;
    if (fingerprint === lastFingerprint.current) {
      setLiveLabel("● Up to date");
      setLiveColor("var(--success)");
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setHasFeedback(true);
    setCoachStatus("Reviewing...");
    setLiveLabel("⚡ Live: Updating...");
    setLiveColor("var(--primary)");

    try {
      let full = "";
      await streamCritique({
        base: base || "https://api.openai.com/v1",
        key,
        model,
        prompt: p,
        draft: d,
        signal: controller.signal,
        onDelta: (_delta, cur) => {
          full = cur;
          const cleaned = full.replace(/^###\s*(?:📊|💡|🎯|✏️)\s*/gm, "### ");
          const html = marked.parse(cleaned) as string;
          setFeedbackHtml(html);
        },
      });
      lastFingerprint.current = fingerprint;
      setLiveLabel("● Up to date");
      setLiveColor("var(--success)");
      setCoachStatus("Live");
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (e?.name !== "AbortError") {
        setCoachStatus("Error");
        setLiveLabel("⚠️ API error");
        setLiveColor("var(--danger)");
        setFeedbackHtml(`<div style="color:var(--danger)">Feedback stream error: ${e?.message || "Unknown"}</div>`);
      }
    } finally {
      abortRef.current = null;
    }
  }

  // handlers – prototype parity
  const saveSettings = () => {
    const base = apiBase.trim().replace(/\/$/, "");
    setLS(KEYS.apiBase, base);
    setLS(KEYS.apiKey, apiKey.trim());
    setLS(KEYS.model, selectedModel);
    setApiBase(base);
    show("Settings saved!", "success");
    scheduleLiveAnalysis(200);
  };

  const handleFetchModels = async () => {
    const base = apiBase.trim().replace(/\/$/, "");
    const key = apiKey.trim();
    if (!base) return show("API Base URL is required", "error");
    show("Fetching models...", "info");
    try {
      const models = await fetchModels(base, key);
      if (models.length) {
        setModelOptions(models);
        show(`Loaded ${models.length} models`, "success");
      } else show("No models returned", "error");
    } catch (e: unknown) {
      show(`Could not load models: ${(e as Error).message}`, "error");
    }
  };

  const handleTest = async () => {
    const base = apiBase.trim().replace(/\/$/, "");
    const key = apiKey.trim();
    if (!base) return show("Base URL is missing", "error");
    show("Testing connection...", "info");
    try {
      await testConnection(base, key, selectedModel);
      show("Connection verified!", "success");
    } catch (e: unknown) {
      const msg = (e as Error).message;
      show(msg.includes("CORS") ? `CORS or Network error: ${msg}` : `Error: ${msg}`, "error");
    }
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || "";
      setDraftNow(text);
      setLS(KEYS.draft, text);
      scheduleLiveAnalysis(200);
      show("File imported", "success");
    };
    reader.readAsText(file);
  };

  const handleSavePrompt = () => {
    const p = prompt.trim();
    if (!p) return;
    if (!savedPrompts.includes(p)) {
      const next = [...savedPrompts, p];
      setSavedPrompts(next);
      localStorage.setItem(KEYS.savedPrompts, JSON.stringify(next));
      show("Prompt saved", "success");
    }
  };

  const statusChip = (s: string) => {
    const reviewing = s === "Reviewing...";
    const error = s === "Error";
    return (
      <span
        className={`mono-label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 !text-[10px] ${reviewing ? "animate-pulse" : ""}`}
        style={{
          borderColor: "var(--border)",
          background: "var(--panel)",
          color: error ? "var(--danger)" : reviewing ? "var(--accent-ink)" : s === "Live" ? "var(--success)" : "var(--text-faint)",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: error ? "var(--danger)" : reviewing ? "var(--primary)" : s === "Live" ? "var(--success)" : "var(--text-faint)" }}
        />
        {s}
      </span>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col" style={{ background: "var(--bg)" }}>
      <ToastStack toasts={toasts} />

      {/* Mobile sub-nav */}
      <div className="sticky top-[56px] z-30 flex border-b bg-[var(--bg)] lg:hidden" style={{ borderColor: "var(--border-ink)" }}>
        {(["write", "coach"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`mono-label relative flex-1 py-3.5 !text-[11px] transition-colors ${
              mobileTab === tab ? "" : "!text-[var(--text-faint)]"
            }`}
            style={{ color: mobileTab === tab ? "var(--accent-ink)" : undefined }}
          >
            {tab === "write" ? "Write" : "Live Critique"}
            {mobileTab === tab && (
              <span className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "var(--primary)" }} />
            )}
          </button>
        ))}
        <button
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Toggle settings"
          aria-expanded={showSettings}
          className="flex w-12 items-center justify-center border-l transition-colors hover:bg-[var(--panel-soft)]"
          style={{ borderColor: "var(--border-ink)", color: showSettings ? "var(--accent-ink)" : "var(--text-muted)" }}
        >
          <GearIcon />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:grid lg:grid-cols-[300px_1fr_380px] lg:h-[calc(100vh-56px)]">
        {/* 1. Settings Sidebar */}
        <aside
          className={`${showSettings ? "flex" : "hidden"} lg:flex flex-col gap-6 overflow-y-auto border-r bg-[var(--panel)] p-5 ${mobileTab === "write" ? "flex" : "hidden lg:flex"} lg:h-full`}
          style={{ borderColor: "var(--border-ink)" }}
        >
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="mono-label" style={{ color: "var(--accent-ink)" }}>Nº 01</span>
              <span className="mono-label">Connection</span>
              <span className="hairline mb-1 flex-1" style={{ background: "var(--border-ink)" }} />
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              <label className="mono-label !text-[10px]" htmlFor="api-base">Base URL</label>
              <input id="api-base" value={apiBase} onChange={(e) => setApiBase(e.target.value)} placeholder="https://api.openai.com/v1" className={inputCls} style={inputStyle} />
              <span className="text-[11px] leading-snug" style={{ color: "var(--text-faint)" }}>OpenAI, Ollama, LM Studio, etc.</span>
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              <label className="mono-label !text-[10px]" htmlFor="api-key">API key</label>
              <input id="api-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-…" className={inputCls} style={inputStyle} />
              <span className="text-[11px] leading-snug" style={{ color: "var(--text-faint)" }}>Stored in this browser only.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="mono-label !text-[10px]" htmlFor="api-model">Model</label>
                <button onClick={handleFetchModels} className="text-[11px] font-semibold underline decoration-[var(--border-ink)] underline-offset-4 transition-colors hover:decoration-[var(--primary)]" style={{ color: "var(--accent-ink)" }}>
                  Refresh
                </button>
              </div>
              <select id="api-model" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={inputCls} style={inputStyle}>
                {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={saveSettings} className="flex flex-1 items-center justify-center rounded-md px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-[var(--primary-hover)]" style={{ background: "var(--text)", color: "var(--bg)" }}>
                Save settings
              </button>
              <button onClick={handleTest} className="rounded-md border px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-[var(--panel-soft)]" style={{ borderColor: "var(--border-ink)", color: "var(--text)" }}>
                Test
              </button>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--border-ink)" }}>
            <p className="mono-label mb-1.5" style={{ color: "var(--accent-ink)" }}>Fully automatic</p>
            <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              As you write, the coach re-reads the draft every time you pause — and goes quiet the moment you move.
            </p>
          </div>
          <div className="mt-auto border-t pt-4 lg:hidden" style={{ borderColor: "var(--border-ink)" }}>
            <button onClick={() => setShowSettings(false)} className="w-full rounded-md border py-2.5 text-[13px] font-medium" style={{ borderColor: "var(--border-ink)", color: "var(--text-muted)" }}>
              Close settings
            </button>
          </div>
        </aside>

        {/* 2. Workspace */}
        <section className={`${mobileTab === "write" ? "flex" : "hidden"} lg:flex min-h-[60vh] lg:min-h-0 lg:h-full flex-col overflow-hidden`} style={{ background: "var(--bg)" }}>
          {/* Prompt input */}
          <div className="border-b px-4 py-3 md:px-5" style={{ borderColor: "var(--border-ink)", background: "var(--panel)" }}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="mono-label" style={{ color: "var(--accent-ink)" }}>Nº 02</span>
                <span className="mono-label">Task</span>
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => { if (e.target.value) { setPromptNow(e.target.value); setLS(KEYS.prompt, e.target.value); scheduleLiveAnalysis(400); } }}
                  defaultValue=""
                  className="max-w-[160px] rounded-md border px-2 py-1.5 text-[12px] outline-none"
                  style={inputStyle}
                  aria-label="Load a saved prompt"
                >
                  <option value="">Load saved…</option>
                  {savedPrompts.map((p) => <option key={p} value={p}>{p.length > 40 ? p.slice(0, 40) + "…" : p}</option>)}
                </select>
                <button onClick={handleSavePrompt} className="rounded-md border px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--panel-soft)]" style={{ borderColor: "var(--border-ink)", color: "var(--text)" }}>
                  Save
                </button>
              </div>
            </div>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => { setPromptNow(e.target.value); scheduleLiveAnalysis(1500); }}
              rows={2}
              placeholder="Paste your question or essay prompt here…"
              className="w-full resize-none rounded-md border px-3 py-2.5 text-[13px] leading-relaxed outline-none transition-shadow focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(255,107,53,0.18)]"
              style={inputStyle}
            />
          </div>

          {/* Main Editor */}
          <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="mono-label" style={{ color: "var(--accent-ink)" }}>Nº 03</span>
                <span className="mono-label">Draft</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold transition-colors hover:opacity-80" style={{ color: "var(--accent-ink)" }}>
                  <ImportIcon />
                  Import .txt / .md
                  <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || undefined)} />
                </label>
                <span className="mono-label !text-[10px]" style={{ color: "var(--text-faint)" }}>{saveStatus}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-[var(--panel)]" style={{ borderColor: "var(--border-ink)", boxShadow: "var(--shadow)" }}>
              <textarea
                id="editor"
                value={draft}
                onChange={(e) => { setDraftNow(e.target.value); scheduleLiveAnalysis(1500); }}
                placeholder="Write your response here. The coach reads along — pause for a beat and the critique updates on the right."
                className="flex-1 w-full resize-none border-0 bg-transparent p-5 text-[15.5px] leading-[1.8] outline-none placeholder:text-[var(--text-faint)] md:p-6"
                style={{ fontFamily: '"Newsreader", Georgia, serif', color: "var(--text)" }}
              />
              <div className="flex h-10 items-center justify-between border-t px-4 md:px-5" style={{ borderColor: "var(--border-ink)", background: "var(--panel-soft)" }}>
                <div className="mono-label !tracking-[0.08em]">
                  <span style={{ color: "var(--text)" }}>{wordCount}</span>
                  <span style={{ color: "var(--text-faint)" }}> words · </span>
                  <span style={{ color: "var(--text)" }}>{charCount}</span>
                  <span style={{ color: "var(--text-faint)" }}> chars · </span>
                  <span style={{ color: "var(--text)" }}>{readTime}</span>
                </div>
                <div className="mono-label !tracking-[0.08em]" style={{ color: liveColor }}>{liveLabel.replace(/\p{Extended_Pictographic}/gu, "").replace("●", "").trim()}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Feedback Panel */}
        <section className={`${mobileTab === "coach" ? "flex" : "hidden"} lg:flex flex-col border-l bg-[var(--panel)] overflow-hidden min-h-[60vh] lg:min-h-0 lg:h-full`} style={{ borderColor: "var(--border-ink)" }}>
          <div className="flex items-center justify-between border-b px-4 py-3 md:px-5" style={{ borderColor: "var(--border-ink)" }}>
            <div className="flex items-center gap-3">
              <span className="mono-label" style={{ color: "var(--accent-ink)" }}>Nº 04</span>
              <span className="mono-label">Live critique</span>
            </div>
            {statusChip(coachStatus)}
          </div>

          <div ref={feedbackRef} className="flex-1 overflow-y-auto p-5 md:p-6">
            {!hasFeedback ? (
              <div className="flex h-full flex-col justify-center">
                <div className="mx-auto max-w-[300px]">
                  <p
                    className="text-[22px] leading-snug tracking-[-0.01em]"
                    style={{ fontFamily: '"Newsreader", serif', fontStyle: "italic", color: "var(--text)" }}
                  >
                    The margin is listening.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    {[
                      { n: "01", t: "Write eight words or more" },
                      { n: "02", t: "Pause for 1.5 seconds" },
                      { n: "03", t: "Marks stream in here" },
                    ].map((s) => (
                      <div key={s.n} className="flex items-baseline gap-3 border-t pt-2.5" style={{ borderColor: "var(--border-ink)" }}>
                        <span className="mono-label" style={{ color: "var(--text-faint)" }}>{s.n}</span>
                        <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>{s.t}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mono-label mt-6 !tracking-[0.08em]" style={{ color: "var(--text-faint)" }}>
                    Keep typing and the stream cancels instantly
                  </p>
                </div>
              </div>
            ) : (
              <div className="prose-ai" dangerouslySetInnerHTML={{ __html: feedbackHtml || `<div style="color:var(--text-muted)">Listening… start typing to see critique.</div>` }} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
