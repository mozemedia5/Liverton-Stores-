import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CatalogFilterControls, CatalogStateFeedback } from "../client/src/components/CatalogA11y";
import { PublicNavigationMarkup } from "../client/src/components/PublicNavigation";
import { ProductsPageView } from "../client/src/components/ProductsPageView";
import NotFound from "../client/src/pages/NotFound";
import { getSeoConfig } from "../client/src/lib/seo";

const noop = () => undefined;

describe("Liverton DOM accessibility contracts", () => {
  it("renders loading, error, and empty states with semantic live feedback", () => {
    const loading = renderToStaticMarkup(createElement(CatalogStateFeedback, { isLoading: true, hasError: false, itemCount: 0 }));
    const error = renderToStaticMarkup(createElement(CatalogStateFeedback, { isLoading: false, hasError: true, itemCount: 0 }));
    const empty = renderToStaticMarkup(createElement(CatalogStateFeedback, { isLoading: false, hasError: false, itemCount: 0 }));

    expect(loading).toContain('role="status"');
    expect(loading).toContain("Loading the Liverton collection");
    expect(error).toContain('role="alert"');
    expect(error).toContain("temporarily unavailable");
    expect(empty).toContain('role="status"');
    expect(empty).toContain("No products match this view");
  });

  it("renders filter controls with a truthful aria-pressed state", () => {
    const html = renderToStaticMarkup(
      createElement(CatalogFilterControls, { filters: ["All", "Audio"], currentFilter: "Audio", onSelect: noop })
    );
    expect(html).toContain('aria-label="Filter products"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-pressed="true"');
  });

  it("renders the integrated ProductsPageView loading and empty states", () => {
    const loading = renderToStaticMarkup(createElement(ProductsPageView, {
      arrivals: false,
      header: createElement("div", null, "Discover the future of tech"),
      filters: ["All", "Audio"],
      currentFilter: "All",
      onFilter: noop,
      isLoading: true,
      hasError: false,
      products: [],
      renderProduct: () => null,
    }));
    const empty = renderToStaticMarkup(createElement(ProductsPageView, {
      arrivals: false,
      header: createElement("div", null, "Discover the future of tech"),
      filters: ["All", "Audio"],
      currentFilter: "Audio",
      onFilter: noop,
      isLoading: false,
      hasError: false,
      products: [],
      renderProduct: () => null,
    }));
    const error = renderToStaticMarkup(createElement(ProductsPageView, {
      arrivals: false,
      header: createElement("div", null, "Discover the future of tech"),
      filters: ["All"],
      currentFilter: "All",
      onFilter: noop,
      isLoading: false,
      hasError: true,
      products: [],
      renderProduct: () => null,
    }));
    const ready = renderToStaticMarkup(createElement(ProductsPageView, {
      arrivals: false,
      header: createElement("div", null, "Discover the future of tech"),
      filters: ["All"],
      currentFilter: "All",
      onFilter: noop,
      isLoading: false,
      hasError: false,
      products: [{ id: "buds" }],
      renderProduct: (item: { id: string }) => createElement("article", { "data-product-id": item.id }, "Liverton Buds Pro"),
    }));
    expect(loading).toContain("Loading the Liverton collection");
    expect(loading).toContain('aria-live="polite"');
    expect(empty).toContain("No products match this view");
    expect(empty).toContain('aria-pressed="true"');
    expect(error).toContain('role="alert"');
    expect(error).toContain("temporarily unavailable");
    expect(ready).toContain('data-product-id="buds"');
    expect(ready).toContain("Liverton Buds Pro");
  });

  it("renders the production navigation landmark labels and active page state", () => {
    const html = renderToStaticMarkup(createElement(PublicNavigationMarkup, { location: "/products" }));
    expect(html).toContain('<nav class="desktop-nav" aria-label="Primary navigation">');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("New Arrivals");
  });

  it("renders the actual NotFound page with visible recovery content", () => {
    const html = renderToStaticMarkup(createElement(NotFound));
    expect(html).toContain("404");
    expect(html).toContain("Page Not Found");
    expect(html).toContain('href="/"');
    expect(html).toContain("Go Home");
  });

  it("keeps unknown routes discoverable as noindex while public routes remain indexable", () => {
    expect(getSeoConfig("/not-a-real-route").noindex).toBe(true);
    expect(getSeoConfig("/support").noindex).not.toBe(true);
  });
});
