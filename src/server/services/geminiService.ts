// import { GeminiOutput, GeminiOutputSchema } from "../validation/gemini-schema";

// type PromptParts = {
//   system: string;
//   user: string;
// };

// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// function sanitize(input: string, maxLen = 4000): string {
//   return input.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLen);
// }

// async function callGeminiRaw(apiKey: string, prompt: PromptParts, abortSignal: AbortSignal): Promise<string> {
//   const body = {
//     contents: [
//       { role: "system", parts: [{ text: prompt.system }] },
//       { role: "user", parts: [{ text: prompt.user }] },
//     ],
//     generationConfig: {
//       temperature: 0.0,
//       maxOutputTokens: 1024,
//       responseMimeType: "application/json",
//     },
//   };

//   const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//     signal: abortSignal,
//   });

//   if (!res.ok) {
//     throw new Error(`Gemini HTTP ${res.status}`);
//   }

//   const data = await res.json();
//   const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
//   return text;
// }

// export async function generateCareerFlowchart(prompt: PromptParts): Promise<GeminiOutput> {
//   const apiKey = "AIzaSyAkiSbRAjNiVchWiEH_ZcIxSj0dWnmB08I";
//   console.log("Gemini service called with API key:", !!apiKey, "Length:", apiKey?.length || 0);
//   if (!apiKey) {
//     throw new Error("GEMINI_API_KEY not configured");
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 15000);
//   try {
//     // First attempt
//     const raw = await callGeminiRaw(apiKey, prompt, controller.signal);
//     const firstTry = tryParseAndValidate(raw);
//     if (firstTry.valid) {
//       return firstTry.value;
//     }

//     // Single re-prompt enforcing strict JSON
//     const retryPrompt: PromptParts = {
//       system: prompt.system,
//       user:
//         sanitize(
//           `${prompt.user}\n\nYour previous output was invalid. You must return ONLY strict JSON that matches the schema. No markdown or explanations.`
//         ),
//     };

//     // Backoff and retry
//     await sleep(800);
//     const rawRetry = await callGeminiRaw(apiKey, retryPrompt, controller.signal);
//     const secondTry = tryParseAndValidate(rawRetry);
//     if (secondTry.valid) {
//       return secondTry.value;
//     }

//     throw new Error("Gemini returned invalid JSON after retry");
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// function tryParseAndValidate(text: string): { valid: boolean; value: GeminiOutput } {
//   try {
//     const json = JSON.parse(text);
//     const parsed = GeminiOutputSchema.parse(json);
//     return { valid: true, value: parsed };
//   } catch (err) {
//     return { valid: false, value: undefined as unknown as GeminiOutput };
//   }
// }


import { GeminiOutput, GeminiOutputSchema } from "../validation/gemini-schema";

type PromptParts = {
  system: string;
  user: string;
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitize(input: string, maxLen = 4000): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLen);
}

async function callGeminiRaw(
  apiKey: string,
  prompt: PromptParts,
  abortSignal: AbortSignal
): Promise<string> {
  // ✅ FIX: The request body is now structured correctly with `systemInstruction`.
  const body = {
    systemInstruction: {
      parts: [{ text: prompt.system }],
    },
    contents: [{ role: "user", parts: [{ text: prompt.user }] }],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  };

  const res = await fetch(
    `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortSignal,
    }
  );

  if (!res.ok) {
    // Added detailed error logging for better debugging.
    const errorBody = await res.text();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Gemini HTTP ${res.status}`);
  }

  const data = await res.json();

  // Added handling for empty or blocked responses.
  if (!data.candidates || data.candidates.length === 0) {
    console.error(
      "Gemini API returned no candidates. Response:",
      JSON.stringify(data)
    );
    if (data.promptFeedback) {
      console.error("Prompt Feedback:", data.promptFeedback);
      throw new Error(
        `Gemini request blocked. Reason: ${data.promptFeedback.blockReason}`
      );
    }
    throw new Error("Gemini returned an empty or invalid response.");
  }

  const text = data.candidates[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function generateCareerFlowchart(
  prompt: PromptParts
): Promise<GeminiOutput> {
  // ✅ FIX: API Key is now securely accessed from environment variables.
  // Make sure to set GEMINI_API_KEY in your .env.local file.
  const apiKey = process.env.GEMINI_API_KEY;

  console.log(
    "Gemini service called with API key:",
    !!apiKey,
    "Length:",
    apiKey?.length || 0
  );
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured in environment variables");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 15-second timeout
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
      user: sanitize(
        `${prompt.user}\n\nYour previous output was invalid. You must return ONLY strict JSON that matches the schema. No markdown or explanations.`
      ),
    };

    // Backoff and retry
    await sleep(800);
    const rawRetry = await callGeminiRaw(
      apiKey,
      retryPrompt,
      controller.signal
    );
    const secondTry = tryParseAndValidate(rawRetry);
    if (secondTry.valid) {
      return secondTry.value;
    }

    console.error(
      "Failed to parse Gemini output after retry. Final raw output:",
      rawRetry
    );
    throw new Error("Gemini returned invalid JSON after retry");
  } finally {
    clearTimeout(timeout);
  }
}

function tryParseAndValidate(text: string): {
  valid: boolean;
  value: GeminiOutput;
} {
  try {
    const json = JSON.parse(text);
    const parsed = GeminiOutputSchema.parse(json);
    return { valid: true, value: parsed };
  } catch (err) {
    console.error("Failed to parse or validate Gemini JSON output:", err);
    console.log("Raw text that failed parsing:", text);
    return { valid: false, value: undefined as unknown as GeminiOutput };
  }
}