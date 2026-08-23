import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema.js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function asDate(value: unknown, fallback = new Date()) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate() as Date;
  if (value instanceof Date) return value;
  return fallback;
}

async function authenticateFirebaseRequest(req: CreateExpressContextOptions["req"]): Promise<User | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return null;

  try {
    const { getFirebaseAdmin } = await import("../firebaseAdmin.js");
    const { auth, firestore } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    const profileRef = firestore.collection("users").doc(decoded.uid);
    const profileSnapshot = await profileRef.get();
    const profile = profileSnapshot.exists ? profileSnapshot.data() ?? {} : {};
    // Firestore profile fields are user-editable metadata; only a verified,
    // server-managed custom claim may grant administrator access.
    const role = decoded.email_verified === true && decoded.admin === true ? "admin" : "user";
    const now = new Date();

    if (!profileSnapshot.exists) {
      await profileRef.set({
        uid: decoded.uid,
        name: decoded.name ?? null,
        email: decoded.email ?? null,
        role,
        loginMethod: decoded.firebase?.sign_in_provider ?? "firebase",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      });
    } else {
      await profileRef.set({ lastSignedIn: now, updatedAt: now }, { merge: true });
    }

    return {
      id: 0,
      openId: decoded.uid,
      name: (profile.name as string | null | undefined) ?? decoded.name ?? null,
      email: (profile.email as string | null | undefined) ?? decoded.email ?? null,
      loginMethod: (profile.loginMethod as string | undefined) ?? decoded.firebase?.sign_in_provider ?? "firebase",
      role,
      createdAt: asDate(profile.createdAt, now),
      updatedAt: asDate(profile.updatedAt, now),
      lastSignedIn: now,
    } as User;
  } catch {
    return null;
  }
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: await authenticateFirebaseRequest(opts.req),
  };
}
