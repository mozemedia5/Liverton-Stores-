import { afterEach, describe, expect, it, vi } from "vitest";
import { buildHannaCatalogContext, generateHannaReply, isHannaConfigured } from "./hanna";
import type { Product } from "../shared/commerce/types";

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

  it("builds exact product and category links from live catalog data", () => {
    const product = {
      id: "gid://shopify/Product/1",
      handle: "buds-pro",
      title: "Liverton Buds Pro",
      description: "Noise-cancelling wireless earbuds.",
      descriptionHtml: "<p>Noise-cancelling wireless earbuds.</p>",
      productType: "Audio",
      vendor: "Liverton",
      tags: ["New"],
      images: [{ url: "https://cdn.example.com/buds.png", altText: "Black earbuds", width: 600, height: 600 }],
      priceRange: {
        min: { amount: "129.00", currencyCode: "USD" },
        max: { amount: "129.00", currencyCode: "USD" },
      },
      options: [],
      variants: [{
        id: "gid://shopify/ProductVariant/1",
        title: "Default",
        price: { amount: "129.00", currencyCode: "USD" },
        compareAtPrice: null,
        availableForSale: true,
        selectedOptions: [],
      }],
    } as Product;
    const context = buildHannaCatalogContext({
      products: [product],
      sourceStatus: { products: "available", collections: "available", banners: "available" },
    });
    expect(context).toContain("[Liverton Buds Pro](/product/buds-pro)");
    expect(context).toContain("[Browse Audio](/products?category=Audio)");
    expect(context).toContain("https://cdn.example.com/buds.png");
    expect(context).toContain("Shopify products: available");
  });

  it("adds a matching product image as inline Gemini context for visual questions", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.HANNA_GEMINI_MODEL = "test-model";
    const product = {
      id: "gid://shopify/Product/1",
      handle: "buds-pro",
      title: "Liverton Buds Pro",
      description: "Noise-cancelling wireless earbuds.",
      descriptionHtml: "<p>Noise-cancelling wireless earbuds.</p>",
      productType: "Audio",
      vendor: "Liverton",
      tags: [],
      images: [{ url: "https://cdn.example.com/buds.png", altText: "Black earbuds", width: 600, height: 600 }],
      priceRange: {
        min: { amount: "129.00", currencyCode: "USD" },
        max: { amount: "129.00", currencyCode: "USD" },
      },
      options: [],
      variants: [{
        id: "gid://shopify/ProductVariant/1",
        title: "Default",
        price: { amount: "129.00", currencyCode: "USD" },
        compareAtPrice: null,
        availableForSale: true,
        selectedOptions: [],
      }],
    } as Product;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(Buffer.from("small-image"), { status: 200, headers: { "Content-Type": "image/png" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "The image shows a compact black earbud design." }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(generateHannaReply([{ role: "user", content: "What does the Buds Pro look like?" }], { products: [product] })).resolves.toContain("compact black");
    const [, geminiInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(String(geminiInit.body)) as { contents: Array<{ parts: Array<{ inlineData?: { mimeType: string; data: string } }> }> };
    expect(body.contents[0].parts.some(part => part.inlineData?.mimeType === "image/png" && part.inlineData.data.length > 0)).toBe(true);
  });

  it("fails clearly when no Gemini key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateHannaReply([{ role: "user", content: "Hello" }])).rejects.toThrow("GEMINI_API_KEY");
  });
});
