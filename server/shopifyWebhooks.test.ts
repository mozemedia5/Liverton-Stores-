import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyShopifyWebhook } from "./shopifyWebhooks";

describe("Shopify webhook verification", () => {
  const secret = "test-webhook-secret";
  const body = Buffer.from(JSON.stringify({ id: 123, updated_at: "2026-08-23T00:00:00Z" }));
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64");

  it("accepts a valid HMAC over the raw payload", () => {
    expect(verifyShopifyWebhook(body, signature, secret)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    expect(verifyShopifyWebhook(Buffer.from(`${body.toString()} `), signature, secret)).toBe(false);
  });

  it("rejects an invalid or missing signature", () => {
    expect(verifyShopifyWebhook(body, "not-a-signature", secret)).toBe(false);
    expect(verifyShopifyWebhook(body, undefined, secret)).toBe(false);
    expect(verifyShopifyWebhook(body, signature, "")).toBe(false);
  });
});
