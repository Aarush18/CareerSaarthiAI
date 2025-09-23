import { GeminiOutput, GeminiOutputSchema } from "../validation/gemini-schema";

type PromptParts = {
  system: string;
  user: string;
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitize(input: string, maxLen = 4000): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLen);
}

async function callGeminiRaw(apiKey: string, prompt: PromptParts, abortSignal: AbortSignal): Promise<string> {
  const body = {
    contents: [
      { role: "system", parts: [{ text: prompt.system }] },
      { role: "user", parts: [{ text: prompt.user }] },
    ],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function generateCareerFlowchart(prompt: PromptParts): Promise<GeminiOutput> {
  const apiKey = "AIzaSyAkiSbRAjNiVchWiEH_ZcIxSj0dWnmB08I";
  console.log("Gemini service called with API key:", !!apiKey, "Length:", apiKey?.length || 0);
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    // First attempt
    const raw = await callGeminiRaw(apiKey, prompt, controller.signal);
    const firstTry = tryParseAndValidate(raw);
    if (firstTry.valid) {
      return firstTry.value;
    }

    // Single re-prompt enforcing strict JSON
    const retryPrompt: PromptParts = {
      system: prompt.system,
      user:
        sanitize(
          `${prompt.user}\n\nYour previous output was invalid. You must return ONLY strict JSON that matches the schema. No markdown or explanations.`
        ),
    };

    // Backoff and retry
    await sleep(800);
    const rawRetry = await callGeminiRaw(apiKey, retryPrompt, controller.signal);
    const secondTry = tryParseAndValidate(rawRetry);
    if (secondTry.valid) {
      return secondTry.value;
    }

    throw new Error("Gemini returned invalid JSON after retry");
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseAndValidate(text: string): { valid: boolean; value: GeminiOutput } {
  try {
    const json = JSON.parse(text);
    const parsed = GeminiOutputSchema.parse(json);
    return { valid: true, value: parsed };
  } catch (err) {
    return { valid: false, value: undefined as unknown as GeminiOutput };
  }
}


