import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "var(--border-ink)", background: "var(--bg)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-baseline sm:justify-between md:px-6">
        <div className="flex items-baseline gap-3">
          <span
            className="text-[14px] font-extrabold tracking-[-0.02em]"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif', color: "var(--text)" }}
          >
            Scribe
          </span>
          <span className="caret-block !h-[11px] !w-[2px]" aria-hidden="true" />
          <span className="mono-label" style={{ color: "var(--text-faint)" }}>
            © 2026 · MIT · No server
          </span>
        </div>
        <div className="flex items-baseline gap-5">
          <Link to="/app" className="mono-label transition-colors hover:text-[var(--accent-ink)]" style={{ color: "var(--text-muted)" }}>
            The Studio
          </Link>
          <span className="mono-label" style={{ color: "var(--text-faint)" }}>
            Nothing leaves your browser except to your chosen API
          </span>
        </div>
      </div>
    </footer>
  );
}
