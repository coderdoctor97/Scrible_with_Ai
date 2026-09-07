import { useCallback, useState } from "react";

export type Toast = { id: number; msg: string; type: "info" | "success" | "error" };

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return { toasts, show, remove };
}
