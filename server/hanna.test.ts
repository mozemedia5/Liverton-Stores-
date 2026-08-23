import { afterEach, describe, expect, it, vi } from "vitest";
import { generateHannaReply, isHannaConfigured } from "./hanna";

describe("Hanna Gemini integration", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.HANNA_GEMINI_MODEL;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.HANNA_GEMINI_MODEL;
    else process.env.HANNA_GEMINI_MODEL = originalModel;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reports whether a server-side Gemini key is configured", () => {
    process.env.GEMINI_API_KEY = "test-key";
    expect(isHannaConfigured()).toBe(true);
    delete process.env.GEMINI_API_KEY;
    expect(isHannaConfigured()).toBe(false);
  });

  it("sends the conversation to Gemini and extracts the assistant text", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.HANNA_GEMINI_MODEL = "test-model";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "Hanna is ready to help." }] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateHannaReply([
      { role: "system", content: "You are Hanna." },
      { role: "user", content: "Can you help me choose a device?" },
    ])).resolves.toBe("Hanna is ready to help.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v1beta/models/test-model:generateContent");
    expect((init.headers as Record<string, string>)["x-goog-api-key"]).toBe("test-key");
    expect(JSON.parse(String(init.body))).toMatchObject({
      contents: [{ role: "user", parts: [{ text: "Can you help me choose a device?" }] }],
    });
  });

  it("fails clearly when no Gemini key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateHannaReply([{ role: "user", content: "Hello" }])).rejects.toThrow("GEMINI_API_KEY");
  });
});
