// Ponytail: single tiny module for persistence, no abstraction sprawl
export const KEYS = {
  apiBase: "scribe_api_base",
  apiKey: "scribe_api_key",
  model: "scribe_model",
  prompt: "scribe_prompt",
  draft: "scribe_draft",
  savedPrompts: "scribe_saved_prompts",
  theme: "scribe_theme",
} as const;

export function getLS(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function setLS(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}
export function getSavedPrompts(): string[] {
  try { return JSON.parse(localStorage.getItem(KEYS.savedPrompts) || "[]"); } catch { return []; }
}
