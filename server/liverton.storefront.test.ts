import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("Liverton storefront contract", () => {
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
  const contact = readFileSync(resolve(process.cwd(), "shared/contact.ts"), "utf8");

  it("uses Liverton branding throughout the application shell", () => {
    expect(app).toContain("Liverton");
  });

  it("includes the requested public routes", () => {
    for (const route of ["/products", "/new-arrivals", "/about", "/innovation", "/solutions", "/support", "/contact", "/shop", "/status", "/privacy", "/terms"]) {
      expect(app).toContain(`path=\"${route}\"`);
    }
  });

  it("keeps at least nine catalog items in the storefront data", () => {
    expect((app.match(/title: \"Liverton/g) ?? []).length).toBeGreaterThanOrEqual(9);
  });

  it("ships installable PWA assets and install behavior", () => {
    expect(existsSync(resolve(process.cwd(), "client/public/manifest.json"))).toBe(true);
    expect(existsSync(resolve(process.cwd(), "client/public/sw.js"))).toBe(true);
    expect(app).toContain("beforeinstallprompt");
    expect(app).toContain("InstallBanner");
  });

  it("supports storefront interactions, contact delivery, and banner slots", () => {
    expect(app).toContain("const { itemCount } = useCart()");
    expect(app).not.toContain("liverton-local-cart");
    expect(app).toContain("translateY(${shift}px)");
    expect(app).toContain("featuredShopify");
    expect(app).toContain("useShopifyCatalogSync");
    expect(contact).toContain("livertoncodes@gmail.com");
    expect(app).toContain("+256 705 954 597");
    expect(app).toContain("publishedBanners");
    expect((app.match(/className=\"dashboard-banners\"/g) ?? []).length).toBe(1);
    expect(app).toContain('className="announcement"');
    expect(app).not.toContain('className="dashboard"');
    expect(readFileSync(resolve(process.cwd(), "VERCEL_ENV_TEMPLATE.txt"), "utf8")).toContain("VITE_FIREBASE_CONFIG_JSON=");
    expect(readFileSync(resolve(process.cwd(), "VERCEL_ENV_TEMPLATE.txt"), "utf8")).not.toContain("shpat_");
    expect(readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8")).toContain("grid-template-columns:1fr 1.8fr");
    expect(readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8")).toContain(".contact-layout");
  });
});
