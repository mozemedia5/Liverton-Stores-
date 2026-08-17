import { describe, expect, it } from "vitest";
import { buildPublicCatalogResponse } from "./publicCatalog";

const product = {
  id: "gid://shopify/Product/1",
  handle: "liverton-buds-pro",
  title: "Liverton Buds Pro",
  description: "Immersive audio for focused work.",
  descriptionHtml: "<p>Private source field</p>",
  productType: "Audio",
  vendor: "Private vendor field",
  tags: ["Bestseller"],
  images: [{ url: "https://cdn.example.com/buds.jpg", altText: "Liverton Buds Pro", width: 600, height: 600 }],
  priceRange: {
    min: { amount: "129", currencyCode: "UGX" },
    max: { amount: "129", currencyCode: "UGX" },
  },
  options: [],
  variants: [{
    id: "gid://shopify/ProductVariant/1",
    title: "Default",
    price: { amount: "129", currencyCode: "UGX" },
    compareAtPrice: null,
    availableForSale: true,
    selectedOptions: [],
  }],
};

describe("public catalog projection", () => {
  it("returns safe public fields with the expected catalog envelope", () => {
    const response = buildPublicCatalogResponse([product]);
    expect(response.brand).toBe("Liverton");
    expect(response.products).toHaveLength(1);
    expect(response.products[0]).toMatchObject({
      handle: "liverton-buds-pro",
      title: "Liverton Buds Pro",
      productType: "Audio",
      availableForSale: true,
    });
    expect(response.products[0]).not.toHaveProperty("vendor");
    expect(response.products[0]).not.toHaveProperty("descriptionHtml");
    expect(response.products[0]).not.toHaveProperty("options");
  });
});
