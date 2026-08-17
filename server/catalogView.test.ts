import { describe, expect, it } from "vitest";
import { getCatalogUiState, isFilterPressed } from "../client/src/lib/catalogView";

describe("catalog accessibility states", () => {
  it("prioritizes loading feedback", () => {
    expect(getCatalogUiState({ isLoading: true, hasError: false, itemCount: 0 })).toBe("loading");
  });

  it("reports an error only when no fallback items exist", () => {
    expect(getCatalogUiState({ isLoading: false, hasError: true, itemCount: 0 })).toBe("error");
    expect(getCatalogUiState({ isLoading: false, hasError: true, itemCount: 9 })).toBe("ready");
  });

  it("reports empty and ready states predictably", () => {
    expect(getCatalogUiState({ isLoading: false, hasError: false, itemCount: 0 })).toBe("empty");
    expect(getCatalogUiState({ isLoading: false, hasError: false, itemCount: 1 })).toBe("ready");
  });

  it("drives the filter aria-pressed contract", () => {
    expect(isFilterPressed("All", "All")).toBe(true);
    expect(isFilterPressed("All", "Audio")).toBe(false);
  });
});
