import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  CLOUDINARY_RESOURCE_TYPES,
  createCloudinaryUploadSignature,
} from "../_core/cloudinary";

export const cloudinaryRouter = router({
  signUpload: adminProcedure
    .input(
      z.object({
        folder: z.string().trim().min(1).max(120).default("liverton/media"),
        resourceType: z.enum(CLOUDINARY_RESOURCE_TYPES).default("image"),
      })
    )
    .mutation(({ input }) => createCloudinaryUploadSignature(input)),
});

export type CloudinaryRouter = typeof cloudinaryRouter;
