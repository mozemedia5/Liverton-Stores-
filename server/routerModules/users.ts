import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc.js";
import { listFirebaseUsers, updateFirebaseUserRole } from "../firebaseData.js";

export const usersRouter = router({
  list: adminProcedure.query(async () => listFirebaseUsers()),
  setRole: adminProcedure
    .input(z.object({ openId: z.string().trim().min(1).max(128), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.openId === input.openId && input.role !== "admin") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot remove your own admin access." });
      }

      const updated = await updateFirebaseUserRole(input.openId, input.role);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "The selected user was not found." });
      }

      return updated;
    }),
});
