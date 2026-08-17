import { doc, getFirestore, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { getFirebaseApp, getFirebaseAuth } from "@/lib/firebase";

export type AppUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

function mapFirebaseUser(user: FirebaseUser, role: "user" | "admin"): AppUser {
  const now = new Date();
  return {
    id: 0,
    openId: user.uid,
    name: user.displayName,
    email: user.email,
    loginMethod: user.providerData[0]?.providerId ?? "firebase",
    role,
    createdAt: new Date(user.metadata.creationTime ?? now),
    updatedAt: now,
    lastSignedIn: now,
  };
}

async function resolveAppUser(user: FirebaseUser): Promise<AppUser> {
  const token = await user.getIdTokenResult();
  const claimRole = token.claims.admin === true ? "admin" : "user";
  const app = getFirebaseApp();
  if (!app) return mapFirebaseUser(user, claimRole);
  const profileRef = doc(getFirestore(app), "users", user.uid);
  const profile = await getDoc(profileRef);
  const data = profile.data() as { role?: "user" | "admin" } | undefined;
  const role = claimRole === "admin" || data?.role === "admin" ? "admin" : "user";
  if (!profile.exists()) {
    await setDoc(profileRef, {
      uid: user.uid,
      name: user.displayName ?? null,
      email: user.email ?? null,
      role,
      loginMethod: user.providerData[0]?.providerId ?? "firebase",
      createdAt: serverTimestamp(),
      lastSignedIn: serverTimestamp(),
    });
  }
  return mapFirebaseUser(user, role);
}

export function useAuth(_options?: { redirectOnUnauthenticated?: boolean; redirectPath?: string }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setError(new Error("VITE_FIREBASE_CONFIG_JSON is not configured"));
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async firebaseUser => {
      setLoading(true);
      setError(null);
      try {
        setUser(firebaseUser ? await resolveAppUser(firebaseUser) : null);
      } catch (nextError) {
        setUser(null);
        setError(nextError);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const logout = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, error, isAuthenticated: Boolean(user), refresh: async () => undefined, logout };
}
