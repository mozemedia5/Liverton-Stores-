export type CatalogUiState = "loading" | "error" | "empty" | "ready";

export function getCatalogUiState(input: {
  isLoading: boolean;
  hasError: boolean;
  itemCount: number;
}): CatalogUiState {
  if (input.isLoading) return "loading";
  if (input.hasError && input.itemCount === 0) return "error";
  if (input.itemCount === 0) return "empty";
  return "ready";
}

export function isFilterPressed(currentFilter: string, filter: string): boolean {
  return currentFilter === filter;
}
