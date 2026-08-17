import React from "react";
import { getCatalogUiState, isFilterPressed } from "@/lib/catalogView";

type CatalogStateProps = {
  isLoading: boolean;
  hasError: boolean;
  itemCount: number;
};

export function CatalogStateFeedback({ isLoading, hasError, itemCount }: CatalogStateProps) {
  const state = getCatalogUiState({ isLoading, hasError, itemCount });
  if (state === "loading") return <p role="status">Loading the Liverton collection…</p>;
  if (state === "error") return <p className="form-error" role="alert">The live catalog is temporarily unavailable. Showing the Liverton collection available in this storefront.</p>;
  if (state === "empty") return <div className="empty-state" role="status"><h3>No products match this view.</h3><p>Try another category or explore the full collection.</p></div>;
  return null;
}

export function CatalogFilterControls({ filters, currentFilter, onSelect }: { filters: string[]; currentFilter: string; onSelect: (filter: string) => void }) {
  return <div className="filter-row" aria-label="Filter products">{filters.map(filter => <button key={filter} className={currentFilter === filter ? "filter active" : "filter"} aria-pressed={isFilterPressed(currentFilter, filter)} onClick={() => onSelect(filter)}>{filter}</button>)}</div>;
}
