export const SYSTEM_PROMPT = `You are a concise, supportive, and rigorous writing coach.
The user is actively typing. Evaluate the user's draft in relation to their stated task/prompt.
Output in clear Markdown:
### 📊 Scorecard
- Clarity: [1-10]/10 | Relevance: [1-10]/10 | Style: [1-10]/10

### 💡 Key Strengths
- [1-2 points]

### 🎯 Next Steps & Improvements
- [1-2 actionable points]

### ✏️ Concrete Suggestion
- [Direct example of how to refine or expand the latest thought]`;

export async function fetchModels(base: string, key: string): Promise<string[]> {
  const url = `${base.replace(/\/$/, "")}/models`;
  const res = await fetch(url, {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (Array.isArray(data.data)) return [...new Set((data.data as {id:string}[]).map((x)=>x.id).filter(Boolean))] as string[];
  if (Array.isArray(data.models)) return [...new Set(((data.models as {name?:string; id?:string}[]).map((x)=>x.name||x.id).filter(Boolean) as string[]))] as string[];
  return [];
}

export async function testConnection(base: string, key: string, model: string) {
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 4,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return true;
}

// Streaming helper – parses OpenAI-style SSE, calls onDelta, returns full text
export async function streamCritique(opts: {
  base: string;
  key: string;
  model: string;
  prompt: string;
  draft: string;
  signal: AbortSignal;
  onDelta: (delta: string, full: string) => void;
}) {
  const { base, key, model, prompt, draft, signal, onDelta } = opts;
  const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `PROMPT: ${prompt || "General composition"}\n\nDRAFT:\n${draft}` },
      ],
      stream: true,
      temperature: 0.3,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder("utf-8");
  let full = "";
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data:")) continue;
      const dataStr = trimmed.replace(/^data:\s*/, "");
      if (dataStr === "[DONE]") break;
      try {
        const delta = JSON.parse(dataStr).choices?.[0]?.delta?.content || "";
        if (delta) {
          full += delta;
          onDelta(delta, full);
        }
      } catch {}
    }
  }
  return full;
}
