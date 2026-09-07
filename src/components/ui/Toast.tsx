import type { Toast } from "../../hooks/useToast";

const META: Record<Toast["type"], { rule: string; glyph: string }> = {
  success: { rule: "var(--success)", glyph: "✓" },
  error: { rule: "var(--danger)", glyph: "✕" },
  info: { rule: "var(--primary)", glyph: "•" },
};

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => {
        const m = META[t.type];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-[fade-in_0.3s_ease] items-center gap-2.5 rounded-lg border py-2.5 pl-3 pr-4 text-[13px] font-medium"
            style={{
              background: "var(--panel)",
              borderColor: "var(--border)",
              color: "var(--text)",
              boxShadow: "var(--shadow-lg)",
              borderLeft: `3px solid ${m.rule}`,
            }}
            role="status"
          >
            <span className="font-bold" style={{ color: m.rule }}>{m.glyph}</span>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
