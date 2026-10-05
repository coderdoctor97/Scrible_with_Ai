import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { KEYS, getLS, getSavedPrompts, setLS } from "../lib/storage";
import { fetchModels, streamCritique, testConnection } from "../lib/api";
import { useToast } from "../hooks/useToast";
import { ToastStack } from "../components/ui/Toast";
import { cn } from "../lib/utils";

const inputCls =
  "w-full rounded-lg border border-border bg-input-bg px-3.5 py-2 text-sm text-main placeholder:text-faint outline-none transition-all duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20";

const SAFE_MARKDOWN_TAGS = new Set([
  "a", "blockquote", "br", "code", "del", "em", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "img", "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th", "thead",
  "tr", "ul",
]);

const REMOVE_MARKDOWN_TAGS = new Set([
  "audio", "base", "button", "embed", "form", "iframe", "input", "link", "math", "meta",
  "object", "script", "select", "source", "style", "svg", "template", "textarea", "video",
]);

function isSafeMarkdownUrl(value: string) {
  if (value.startsWith("#")) return true;
  try {
    const protocol = new URL(value, window.location.href).protocol;
    return ["http:", "https:", "mailto:", "tel:"].includes(protocol);
  } catch {
    return false;
  }
}

function sanitizeMarkdownHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const sanitizeChildren = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      const tag = child.tagName.toLowerCase();
      if (!SAFE_MARKDOWN_TAGS.has(tag)) {
        if (REMOVE_MARKDOWN_TAGS.has(tag)) {
          child.remove();
        } else {
          sanitizeChildren(child);
          while (child.firstChild) child.parentNode?.insertBefore(child.firstChild, child);
          child.remove();
        }
        continue;
      }

      for (const attribute of Array.from(child.attributes)) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value;
        const keep =
          name === "title" ||
          (tag === "a" && name === "href" && isSafeMarkdownUrl(value)) ||
          (tag === "img" && name === "src" && isSafeMarkdownUrl(value)) ||
          (tag === "img" && name === "alt") ||
          (tag === "ol" && name === "start" && /^\d+$/.test(value)) ||
          ((tag === "td" || tag === "th") &&
            (name === "colspan" || name === "rowspan") &&
            /^\d+$/.test(value)) ||
          (tag === "code" && name === "class" && /^language-[\w-]+$/.test(value));

        if (!keep) child.removeAttribute(attribute.name);
      }

      sanitizeChildren(child);
    }
  };

  sanitizeChildren(doc.body);
  return doc.body.innerHTML;
}

function parseSafeMarkdown(markdown: string) {
  return sanitizeMarkdownHtml(String(marked.parse(markdown)));
}

function normalizeCritiqueMarkdown(markdown: string) {
  return markdown.replace(/^###\s*(?:📊|💡|🎯|✏️)\s*/gm, "### ");
}

function extractSuggestionMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  let sectionStart = -1;
  let sectionLevel = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const heading = lines[i].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading && /\bsuggestion\b/i.test(heading[2])) {
      sectionStart = i;
      sectionLevel = heading[1].length;
      break;
    }
  }

  if (sectionStart < 0) return "";

  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i += 1) {
    const heading = lines[i].match(/^(#{1,6})\s+/);
    if (heading && heading[1].length <= sectionLevel) {
      sectionEnd = i;
      break;
    }
  }

  const section = lines.slice(sectionStart, sectionEnd).join("\n").trim();
  return section.split(/\r?\n/).slice(1).some((line) => line.trim()) ? section : "";
}

function exportFileStem(question: string) {
  const slug = question
    .trim()
    .slice(0, 60)
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${slug || "scribe-writing"}-${new Date().toISOString().slice(0, 10)}`;
}

function buildExportDocument(question: string, answer: string) {
  const questionHtml = parseSafeMarkdown(question || "_No question supplied._");
  const answerHtml = parseSafeMarkdown(answer || "_No answer written yet._");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>ScribeAI · Writing export</title>
  <style>
    @page { size: letter; margin: 0.75in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #20252a; background: #fff; font: 11pt/1.65 Georgia, "Times New Roman", serif; }
    .document { max-width: 760px; margin: 0 auto; padding: 42px; }
    .eyebrow { margin: 0 0 8px; color: #8c4a2c; font: 700 9pt/1.4 Arial, sans-serif; letter-spacing: .13em; text-transform: uppercase; }
    .document-title { margin: 0 0 34px; padding-bottom: 16px; border-bottom: 1px solid #ded8cf; font: 700 25pt/1.2 Arial, sans-serif; }
    .entry { margin: 0 0 32px; }
    .entry-title { margin: 0 0 12px; color: #8c4a2c; font: 700 10pt/1.4 Arial, sans-serif; letter-spacing: .12em; text-transform: uppercase; }
    .markdown-body p { margin: 0 0 12px; }
    .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin: 22px 0 10px; font-family: Arial, sans-serif; line-height: 1.3; }
    .markdown-body h1 { font-size: 19pt; }
    .markdown-body h2 { font-size: 16pt; }
    .markdown-body h3 { font-size: 13pt; }
    .markdown-body ul, .markdown-body ol { margin: 8px 0 14px; padding-left: 25px; }
    .markdown-body li { margin: 0 0 5px; }
    .markdown-body blockquote { margin: 16px 0; padding: 2px 0 2px 16px; border-left: 3px solid #df7448; color: #555; }
    .markdown-body code { padding: 1px 4px; background: #f4f0ea; font: 9pt Consolas, monospace; }
    .markdown-body pre { overflow-wrap: anywhere; padding: 12px; background: #f4f0ea; white-space: pre-wrap; }
    .markdown-body pre code { padding: 0; background: transparent; }
    .markdown-body table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    .markdown-body th, .markdown-body td { padding: 7px 9px; border: 1px solid #d8d2ca; text-align: left; }
    .markdown-body th { background: #f4f0ea; font-family: Arial, sans-serif; }
    .markdown-body img { max-width: 100%; height: auto; }
    .markdown-body a { color: #8c4a2c; }
    @media print { .document { max-width: none; padding: 0; } .entry { break-inside: avoid-page; } }
  </style>
</head>
<body>
  <main class="document">
    <p class="eyebrow">ScribeAI · Writing export</p>
    <h1 class="document-title">Question &amp; Answer</h1>
    <section class="entry">
      <h2 class="entry-title">Question</h2>
      <div class="markdown-body">${questionHtml}</div>
    </section>
    <section class="entry">
      <h2 class="entry-title">Answer</h2>
      <div class="markdown-body">${answerHtml}</div>
    </section>
  </main>
</body>
</html>`;
}

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

function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V4m-4 4 4-4 4 4" />
      <path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
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
  const [liveCritiqueEnabled, setLiveCritiqueEnabled] = useState(
    () => getLS(KEYS.liveCritique, "true") !== "false",
  );
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState("0 min");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [liveLabel, setLiveLabel] = useState("● Ready");
  const [liveColor, setLiveColor] = useState<string>("var(--text-muted)");
  const [coachStatus, setCoachStatus] = useState<
    "Listening" | "Reviewing..." | "Live" | "Reviewed" | "Paused" | "Error"
  >("Listening");
  const [feedbackMarkdown, setFeedbackMarkdown] = useState("");
  const [feedbackHtml, setFeedbackHtml] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [hasFeedback, setHasFeedback] = useState(false);
  const [hasCompleteReview, setHasCompleteReview] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "coach">("write");
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { toasts, show } = useToast();

  const abortRef = useRef<AbortController | null>(null);
  const requestModeRef = useRef<"live" | "manual" | null>(null);
  const lastFingerprint = useRef("");
  const saveTimeout = useRef<number | null>(null);
  const liveTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  const suggestionMarkdown = useMemo(
    () => extractSuggestionMarkdown(feedbackMarkdown),
    [feedbackMarkdown],
  );
  const isReviewing = coachStatus === "Reviewing...";

  useEffect(() => {
    setWordCount(metrics.words);
    setCharCount(metrics.chars);
    setReadTime(`${metrics.read} min`);
  }, [metrics]);

  useEffect(() => {
    if (!showExportMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!exportMenuRef.current?.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowExportMenu(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showExportMenu]);

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

  // The pause switch also clears a queued review; this callback always reads the latest editor content.
  const scheduleLiveAnalysis = useCallback((delay = 1500) => {
    if (liveTimer.current) {
      window.clearTimeout(liveTimer.current);
      liveTimer.current = null;
    }

    if (!liveCritiqueEnabled) {
      setLiveLabel("⏸ Live critique paused");
      setLiveColor("var(--text-muted)");
      return;
    }

    if (requestModeRef.current === "live") {
      abortRef.current?.abort();
      abortRef.current = null;
      requestModeRef.current = null;
      setCoachStatus("Listening");
    }

    const text = draftRef.current.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    if (words < 8) {
      setLiveLabel("● Typing (needs 8+ words)");
      setLiveColor("var(--text-muted)");
      return;
    }

    setLiveLabel("✍️ Typing...");
    setLiveColor("var(--primary)");
    liveTimer.current = window.setTimeout(() => {
      liveTimer.current = null;
      void executeLiveAnalysis(false);
    }, delay) as unknown as number;
  // The scheduled callback intentionally captures the latest API/review closure.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, apiKey, selectedModel, liveCritiqueEnabled]);

  useEffect(() => {
    if (liveCritiqueEnabled) {
      scheduleLiveAnalysis(500);
    } else {
      setLiveLabel("⏸ Live critique paused");
      setLiveColor("var(--text-muted)");
      setCoachStatus("Paused");
    }
  }, [liveCritiqueEnabled, scheduleLiveAnalysis]);

  async function executeLiveAnalysis(manual = false) {
    if (!manual && !liveCritiqueEnabled) return;

    const d = draftRef.current.trim();
    const p = promptRef.current.trim();
    const base = apiBase.trim().replace(/\/$/, "");
    const key = apiKey.trim();
    const model = selectedModel || "gpt-4o-mini";
    const words = d ? d.split(/\s+/).filter(Boolean).length : 0;

    if (!d) {
      if (manual) show("Write an answer before asking for a review", "info");
      return;
    }
    if (!manual && words < 8) {
      setLiveLabel("● Typing (needs 8+ words)");
      setLiveColor("var(--text-muted)");
      return;
    }

    const fingerprint = `${p}:::${d}`;
    if (!manual && fingerprint === lastFingerprint.current) {
      setLiveLabel("● Up to date");
      setLiveColor("var(--success)");
      setCoachStatus("Live");
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    requestModeRef.current = manual ? "manual" : "live";
    setHasFeedback(true);
    setHasCompleteReview(false);
    setFeedbackMarkdown("");
    setFeedbackHtml("");
    setReviewError("");
    setCoachStatus("Reviewing...");
    setLiveLabel(manual ? "✍️ Reviewing draft..." : "⚡ Live: Updating...");
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
          if (controller.signal.aborted) return;
          full = cur;
          setFeedbackMarkdown(full);
          setFeedbackHtml(parseSafeMarkdown(normalizeCritiqueMarkdown(full)));
        },
      });

      if (controller.signal.aborted) return;
      if (!full.trim()) throw new Error("The model returned an empty review. Try again.");

      lastFingerprint.current = fingerprint;
      setHasCompleteReview(true);
      setLiveLabel(manual ? "● Review complete" : "● Up to date");
      setLiveColor("var(--success)");
      setCoachStatus(manual ? "Reviewed" : "Live");
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (!controller.signal.aborted && e?.name !== "AbortError") {
        const message = e?.message || "Unknown error";
        setCoachStatus("Error");
        setLiveLabel("⚠️ API error");
        setLiveColor("var(--danger)");
        setReviewError(`Feedback stream error: ${message}`);
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        requestModeRef.current = null;
      }
    }
  }

  const toggleLiveCritique = () => {
    const nextEnabled = !liveCritiqueEnabled;
    setLiveCritiqueEnabled(nextEnabled);
    setLS(KEYS.liveCritique, String(nextEnabled));

    if (!nextEnabled) {
      if (liveTimer.current) {
        window.clearTimeout(liveTimer.current);
        liveTimer.current = null;
      }
      if (requestModeRef.current === "live") {
        abortRef.current?.abort();
        abortRef.current = null;
        requestModeRef.current = null;
        if (!feedbackMarkdown) setHasFeedback(false);
      }
      setLiveLabel("⏸ Live critique paused");
      setLiveColor("var(--text-muted)");
      setCoachStatus("Paused");
    } else {
      setLiveLabel("● Ready");
      setLiveColor("var(--text-muted)");
      setCoachStatus("Listening");
    }
  };

  const handleReviewNow = () => {
    void executeLiveAnalysis(true);
  };

  const handleCopySuggestion = async () => {
    if (!suggestionMarkdown || isReviewing) return;

    const copyWithFallback = async () => {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(suggestionMarkdown);
          return;
        } catch {
          // Clipboard permissions can vary by browser; use the text-area fallback below.
        }
      }

      const textarea = document.createElement("textarea");
      textarea.value = suggestionMarkdown;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Clipboard access is unavailable");
    };

    try {
      await copyWithFallback();
      show("Suggestion copied as Markdown", "success");
    } catch {
      show("Could not copy the suggestion. Check clipboard permissions.", "error");
    }
  };

  const getExportData = () => {
    const question = prompt.trim();
    const answer = draft.trim();
    if (!question && !answer) {
      show("Write a question or answer before exporting", "error");
      return null;
    }
    return { question, answer, filename: exportFileStem(question) };
  };

  const downloadExport = (content: string, filename: string, mimeType: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportMarkdown = () => {
    setShowExportMenu(false);
    const data = getExportData();
    if (!data) return;
    const content = `# Question\n\n${data.question || "_No question supplied._"}\n\n# Answer\n\n${data.answer || "_No answer written yet._"}\n`;
    downloadExport(content, `${data.filename}.md`, "text/markdown;charset=utf-8");
    show("Markdown export downloaded", "success");
  };

  const handleExportDoc = () => {
    setShowExportMenu(false);
    const data = getExportData();
    if (!data) return;
    downloadExport(
      buildExportDocument(data.question, data.answer),
      `${data.filename}.doc`,
      "application/msword;charset=utf-8",
    );
    show("Word document downloaded", "success");
  };

  const handleExportPdf = () => {
    setShowExportMenu(false);
    const data = getExportData();
    if (!data) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      show("Allow pop-ups to export this review as a PDF", "error");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildExportDocument(data.question, data.answer));
    printWindow.document.close();
    window.setTimeout(() => {
      if (printWindow.closed) return;
      printWindow.focus();
      printWindow.print();
    }, 300);
    show("Print dialog opened — choose Save as PDF to download", "info");
  };

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

  const statusChip = (s: typeof coachStatus) => {
    const reviewing = s === "Reviewing...";
    const error = s === "Error";
    const success = s === "Live" || s === "Reviewed";
    const paused = s === "Paused";

    return (
      <span
        className={cn(
          "mono-label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200",
          success && "border-success/30 bg-success/10 text-success",
          reviewing && "border-primary/30 bg-primary/10 text-primary animate-pulse",
          error && "border-danger/30 bg-danger/10 text-danger",
          !success && !reviewing && !error && "border-border bg-panel text-muted"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors",
            success && "bg-success",
            reviewing && "bg-primary animate-ping",
            error && "bg-danger",
            !success && !reviewing && !error && "bg-faint"
          )}
        />
        {paused ? "Paused" : s}
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
            {tab === "write" ? "Drafting Desk" : "Critique"}
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
            <p className="mono-label mb-1.5 text-accent-ink">
              {liveCritiqueEnabled ? "Live coaching" : "Write, then review"}
            </p>
            <p className="text-xs leading-relaxed text-muted">
              {liveCritiqueEnabled
                ? "The coach reviews your draft after a short pause. Turn Live Critique off whenever you want to write without feedback."
                : "Live critique is paused. Write at your own pace, then choose Review now when you are ready for feedback."}
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
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="mono-label text-accent-ink">Nº 03</span>
                <span className="mono-label text-main">Draft Surface</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative" ref={exportMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowExportMenu((open) => !open)}
                    aria-expanded={showExportMenu}
                    aria-controls="export-options"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-2.5 py-1.5 text-xs font-semibold text-main transition-colors hover:border-primary/40 hover:bg-panel-soft focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <ExportIcon />
                    <span>Export</span>
                    <ChevronDownIcon />
                  </button>
                  {showExportMenu && (
                    <div
                      id="export-options"
                      role="group"
                      aria-label="Export question and answer"
                      className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-panel p-1.5 shadow-elevated"
                    >
                      <p className="mono-label px-2.5 pb-1.5 pt-2 text-[9px] text-faint">
                        QUESTION + ANSWER
                      </p>
                      <button
                        type="button"
                        onClick={handleExportMarkdown}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-main transition-colors hover:bg-panel-soft focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <span>Markdown</span><span className="font-mono text-[10px] text-faint">.md</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportDoc}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-main transition-colors hover:bg-panel-soft focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <span>Word document</span><span className="font-mono text-[10px] text-faint">.doc</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportPdf}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-main transition-colors hover:bg-panel-soft focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        <span>PDF / Print</span><span className="font-mono text-[10px] text-faint">.pdf</span>
                      </button>
                      <p className="mt-1 border-t border-border-ink px-2.5 py-2 text-[10px] leading-relaxed text-faint">
                        PDF opens the print dialog. Choose Save as PDF.
                      </p>
                    </div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-accent-ink transition-opacity hover:opacity-80">
                  <ImportIcon />
                  <span className="hidden sm:inline">Import .txt / .md</span>
                  <span className="sm:hidden">Import</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || undefined)}
                  />
                </label>
                <span className="mono-label hidden text-[10px] text-faint sm:inline">
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
                placeholder={
                  liveCritiqueEnabled
                    ? "Write your response here. The coach reads along silently — pause for a beat and feedback streams in the margin on the right."
                    : "Write your response here at your own pace. When you're ready, switch to Critique and choose Review now."
                }
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
          <div className="flex items-center justify-between gap-2 border-b border-border-ink bg-panel-soft/60 px-4 py-3.5 md:px-5">
            <div className="flex items-center gap-2.5">
              <span className="mono-label text-accent-ink">Nº 04</span>
              <span className="mono-label text-main">Critique</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLiveCritique}
                aria-pressed={liveCritiqueEnabled}
                aria-label={liveCritiqueEnabled ? "Turn off live critique" : "Turn on live critique"}
                title={liveCritiqueEnabled ? "Turn off live critique" : "Turn on live critique"}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5 text-[10px] font-semibold text-main transition-colors hover:border-primary/40 hover:bg-panel-soft focus-visible:ring-1 focus-visible:ring-primary"
              >
                <span>Live</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors duration-150",
                    liveCritiqueEnabled ? "bg-primary" : "bg-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-150",
                      liveCritiqueEnabled && "translate-x-3"
                    )}
                  />
                </span>
              </button>
              {statusChip(coachStatus)}
            </div>
          </div>

          {!liveCritiqueEnabled && (
            <div className="flex items-center justify-between gap-3 border-b border-border-ink bg-panel-soft/35 px-4 py-3 md:px-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-main">Write first. Review when ready.</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                  No automatic feedback while Live is off.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReviewNow}
                disabled={!draft.trim() || isReviewing}
                className="shrink-0 rounded-lg bg-main px-3 py-2 text-xs font-semibold text-app transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary"
              >
                {isReviewing ? "Reviewing…" : "Review now"}
              </button>
            </div>
          )}

          <div
            ref={feedbackRef}
            className="flex-1 overflow-y-auto p-5 md:p-6"
            aria-live="polite"
          >
            {isReviewing && !feedbackHtml ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-4 w-28 rounded skeleton-shimmer" />
                <div className="h-10 w-full rounded-lg skeleton-shimmer" />
                <div className="mt-2 h-4 w-32 rounded skeleton-shimmer" />
                <div className="h-14 w-full rounded-lg skeleton-shimmer" />
                <div className="mt-2 h-4 w-36 rounded skeleton-shimmer" />
                <div className="h-16 w-full rounded-lg skeleton-shimmer" />
              </div>
            ) : reviewError ? (
              <div className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm font-medium text-danger">
                {reviewError}
              </div>
            ) : !hasFeedback ? (
              <div className="flex h-full flex-col justify-center">
                <div className="mx-auto max-w-[320px]">
                  <p className="font-serif italic text-xl tracking-tight text-main">
                    {liveCritiqueEnabled ? "The margin is listening." : "The margin is quiet."}
                  </p>
                  <div className="mt-6 flex flex-col gap-3">
                    {(liveCritiqueEnabled
                      ? [
                          { n: "01", t: "Write eight words or more" },
                          { n: "02", t: "Pause for 1.5 seconds" },
                          { n: "03", t: "Marks stream in here" },
                        ]
                      : [
                          { n: "01", t: "Write without interruption" },
                          { n: "02", t: "Choose Review now when ready" },
                          { n: "03", t: "Copy or export your finished work" },
                        ]
                    ).map((s) => (
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
                    {liveCritiqueEnabled
                      ? "Keep writing and feedback will follow your pause"
                      : "Your draft stays yours until you ask for a review"}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {feedbackMarkdown && (
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopySuggestion}
                      disabled={!suggestionMarkdown || !hasCompleteReview || isReviewing}
                      title="Copy the Concrete Suggestion section as Markdown"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-2.5 py-1.5 text-[11px] font-semibold text-main transition-colors hover:border-primary/40 hover:bg-panel-soft disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <CopyIcon />
                      <span>Copy suggestion</span>
                      <span className="rounded border border-border-ink px-1 py-0.5 font-mono text-[9px] text-faint">MD</span>
                    </button>
                  </div>
                )}
                {feedbackHtml ? (
                  <div className="prose-ai" dangerouslySetInnerHTML={{ __html: feedbackHtml }} />
                ) : (
                  <p className="text-sm text-muted">The review was stopped before any feedback arrived.</p>
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
