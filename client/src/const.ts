import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function startLogin() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Add VITE_FIREBASE_CONFIG_JSON in Vercel before signing in.");
  await signInWithPopup(auth, new GoogleAuthProvider());
}
