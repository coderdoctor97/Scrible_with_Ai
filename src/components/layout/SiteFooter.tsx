import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-app transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-extrabold tracking-tight text-main">
            Scribe
          </span>
          <span className="caret-block !h-3 !w-1" aria-hidden="true" />
          <span className="mono-label text-faint">
            © 2026 · MIT · Client-side only
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/app"
            className="mono-label text-muted transition-colors hover:text-accent-ink"
          >
            Studio
          </Link>
          <span className="mono-label hidden text-faint sm:inline">
            Direct API dispatch · Zero middleman
          </span>
        </div>
      </div>
    </footer>
  );
}
