import { getFirebaseAdmin } from "./firebaseAdmin";

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

function asDate(value: unknown, fallback = new Date()) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate() as Date;
  if (value instanceof Date) return value;
  return fallback;
}

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

export async function listPublishedFirebaseBanners(): Promise<FirebaseBanner[]> {
  const { firestore } = getFirebaseAdmin();
  const snapshot = await firestore.collection("storefront_banners").orderBy("position", "asc").get();
  const now = Date.now();
  return snapshot.docs.map(doc => mapBanner(doc.id, doc.data())).filter(banner => banner.status === "published" && (!banner.startsAt || banner.startsAt.getTime() <= now) && (!banner.endsAt || banner.endsAt.getTime() >= now));
}
