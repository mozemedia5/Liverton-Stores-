import type { User } from "../drizzle/schema.js";
import { getFirebaseAdmin } from "./firebaseAdmin.js";

function asDate(value: unknown, fallback = new Date()) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate() as Date;
  if (value instanceof Date) return value;
  return fallback;
}

function mapUser(id: string, data: FirebaseFirestore.DocumentData): User {
  const now = new Date();
  return {
    id: 0,
    openId: id,
    name: data.name ?? null,
    email: data.email ?? null,
    loginMethod: data.loginMethod ?? "firebase",
    role: data.role === "admin" ? "admin" : "user",
    createdAt: asDate(data.createdAt, now),
    updatedAt: asDate(data.updatedAt, now),
    lastSignedIn: asDate(data.lastSignedIn, now),
  } as User;
}

export async function listFirebaseUsers(): Promise<User[]> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("users").orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => mapUser(doc.id, doc.data()));
}

export async function updateFirebaseUserRole(openId: string, role: "user" | "admin") {
  const { auth, firestore } = getFirebaseAdmin();
  const authUser = await auth.getUser(openId);
  const existingClaims = { ...(authUser.customClaims ?? {}) };
  if (role === "admin") existingClaims.admin = true;
  else delete existingClaims.admin;
  await auth.setCustomUserClaims(openId, existingClaims);
  const ref = firestore.collection("users").doc(openId);
  await ref.set({ role, updatedAt: new Date() }, { merge: true });
  const snapshot = await ref.get();
  return snapshot.exists ? mapUser(snapshot.id, snapshot.data() ?? {}) : null;
}

export type FirebaseBanner = {
  id: string;
  slug: string;
  kind: "image" | "video" | "announcement";
  title: string;
  body: string | null;
  actionLabel: string | null;
  href: string | null;
  mediaUrl: string | null;
  posterUrl: string | null;
  cloudinaryPublicId: string | null;
  status: "draft" | "published" | "archived";
  position: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapBanner(id: string, data: FirebaseFirestore.DocumentData): FirebaseBanner {
  const now = new Date();
  return {
    id,
    slug: data.slug ?? id,
    kind: data.kind ?? "image",
    title: data.title ?? "Untitled banner",
    body: data.body ?? null,
    actionLabel: data.actionLabel ?? null,
    href: data.href ?? null,
    mediaUrl: data.mediaUrl ?? null,
    posterUrl: data.posterUrl ?? null,
    cloudinaryPublicId: data.cloudinaryPublicId ?? null,
    status: data.status ?? "draft",
    position: Number(data.position ?? 0),
    startsAt: data.startsAt ? asDate(data.startsAt) : null,
    endsAt: data.endsAt ? asDate(data.endsAt) : null,
    createdBy: data.createdBy ?? null,
    createdAt: asDate(data.createdAt, now),
    updatedAt: asDate(data.updatedAt, now),
  };
}

export async function listFirebaseBanners(publishedOnly = false): Promise<FirebaseBanner[]> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("storefront_banners").orderBy("position", "asc").get();
  const now = Date.now();
  return snapshot.docs.map(doc => mapBanner(doc.id, doc.data())).filter(banner => {
    if (!publishedOnly) return true;
    return banner.status === "published" && (!banner.startsAt || banner.startsAt.getTime() <= now) && (!banner.endsAt || banner.endsAt.getTime() >= now);
  });
}

export async function createFirebaseBanner(input: Omit<FirebaseBanner, "id" | "createdAt" | "updatedAt">) {
  const { firestore } = getFirebaseAdmin();
  const ref = firestore.collection("storefront_banners").doc();
  const now = new Date();
  await ref.set({ ...input, createdAt: now, updatedAt: now });
  return mapBanner(ref.id, { ...input, createdAt: now, updatedAt: now });
}

export async function updateFirebaseBanner(id: string, input: Partial<Omit<FirebaseBanner, "id" | "createdAt" | "updatedAt">>) {
  const { firestore } = getFirebaseAdmin();
  const ref = firestore.collection("storefront_banners").doc(id);
  await ref.set({ ...input, updatedAt: new Date() }, { merge: true });
  const snapshot = await ref.get();
  return snapshot.exists ? mapBanner(snapshot.id, snapshot.data() ?? {}) : null;
}
