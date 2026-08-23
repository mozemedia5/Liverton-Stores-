import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { getFirebaseApp } from "@/lib/firebase";

/**
 * Shopify remains the source of truth. This listener only receives an
 * invalidation signal written by the verified webhook handler; it never trusts
 * product data from the browser or from the webhook payload.
 */
export function useShopifyCatalogSync(onChange: () => void) {
  useEffect(() => {
    const app = getFirebaseApp();
    if (!app) return;
    const syncRef = doc(getFirestore(app), "shopify_sync", "catalog");
    return onSnapshot(syncRef, snapshot => {
      if (snapshot.exists()) onChange();
    }, error => {
      console.warn("[Shopify sync] Catalog listener unavailable", error);
    });
  }, [onChange]);
}
