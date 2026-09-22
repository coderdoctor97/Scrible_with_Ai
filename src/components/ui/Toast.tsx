import { AnimatePresence, motion } from "framer-motion";
import type { Toast } from "../../hooks/useToast";
import { cn } from "../../lib/utils";

const META: Record<
  Toast["type"],
  { borderClass: string; badgeClass: string; glyph: string }
> = {
  success: {
    borderClass: "border-l-4 border-l-success",
    badgeClass: "text-success bg-success/10",
    glyph: "✓",
  },
  error: {
    borderClass: "border-l-4 border-l-danger",
    badgeClass: "text-danger bg-danger/10",
    glyph: "✕",
  },
  info: {
    borderClass: "border-l-4 border-l-primary",
    badgeClass: "text-primary bg-primary/10",
    glyph: "•",
  },
};

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2.5 max-w-[360px]"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const m = META[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-xl border border-border/70",
                "bg-panel/95 backdrop-blur-md px-4 py-3 text-sm font-medium text-main shadow-elevated",
                m.borderClass
              )}
              role="status"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
                  m.badgeClass
                )}
                aria-hidden="true"
              >
                {m.glyph}
              </span>
              <p className="flex-1 leading-snug">{t.msg}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
