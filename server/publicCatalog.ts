import type { Product } from "../shared/commerce/types";

export function toPublicCatalogProduct(product: Product) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    productType: product.productType,
    tags: product.tags,
    images: product.images.map(image => ({
      url: image.url,
      altText: image.altText,
      width: image.width,
      height: image.height,
    })),
    priceRange: product.priceRange,
    availableForSale: product.variants.some(variant => variant.availableForSale),
    variants: product.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      availableForSale: variant.availableForSale,
      selectedOptions: variant.selectedOptions,
    })),
  };
}

export function buildPublicCatalogResponse(products: Product[]) {
  return {
    brand: "Liverton",
    source: "Shopify Storefront catalog",
    updatedAt: new Date().toISOString(),
    products: products.map(toPublicCatalogProduct),
  };
}
