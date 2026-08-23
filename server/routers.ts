import { publicProcedure, router } from "./_core/trpc";
import { getFirebaseAdmin } from "./firebaseAdmin";
import { z } from "zod";
import { commerceRouter } from "./routerModules/commerce";
import { CONTACT_EMAIL } from "@shared/contact";
import { cloudinaryRouter } from "./routerModules/cloudinary";
import { storefrontContentRouter } from "./routerModules/storefrontContent";
import { usersRouter } from "./routerModules/users";
import { generateHannaReply } from "./hanna";

export const appRouter = router({
  commerce: commerceRouter,
  cloudinary: cloudinaryRouter,
  storefrontContent: storefrontContentRouter,
  users: usersRouter,
  contact: publicProcedure
    .input(z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().email().max(320),
      subject: z.string().trim().min(2).max(180),
      message: z.string().trim().min(10).max(5000),
      channel: z.enum(["email", "whatsapp"]),
    }))
    .mutation(async ({ input }) => {
      const { firestore } = getFirebaseAdmin();
      await firestore.collection("contact_messages").add({ ...input, createdAt: new Date() });
      return { stored: true, delivered: false, destination: input.channel === "email" ? CONTACT_EMAIL : "+256705954597" };
    }),
  hanna: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })).min(1).max(30) }))
      .mutation(({ input }) => generateHannaReply(input.messages)),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
