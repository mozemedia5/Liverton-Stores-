export type SeoProduct = {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  type: string;
};

type SeoConfig = {
  title: string;
  description: string;
  kind: "website" | "collection" | "support" | "utility";
  noindex?: boolean;
};

const routeSeo: Record<string, SeoConfig> = {
  "/": {
    title: "Nexus Store — Fashion that moves with you",
    description: "Discover thoughtfully designed Nexus Store fashion and apparel, from everyday layers and tailoring to dresses, shoes, and bags.",
    kind: "website",
  },
  "/products": {
    title: "Products — Nexus Store",
    description: "Explore the Nexus Store collection of women’s, men’s, dresses, shoes, bags, and everyday apparel.",
    kind: "collection",
  },
  "/new-arrivals": {
    title: "New Arrivals — Nexus Store",
    description: "Meet the newest Nexus Store products, with fresh ideas for familiar daily rituals.",
    kind: "collection",
  },
  "/shop": {
    title: "Shop — Nexus Store",
    description: "Shop Nexus Store fashion and find considered pieces for work, weekends, movement, and evenings.",
    kind: "collection",
  },
  "/about": {
    title: "About Nexus Store — Fashion with intention",
    description: "Learn how Nexus Store curates fashion that feels good to wear, live in, and return to every day.",
    kind: "website",
  },
  "/innovation": {
    title: "Innovation — Nexus Store Labs",
    description: "Explore the Nexus Store point of view on personal style, considered materials, and modern dressing.",
    kind: "website",
  },
  "/solutions": {
    title: "Solutions — Nexus Store",
    description: "Nexus Store makes it easier to find thoughtful fashion and apparel for every category of life.",
    kind: "website",
  },
  "/support": {
    title: "Support — Nexus Store",
    description: "Find Nexus Store setup, delivery, warranty, returns, and product support with help from Hanna.",
    kind: "support",
  },
  "/contact": {
    title: "Contact Nexus Store",
    description: "Contact the Nexus Store team by email or WhatsApp without leaving the storefront.",
    kind: "website",
  },
  "/status": {
    title: "Service Status — Nexus Store",
    description: "Check the current operating status of Nexus Store storefront, checkout, support, and delivery services.",
    kind: "utility",
  },
  "/privacy": {
    title: "Privacy Policy — Nexus Store",
    description: "Read how Nexus Store uses information to provide products, process orders, and improve support.",
    kind: "utility",
  },
  "/terms": {
    title: "Terms of Service — Nexus Store",
    description: "Read the clear, practical terms for using Nexus Store products and services.",
    kind: "utility",
  },
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function upsertJsonLd(value: unknown) {
  let script = document.head.querySelector<HTMLScriptElement>("script[data-liverton-jsonld]");
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.livertonJsonld = "true";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
}

export function getSeoConfig(pathname: string): SeoConfig {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (routeSeo[normalized]) return routeSeo[normalized];
  if (/^\/product\/[^/]+$/.test(normalized)) return { title: "Product details — Nexus Store", description: "Explore detailed product information, reviews, variants, and secure checkout at Nexus Store.", kind: "website" };
  if (normalized === "/account") return { title: "Your account — Nexus Store", description: "Sign in or create a Nexus Store account, manage orders, and get customer support.", kind: "website" };
  if (normalized === "/checkout") return { title: "Checkout — Nexus Store", description: "Review your Nexus Store collection and continue to secure checkout.", kind: "utility" };
  if (normalized === "/track-order") return { title: "Track your order — Nexus Store", description: "Find the latest delivery information for your Nexus Store order.", kind: "utility" };
  return { title: "Page not found — Nexus Store", description: "The Nexus Store page you requested could not be found.", kind: "utility", noindex: true };
}

export function applySeo(pathname: string, products: SeoProduct[] = []) {
  if (typeof document === "undefined") return;
  const config = getSeoConfig(pathname);
  const origin = window.location.origin;
  const canonicalPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const canonical = `${origin}${canonicalPath}`;
  const pageName = config.title.replace(/ — Nexus Store$/, "");

  document.documentElement.lang = "en";
  document.title = config.title;
  upsertMeta("name", "description", config.description);
  upsertMeta("name", "robots", config.noindex ? "noindex, follow" : "index, follow");
  upsertMeta("property", "og:title", config.title);
  upsertMeta("property", "og:description", config.description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", canonical);
  upsertMeta("property", "og:site_name", "Nexus Store");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", config.title);
  upsertMeta("name", "twitter:description", config.description);
  upsertLink("canonical", canonical);

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
    ...(pathname !== "/" ? [{ "@type": "ListItem", position: 2, name: pageName, item: canonical }] : []),
  ];
  const structured: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Nexus Store",
      url: origin,
      description: "Thoughtfully designed fashion and apparel for everyday life.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: config.title,
      description: config.description,
      url: canonical,
      isPartOf: { "@type": "WebSite", name: "Nexus Store", url: origin },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    },
  ];

  if (config.kind === "collection") {
    structured.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pageName,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${origin}/products#${product.id}`,
        item: {
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.image,
          category: product.type,
          offers: { "@type": "Offer", priceCurrency: "UGX", price: product.price, availability: "https://schema.org/InStock", url: `${origin}/products#${product.id}` },
        },
      })),
    });
  }

  if (config.kind === "support") {
    structured.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        ["Set up a new Nexus Store device", "Power on your device and follow the on-screen setup wizard."],
        ["What is the warranty period?", "Every Nexus Store product includes a standard two-year warranty."],
        ["How do I track my order?", "Open your order confirmation and choose Track order for carrier updates."],
        ["Can I return a product?", "Start a return within 30 days and Nexus Store will guide you through the next steps."],
      ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
    });
  }

  upsertJsonLd({ "@context": "https://schema.org", "@graph": structured });
}
