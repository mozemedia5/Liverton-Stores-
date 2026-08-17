import { and, asc, eq, or, isNull, lte, gte } from "drizzle-orm";
import {
  storefrontBanners,
  type InsertStorefrontBanner,
} from "../drizzle/schema";
import { getDb } from "./db";

export async function listPublishedBanners() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(storefrontBanners)
    .where(
      and(
        eq(storefrontBanners.status, "published"),
        or(isNull(storefrontBanners.startsAt), lte(storefrontBanners.startsAt, now)),
        or(isNull(storefrontBanners.endsAt), gte(storefrontBanners.endsAt, now))
      )
    )
    .orderBy(asc(storefrontBanners.position), asc(storefrontBanners.id));
}

export async function listAllBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(storefrontBanners).orderBy(asc(storefrontBanners.position), asc(storefrontBanners.id));
}

export async function createStorefrontBanner(input: InsertStorefrontBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(storefrontBanners).values(input);
  const rows = await db.select().from(storefrontBanners).where(eq(storefrontBanners.slug, input.slug)).limit(1);
  return rows[0];
}

export async function updateStorefrontBanner(id: number, input: Partial<InsertStorefrontBanner>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(storefrontBanners).set(input).where(eq(storefrontBanners.id, id));
  const rows = await db.select().from(storefrontBanners).where(eq(storefrontBanners.id, id)).limit(1);
  return rows[0];
}
