// One place that talks to the AI provider. Pick with AI_PROVIDER=anthropic|gemini (default: whichever key is set, Anthropic first).
// Anthropic: ANTHROPIC_API_KEY, AI_MODEL (default claude-sonnet-5-5).  Gemini: GEMINI_API_KEY, GEMINI_MODEL (default gemini-2.5-flash).
export const providerName = () => {
  const p = (process.env.AI_PROVIDER || "").toLowerCase();
  if (p === "gemini" || p === "anthropic") return p;
  return process.env.ANTHROPIC_API_KEY ? "anthropic" : process.env.GEMINI_API_KEY ? "gemini" : "anthropic";
};
export const configured = () => (providerName() === "gemini" ? !!process.env.GEMINI_API_KEY : !!process.env.ANTHROPIC_API_KEY);

/** Returns the reply text. Throws Error("upstream") on any provider failure or empty reply. */
export async function complete({ system, prompt, maxTokens = 1500, timeout = 25_000 }) {
  const signal = AbortSignal.timeout(timeout);
  if (providerName() === "gemini") {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens } }),
      signal,
    });
    if (!r.ok) throw new Error("upstream");
    const j = await r.json();
    const text = ((j.candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("");
    if (!text) throw new Error("upstream");
    return text;
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-5-5", max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] }),
    signal,
  });
  if (!r.ok) throw new Error("upstream");
  const j = await r.json();
  return (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
}
