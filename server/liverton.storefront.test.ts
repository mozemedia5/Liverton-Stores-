import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("Liverton storefront contract", () => {
  const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

  it("uses Liverton branding throughout the application shell", () => {
    expect(app).toContain("Liverton");
  });

  it("includes the requested public routes", () => {
    for (const route of ["/products", "/new-arrivals", "/about", "/innovation", "/solutions", "/support", "/shop", "/status", "/privacy", "/terms"]) {
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

  it("supports storefront interactions and brand layout contracts", () => {
    expect(app).toContain("liverton-cart-updated");
    expect(app).toContain("translateY(${shift}px)");
    expect(app).toContain("remoteTitles");
    expect(readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8")).toContain("grid-template-columns:1fr 1.8fr");
  });
});
