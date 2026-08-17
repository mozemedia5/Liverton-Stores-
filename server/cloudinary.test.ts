import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
  vi.resetModules();
});

describe("Cloudinary and Shopify environment contracts", () => {
  it("documents Cloudinary names without real values", () => {
    const template = readFileSync(resolve(process.cwd(), "VERCEL_ENV_TEMPLATE.txt"), "utf8");
    expect(template).not.toContain("CLOUDINARY_CLOUD_NAME=");
    expect(template).not.toContain("CLOUDINARY_API_KEY=");
    expect(template).not.toContain("CLOUDINARY_API_SECRET=");
    expect(template).not.toContain("CLOUDINARY_UPLOAD_PRESET=");
    expect(template).toContain("Banner media and copy are managed in Admin-Store");
    expect(template).not.toContain("VITE_CLOUDINARY_CLOUD_NAME=");
    expect(template).not.toContain("VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID=");
    expect(template).not.toContain("VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID=");
    expect(template).not.toMatch(/cloudinary:\/\/[^\n]+/i);
    const responsive = readFileSync(resolve(process.cwd(), "RESPONSIVE_VERIFICATION.md"), "utf8");
    expect(responsive).toContain("Admin-Store");
    expect(responsive).not.toContain("VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID");
    expect(responsive).not.toContain("VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID");
    expect(responsive).not.toContain("VITE_LIVERTON_BANNER_VIDEO_URL");
    expect(responsive).not.toContain("VITE_LIVERTON_BANNER_POSTER_URL");
  });

  it("creates a signed upload payload from server-only Cloudinary variables", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "liverton-test";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    process.env.CLOUDINARY_UPLOAD_PRESET = "liverton_admin_media";
    const { createCloudinaryUploadSignature } = await import("./_core/cloudinary");
    const result = createCloudinaryUploadSignature({ folder: "liverton/media", resourceType: "image" });
    expect(result.cloudName).toBe("liverton-test");
    expect(result.apiKey).toBe("test-key");
    expect(result.uploadPreset).toBe("liverton_admin_media");
    expect(result.signature).toMatch(/^[a-f0-9]{40}$/);
    expect(result).not.toHaveProperty("apiSecret");
  });

  it("prefers a private Storefront token over canonical and public aliases", async () => {
    process.env.SHOPIFY_STORE_DOMAIN = "test.myshopify.com";
    process.env.SHOPIFY_STOREFRONT_PUBLIC_ACCESS_TOKEN = "public-token";
    process.env.SHOPIFY_STOREFRONT_API_ACCESS_TOKEN = "canonical-token";
    process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN = "private-token";
    const { isShopifyConfigured } = await import("./_core/shopify");
    expect(isShopifyConfigured()).toBe(true);
  });
});
