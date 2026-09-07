import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { KEYS, setLS } from "../../lib/storage";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13.2A8.2 8.2 0 0 1 10.8 4 8.2 8.2 0 1 0 20 13.2Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M10 11v6M14 11v6M6.5 7l.8 12a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.8-12M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7" />
    </svg>
  );
}

export function SiteHeader({ onToggleTheme }: { onToggleTheme: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const loc = useLocation();
  const isStudio = loc.pathname === "/app";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clear = () => {
    if (confirm("Clear all data from storage?")) {
      localStorage.clear();
      location.reload();
    }
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setLS(KEYS.theme, isDark ? "dark" : "light");
    setDark(isDark);
    onToggleTheme();
  };

  return (
    <header
      className={`sticky top-0 z-40 flex h-[56px] items-center justify-between border-b px-4 md:px-6 transition-colors duration-300 ${
        scrolled ? "glass shadow-sm" : ""
      }`}
      style={{ borderColor: "var(--border-ink)", background: scrolled ? undefined : "var(--bg)" }}
    >
      <div className="flex items-baseline gap-3 md:gap-5">
        <Link to="/" className="flex items-baseline gap-0.5 group" aria-label="ScribeAI home">
          <span
            className="text-[19px] font-extrabold tracking-[-0.03em] leading-none"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--text)" }}
          >
            Scribe
          </span>
          <span className="caret-block !w-[3px] !h-[15px] rounded-[1px]" aria-hidden="true" />
          <span
            className="ml-1.5 text-[19px] font-semibold leading-none tracking-[-0.02em]"
            style={{ fontFamily: '"Newsreader", serif', fontStyle: "italic", color: "var(--accent-ink)" }}
          >
            AI
          </span>
        </Link>
        <span className="hairline hidden h-[14px] w-px md:block" style={{ background: "var(--border-ink)" }} />
        <span className="mono-label hidden md:inline-block" style={{ color: "var(--text-faint)" }}>
          {isStudio ? "The studio" : "A live writing coach · open source"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {isStudio ? (
          <Link
            to="/"
            className="mono-label inline-flex h-9 items-center rounded-lg border px-3 transition-colors hover:bg-[var(--panel-soft)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <span aria-hidden="true" className="mr-1.5">←</span> Site
          </Link>
        ) : (
          <Link
            to="/app"
            className="inline-flex h-9 items-center rounded-lg px-4 text-[13px] font-semibold transition-colors hover:bg-[var(--primary-hover)]"
            style={{ background: "var(--text)", color: "var(--bg)" }}
          >
            Open Studio
            <span aria-hidden="true" className="ml-1.5" style={{ color: "var(--primary)" }}>→</span>
          </Link>
        )}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--panel-soft)]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={clear}
          aria-label="Clear all local data"
          title="Clear all local data"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-[var(--panel-soft)]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <TrashIcon />
        </button>
      </div>
    </header>
  );
}
