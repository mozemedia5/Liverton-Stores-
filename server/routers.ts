import { publicProcedure, router } from "./_core/trpc.js";
import { z } from "zod";
import { commerceRouter } from "./routerModules/commerce.js";
import { listAllCollections, listAllProducts } from "./_core/shopify.js";
import { listFirebaseBanners } from "./firebaseData.js";
import { CONTACT_EMAIL } from "../shared/contact.js";
import { cloudinaryRouter } from "./routerModules/cloudinary.js";
import { storefrontContentRouter } from "./routerModules/storefrontContent.js";
import { usersRouter } from "./routerModules/users.js";
import { generateHannaReply, type HannaCatalogContext } from "./hanna.js";

async function loadHannaCatalog(): Promise<HannaCatalogContext> {
  const [productsResult, collectionsResult, bannersResult] = await Promise.allSettled([
    listAllProducts(),
    listAllCollections(),
    listFirebaseBanners(true),
  ]);
  return {
    products: productsResult.status === "fulfilled" ? productsResult.value : [],
    collections: collectionsResult.status === "fulfilled" ? collectionsResult.value : [],
    banners: bannersResult.status === "fulfilled" ? bannersResult.value : [],
    sourceStatus: {
      products: productsResult.status === "fulfilled" ? "available" : "unavailable",
      collections: collectionsResult.status === "fulfilled" ? "available" : "unavailable",
      banners: bannersResult.status === "fulfilled" ? "available" : "unavailable",
    },
  };
}

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
      const { getFirebaseFirestore } = await import("./firebaseFirestore.js");
      const { firestore } = getFirebaseFirestore();
      await firestore.collection("contact_messages").add({ ...input, createdAt: new Date() });
      return { stored: true, delivered: false, destination: input.channel === "email" ? CONTACT_EMAIL : "+256705954597" };
    }),
  hanna: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() })).min(1).max(30) }))
      .mutation(async ({ input }) => generateHannaReply(input.messages, await loadHannaCatalog())),
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
