import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { KEYS, setLS } from "../../lib/storage";
import { cn } from "../../lib/utils";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
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
    // theme class is applied by AppShell after mount — observe it so logo + toggle icon never go stale
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("scroll", onScroll);
      mo.disconnect();
    };
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
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 px-4 md:px-6 transition-all duration-200",
        scrolled ? "glass shadow-subtle border-border" : "bg-app/95"
      )}
    >
      <div className="flex items-center gap-3 md:gap-5">
        <Link
          to="/"
          className="group flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          aria-label="ScribeAI home"
        >
          <img
            src={dark ? "/logo-dark.png" : "/logo.png"}
            alt="ScribeAI"
            className="h-6 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            draggable={false}
          />
        </Link>
        <span className="hidden h-4 w-px bg-border-ink md:block" aria-hidden="true" />
        <span className="mono-label hidden text-faint md:inline-block">
          {isStudio ? "The Studio · Live Session" : "A Live Writing Coach · Open Source"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isStudio ? (
          <Link
            to="/"
            className="mono-label inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 text-xs text-muted transition-all duration-150 hover:bg-panel-soft hover:text-main active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span aria-hidden="true">←</span> Overview
          </Link>
        ) : (
          <Link
            to="/app"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-main px-4 text-xs font-semibold text-app shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Open Studio</span>
            <span aria-hidden="true" className="text-primary transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        )}

        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-panel text-muted transition-all duration-150 hover:bg-panel-soft hover:text-main active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary"
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          onClick={clear}
          aria-label="Clear all local data"
          title="Clear all local data"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-panel text-muted transition-all duration-150 hover:bg-danger/10 hover:border-danger/30 hover:text-danger active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-primary"
        >
          <TrashIcon />
        </button>
      </div>
    </header>
  );
}
