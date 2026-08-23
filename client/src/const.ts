import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function startLogin(provider: "google" | "apple" = "google") {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Add VITE_FIREBASE_CONFIG_JSON in Vercel before signing in.");
  if (provider === "apple") {
    const apple = new OAuthProvider("apple.com");
    apple.addScope("email");
    apple.addScope("name");
    await signInWithPopup(auth, apple);
    return;
  }
  await signInWithPopup(auth, new GoogleAuthProvider());
}
