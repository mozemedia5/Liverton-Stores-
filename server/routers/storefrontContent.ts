import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createStorefrontBanner,
  listAllBanners,
  listPublishedBanners,
  updateStorefrontBanner,
} from "../storefrontContent.db";

const bannerInput = z.object({
  slug: z.string().trim().min(2).max(160),
  kind: z.enum(["image", "video", "announcement"]),
  title: z.string().trim().min(1).max(180),
  body: z.string().trim().max(5000).optional(),
  actionLabel: z.string().trim().max(80).optional(),
  href: z.string().trim().max(500).optional(),
  mediaUrl: z.string().url().max(2000).optional(),
  posterUrl: z.string().url().max(2000).optional(),
  cloudinaryPublicId: z.string().trim().max(500).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  position: z.number().int().min(0).max(1000).default(0),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});

export const storefrontContentRouter = router({
  publishedBanners: publicProcedure.query(() => listPublishedBanners()),
  admin: router({
    listBanners: adminProcedure.query(() => listAllBanners()),
    createBanner: adminProcedure
      .input(bannerInput)
      .mutation(({ input, ctx }) =>
        createStorefrontBanner({ ...input, createdBy: ctx.user.openId })
      ),
    updateBanner: adminProcedure
      .input(bannerInput.partial().extend({ id: z.number().int().positive() }))
      .mutation(({ input }) => {
        const { id, ...changes } = input;
        return updateStorefrontBanner(id, changes);
      }),
  }),
});
