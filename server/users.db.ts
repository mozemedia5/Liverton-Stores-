import { desc, eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      loginMethod: users.loginMethod,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function updateUserRole(openId: string, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return undefined;

  await db.update(users).set({ role }).where(eq(users.openId, openId));
  const result = await db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      loginMethod: users.loginMethod,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result[0];
}
