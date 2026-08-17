const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";

function cloudinaryDeliveryUrl(publicId: string, resourceType: "image" | "video") {
  if (!cloudinaryCloudName || !publicId) return "";
  return `https://res.cloudinary.com/${cloudinaryCloudName}/${resourceType}/upload/f_auto,q_auto/${publicId}`;
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
};

export const dashboardBannerConfig = {
  cloudName: cloudinaryCloudName,
  videoPublicId: import.meta.env.VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID ?? "",
  posterPublicId: import.meta.env.VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID ?? "",
  videoUrl: cloudinaryDeliveryUrl(
    import.meta.env.VITE_CLOUDINARY_BANNER_VIDEO_PUBLIC_ID ?? "",
    "video"
  ),
  posterUrl: cloudinaryDeliveryUrl(
    import.meta.env.VITE_CLOUDINARY_BANNER_POSTER_PUBLIC_ID ?? "",
    "image"
  ),
  title: import.meta.env.VITE_LIVERTON_BANNER_TITLE ?? "",
  body: import.meta.env.VITE_LIVERTON_BANNER_BODY ?? "",
};
