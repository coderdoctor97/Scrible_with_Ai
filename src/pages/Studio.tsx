import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { KEYS, getLS, getSavedPrompts, setLS } from "../lib/storage";
import { fetchModels, streamCritique, testConnection } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ToastStack } from "../components/ui/Toast";
import { cn } from "../lib/utils";

const inputCls =
  "w-full rounded-lg border border-border bg-input-bg px-3.5 py-2 text-sm text-main placeholder:text-faint outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20";

function GearIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

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
        setFeedbackHtml(`<div class="text-danger font-medium p-3 rounded-lg bg-danger/10 border border-danger/20">Feedback stream error: ${e?.message || "Unknown"}</div>`);
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
    const live = s === "Live";

    return (
      <span
        className={cn(
          "mono-label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200",
          live && "border-success/30 bg-success/10 text-success",
          reviewing && "border-primary/30 bg-primary/10 text-primary animate-pulse",
          error && "border-danger/30 bg-danger/10 text-danger",
          !live && !reviewing && !error && "border-border bg-panel text-faint"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            live && "bg-success",
            reviewing && "bg-primary animate-ping",
            error && "bg-danger",
            !live && !reviewing && !error && "bg-faint"
          )}
        />
        {s}
      </span>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col bg-app transition-colors">
      <ToastStack toasts={toasts} />

      {/* Mobile / Tablet sub-nav */}
      <div className="sticky top-[56px] z-30 flex items-center border-b border-border-ink bg-app/95 backdrop-blur-md lg:hidden">
        {(["write", "coach"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              "mono-label relative flex-1 py-3 text-xs font-semibold transition-all duration-150 touch-manipulation",
              mobileTab === tab ? "text-accent-ink font-bold" : "text-faint hover:text-muted"
            )}
          >
            {tab === "write" ? "Drafting Desk" : "Live Critique"}
            {mobileTab === tab && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
        <button
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Toggle settings"
          aria-expanded={showSettings}
          className={cn(
            "flex h-11 w-12 items-center justify-center border-l border-border-ink transition-colors hover:bg-panel-soft touch-manipulation",
            showSettings ? "text-accent-ink bg-primary/10" : "text-muted"
          )}
        >
          <GearIcon />
        </button>
      </div>

      {/* Studio Bento Workstation */}
      <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[290px_minmax(0,1fr)_370px] xl:grid-cols-[310px_minmax(0,1fr)_410px] lg:h-[calc(100vh-56px)] p-3 lg:p-4 gap-3 lg:gap-4 bg-app">

        {/* 1. Settings Sidebar (Bento Card #1) */}
        <aside
          className={cn(
            "bento-card flex flex-col gap-5 p-5 overflow-y-auto transition-all duration-200",
            showSettings
              ? "fixed inset-x-3 bottom-3 top-20 z-50 rounded-2xl shadow-elevated bg-panel lg:static lg:inset-auto lg:top-auto lg:z-auto"
              : "hidden lg:flex"
          )}
        >
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="mono-label text-accent-ink">Nº 01</span>
              <span className="mono-label text-main">Connection</span>
              <span className="hairline mb-0.5 flex-1 bg-border-ink" />
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              <label className="mono-label text-[10px] text-muted" htmlFor="api-base">
                Base URL
              </label>
              <input
                id="api-base"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className={inputCls}
              />
              <span className="text-xs text-faint">OpenAI, Ollama, LM Studio, vLLM.</span>
            </div>

            <div className="mb-4 flex flex-col gap-1.5">
              <label className="mono-label text-[10px] text-muted" htmlFor="api-key">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                className={inputCls}
              />
              <span className="text-xs text-faint">Stored in your browser localStorage only.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="mono-label text-[10px] text-muted" htmlFor="api-model">
                  Model
                </label>
                <button
                  onClick={handleFetchModels}
                  className="text-xs font-semibold text-accent-ink underline decoration-border-ink underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  Refresh
                </button>
              </div>
              <select
                id="api-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={inputCls}
              >
                {modelOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={saveSettings}
                className="flex flex-1 items-center justify-center rounded-lg bg-main px-4 py-2.5 text-xs font-semibold text-app shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
              >
                Save settings
              </button>
              <button
                onClick={handleTest}
                className="rounded-lg border border-border bg-panel-soft px-4 py-2.5 text-xs font-semibold text-main transition-all duration-150 hover:bg-panel hover:border-primary/40 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
              >
                Test
              </button>
            </div>
          </div>

          <div className="border-t border-border-ink pt-4">
            <p className="mono-label mb-1.5 text-accent-ink">Zero-Interruption Loop</p>
            <p className="text-xs leading-relaxed text-muted">
              As you write, the coach analyzes your draft whenever you pause for 1.5 seconds. Start typing again and streaming pauses immediately.
            </p>
          </div>

          <div className="mt-auto border-t border-border-ink pt-4 lg:hidden">
            <button
              onClick={() => setShowSettings(false)}
              className="w-full rounded-lg border border-border bg-panel-soft py-2.5 text-xs font-semibold text-main transition-colors hover:bg-panel"
            >
              Close settings
            </button>
          </div>
        </aside>

        {/* 2. Workspace (Bento Card #2 - Center Editor) */}
        <section
          className={cn(
            "bento-card flex flex-col overflow-hidden min-h-[65vh] lg:min-h-0",
            mobileTab === "write" ? "flex" : "hidden lg:flex"
          )}
        >
          {/* Prompt input bar */}
          <div className="border-b border-border-ink bg-panel-soft/60 px-4 py-3.5 md:px-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="mono-label text-accent-ink">Nº 02</span>
                <span className="mono-label text-main">Writing Task / Prompt</span>
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      setPromptNow(e.target.value);
                      setLS(KEYS.prompt, e.target.value);
                      scheduleLiveAnalysis(400);
                    }
                  }}
                  defaultValue=""
                  className="max-w-[170px] rounded-md border border-border bg-input-bg px-2.5 py-1 text-xs text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  aria-label="Load a saved prompt"
                >
                  <option value="">Load saved…</option>
                  {savedPrompts.map((p) => (
                    <option key={p} value={p}>
                      {p.length > 36 ? p.slice(0, 36) + "…" : p}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSavePrompt}
                  className="rounded-md border border-border bg-panel px-3 py-1 text-xs font-semibold text-main transition-all duration-150 hover:bg-panel-soft hover:border-primary/40 active:scale-[0.97] focus-visible:ring-1 focus-visible:ring-primary"
                >
                  Save
                </button>
              </div>
            </div>
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => {
                setPromptNow(e.target.value);
                scheduleLiveAnalysis(1500);
              }}
              rows={2}
              placeholder="Paste your essay prompt, question, or composition goal here…"
              className="w-full resize-none rounded-lg border border-border bg-input-bg px-3.5 py-2 text-sm text-main leading-relaxed outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-faint"
            />
          </div>

          {/* Main Writing Surface */}
          <div className="flex flex-1 flex-col overflow-hidden p-4 md:p-5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="mono-label text-accent-ink">Nº 03</span>
                <span className="mono-label text-main">Draft Surface</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-accent-ink transition-opacity hover:opacity-80">
                  <ImportIcon />
                  <span>Import .txt / .md</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || undefined)}
                  />
                </label>
                <span className="mono-label text-[10px] text-faint">
                  {saveStatus}
                </span>
              </div>
            </div>

            {/* Paper Desk Textarea with Telemetry HUD */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-panel shadow-subtle">
              <textarea
                id="editor"
                value={draft}
                onChange={(e) => {
                  setDraftNow(e.target.value);
                  scheduleLiveAnalysis(1500);
                }}
                placeholder="Write your response here. The coach reads along silently — pause for a beat and feedback streams in the margin on the right."
                className="flex-1 w-full resize-none border-0 bg-transparent p-5 font-serif text-[16px] leading-[1.8] text-main outline-none placeholder:text-faint md:p-6"
                aria-label="Your Draft"
              />

              {/* Linear-style Telemetry HUD */}
              <div
                className="flex h-11 items-center justify-between border-t border-border-ink bg-panel-soft/80 px-4 md:px-5 font-mono text-xs tabular-nums"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 text-muted">
                  <span className="font-semibold text-main">{wordCount}</span>
                  <span className="text-faint">words</span>
                  <span className="text-faint">·</span>
                  <span className="font-semibold text-main">{charCount}</span>
                  <span className="text-faint">chars</span>
                  <span className="text-faint">·</span>
                  <span className="font-semibold text-main">{readTime}</span>
                  <span className="text-faint">read</span>
                </div>
                <div
                  className="mono-label text-[10px] font-bold tracking-wider"
                  style={{ color: liveColor }}
                >
                  {liveLabel.replace(/\p{Extended_Pictographic}/gu, "").replace("●", "").trim()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Feedback Panel (Bento Card #3 - Right Margin) */}
        <section
          className={cn(
            "bento-card flex flex-col overflow-hidden min-h-[65vh] lg:min-h-0",
            mobileTab === "coach" ? "flex" : "hidden lg:flex"
          )}
        >
          <div className="flex items-center justify-between border-b border-border-ink bg-panel-soft/60 px-4 py-3.5 md:px-5">
            <div className="flex items-center gap-2.5">
              <span className="mono-label text-accent-ink">Nº 04</span>
              <span className="mono-label text-main">Live Critique</span>
            </div>
            {statusChip(coachStatus)}
          </div>

          <div
            ref={feedbackRef}
            className="flex-1 overflow-y-auto p-5 md:p-6"
            aria-live="polite"
          >
            {coachStatus === "Reviewing..." && !feedbackHtml ? (
              /* Phase 4 Shimmer Loading Skeleton */
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-4 w-28 rounded skeleton-shimmer" />
                <div className="h-10 w-full rounded-lg skeleton-shimmer" />
                <div className="mt-2 h-4 w-32 rounded skeleton-shimmer" />
                <div className="h-14 w-full rounded-lg skeleton-shimmer" />
                <div className="mt-2 h-4 w-36 rounded skeleton-shimmer" />
                <div className="h-16 w-full rounded-lg skeleton-shimmer" />
              </div>
            ) : !hasFeedback ? (
              <div className="flex h-full flex-col justify-center">
                <div className="mx-auto max-w-[320px]">
                  <p className="font-serif italic text-xl tracking-tight text-main">
                    The margin is listening.
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    {[
                      { n: "01", t: "Write eight words or more" },
                      { n: "02", t: "Pause for 1.5 seconds" },
                      { n: "03", t: "Marks stream in here" },
                    ].map((s) => (
                      <div
                        key={s.n}
                        className="flex items-baseline gap-3 border-t border-border-ink pt-3"
                      >
                        <span className="mono-label text-faint">{s.n}</span>
                        <span className="text-xs font-medium text-muted">{s.t}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mono-label mt-6 text-[10px] text-faint">
                    Keep typing and the stream cancels instantly
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="prose-ai"
                dangerouslySetInnerHTML={{
                  __html:
                    feedbackHtml ||
                    `<div class="text-muted text-sm">Listening… start typing to see critique.</div>`,
                }}
              />
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
