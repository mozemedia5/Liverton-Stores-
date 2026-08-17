import { v2 as cloudinary } from "cloudinary";
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export const CLOUDINARY_RESOURCE_TYPES = ["image", "video", "raw"] as const;
export type CloudinaryResourceType = (typeof CLOUDINARY_RESOURCE_TYPES)[number];

function ensureConfigured() {
  if (!ENV.cloudinaryCloudName || !ENV.cloudinaryApiKey || !ENV.cloudinaryApiSecret) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Cloudinary server configuration is incomplete",
    });
  }
}

function safeFolder(folder: string) {
  const normalized = folder.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized.length > 120 || !/^[a-zA-Z0-9/_-]+$/.test(normalized)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cloudinary folder contains invalid characters",
    });
  }
  return normalized;
}

export function isCloudinaryConfigured() {
  return Boolean(
    ENV.cloudinaryCloudName && ENV.cloudinaryApiKey && ENV.cloudinaryApiSecret
  );
}

export function createCloudinaryUploadSignature(input: {
  folder: string;
  resourceType: CloudinaryResourceType;
}) {
  ensureConfigured();
  const folder = safeFolder(input.folder);
  const timestamp = Math.floor(Date.now() / 1000);
  const uploadPreset = ENV.cloudinaryUploadPreset || undefined;
  const signableParams = {
    folder,
    resource_type: input.resourceType,
    timestamp,
    ...(uploadPreset ? { upload_preset: uploadPreset } : {}),
  };

  const signature = cloudinary.utils.api_sign_request(
    signableParams,
    ENV.cloudinaryApiSecret
  );

  return {
    cloudName: ENV.cloudinaryCloudName,
    apiKey: ENV.cloudinaryApiKey,
    timestamp,
    signature,
    uploadPreset,
    folder,
    resourceType: input.resourceType,
  };
}
