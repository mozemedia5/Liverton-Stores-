import React, { type ReactNode } from "react";
import { CatalogFilterControls, CatalogStateFeedback } from "@/components/CatalogA11y";

type ProductsPageViewProps = {
  arrivals: boolean;
  header: ReactNode;
  arrivalBanner?: ReactNode;
  filters: string[];
  currentFilter: string;
  onFilter: (filter: string) => void;
  isLoading: boolean;
  hasError: boolean;
  products: Array<{ id: string }>;
  renderProduct: (product: { id: string }) => ReactNode;
};

export function ProductsPageView({ arrivals, header, arrivalBanner, filters, currentFilter, onFilter, isLoading, hasError, products, renderProduct }: ProductsPageViewProps) {
  return <main className="page-wrap">{header}{!arrivals && <CatalogFilterControls filters={filters} currentFilter={currentFilter} onSelect={onFilter} />}{arrivals && arrivalBanner}<CatalogStateFeedback isLoading={isLoading} hasError={hasError} itemCount={products.length} /><div className="product-grid" aria-live="polite">{products.map(product => <React.Fragment key={product.id}>{renderProduct(product)}</React.Fragment>)}</div></main>;
}
