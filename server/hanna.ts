export type HannaMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

const DEFAULT_MODEL = "gemini-3.6-flash";
const LIVERTON_SYSTEM_INSTRUCTION = `You are Hanna, the warm and practical AI support agent for Liverton Stores.
Help customers choose products, understand product details, delivery, returns, warranty, accessibility, and general store questions.
Use only the information present in the conversation and the product context supplied by the customer. Never invent order status, prices, stock, delivery dates, policies, discounts, or account information.
If a question requires private order information or a human decision, say that you cannot access it and direct the customer to the Liverton Support page or Contact page.
Keep replies concise, clear, and friendly. Ask one focused follow-up question when essential information is missing.`;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "";
}

export function isHannaConfigured() {
  return Boolean(getGeminiApiKey());
}

function toGeminiContents(messages: HannaMessage[]) {
  return messages
    .filter(message => message.role !== "system" && message.content.trim())
    .slice(-20)
    .map(message => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content.trim().slice(0, 4000) }],
    }));
}

export async function generateHannaReply(messages: HannaMessage[]) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Hanna AI is not configured. Add GEMINI_API_KEY to the Vercel project environment.");
  }

  const contents = toGeminiContents(messages);
  if (!contents.length) {
    throw new Error("Hanna needs a customer message before it can respond.");
  }

  const model = process.env.HANNA_GEMINI_MODEL?.trim() || process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: LIVERTON_SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 600,
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) {
    console.error("[Hanna] Gemini request failed", response.status, payload.error?.message ?? "unknown error");
    throw new Error("Hanna could not connect to Gemini right now. Please try again shortly.");
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? "")
    .join(" ")
    .trim();
  if (!text) {
    console.warn("[Hanna] Gemini returned no text", payload.promptFeedback?.blockReason, payload.candidates?.[0]?.finishReason);
    throw new Error("Hanna could not produce a response for that message. Please try asking another way.");
  }
  return text;
}
