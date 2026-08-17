import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getSeoConfig } from "../client/src/lib/seo";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("Liverton discoverability contract", () => {
  it("provides distinct SEO configurations for public routes and noindex for unknown paths", () => {
    expect(getSeoConfig("/").title).toContain("Liverton");
    expect(getSeoConfig("/products").kind).toBe("collection");
    expect(getSeoConfig("/support").kind).toBe("support");
    expect(getSeoConfig("/not-a-real-route").noindex).toBe(true);
  });

  it("ships crawlable public resources", () => {
    expect(existsSync(resolve(root, "client/public/robots.txt"))).toBe(true);
    expect(existsSync(resolve(root, "client/public/sitemap.xml"))).toBe(true);
    expect(existsSync(resolve(root, "client/public/llms.txt"))).toBe(true);
    expect(read("client/public/robots.txt")).toContain("Sitemap:");
    expect(read("client/public/sitemap.xml")).toContain("/products");
    expect(read("client/public/llms.txt")).toContain("/api/public/catalog.json");
    expect(read("server/publicCatalog.ts")).toContain("toPublicCatalogProduct");
  });

  it("preserves sensitive boundaries in crawler instructions", () => {
    const robots = read("client/public/robots.txt");
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Disallow: /admin/");
    expect(read("client/index.html")).toContain('rel="canonical"');
    expect(read("client/index.html")).toContain('name="robots" content="index, follow"');
  });

  it("keeps the SPA fallback separate from API and static assets", () => {
    const vercel = read("vercel.json");
    expect(vercel).toContain('"/api/:path*"');
    expect(vercel).toContain('"/(.*)"');
    expect(read("client/src/App.tsx")).toContain("component={NotFound}");
    expect(read("server/_core/index.ts")).toContain("/api/public/catalog.json");
    expect(read("api/index.ts")).toContain("/api/public/catalog.json");
    expect(read("client/src/components/PublicNavigation.tsx")).toContain('aria-label={mobile ? "Mobile primary navigation" : "Primary navigation"}');
    expect(read("client/src/App.tsx")).toContain('role="status"');
  });
});
