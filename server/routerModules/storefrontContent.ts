import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createFirebaseBanner,
  listFirebaseBanners,
  updateFirebaseBanner,
} from "../firebaseData";

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
  publishedBanners: publicProcedure.query(() => listFirebaseBanners(true)),
  admin: router({
    listBanners: adminProcedure.query(() => listFirebaseBanners(false)),
    createBanner: adminProcedure
      .input(bannerInput)
      .mutation(({ input, ctx }) =>
        createFirebaseBanner({ ...input, createdBy: ctx.user.openId, actionLabel: input.actionLabel ?? null, href: input.href ?? null, mediaUrl: input.mediaUrl ?? null, posterUrl: input.posterUrl ?? null, cloudinaryPublicId: input.cloudinaryPublicId ?? null, body: input.body ?? null, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null })
      ),
    updateBanner: adminProcedure
      .input(bannerInput.partial().extend({ id: z.string().min(1) }))
      .mutation(({ input }) => {
        const { id, ...changes } = input;
        return updateFirebaseBanner(id, changes);
      }),
  }),
});
