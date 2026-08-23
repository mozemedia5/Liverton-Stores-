import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(role: "user" | "admin" = "user"): AuthenticatedUser {
  return {
    id: 1,
    openId: "non-admin-test-user",
    email: "non-admin@example.com",
    name: "Non-admin Test User",
    loginMethod: "firebase",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

function makeCtx(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("admin authorization", () => {
  it("rejects an authenticated non-admin from listing users", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser("user")));
    await expect(caller.users.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects an authenticated non-admin from changing roles", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser("user")));
    await expect(
      caller.users.setRole({ openId: "another-user", role: "admin" }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("rejects an anonymous caller from admin procedures", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.users.list()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
