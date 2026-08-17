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
  videoUrl: import.meta.env.VITE_LIVERTON_BANNER_VIDEO_URL ?? "",
  posterUrl: import.meta.env.VITE_LIVERTON_BANNER_POSTER_URL ?? "",
  title: import.meta.env.VITE_LIVERTON_BANNER_TITLE ?? "",
  body: import.meta.env.VITE_LIVERTON_BANNER_BODY ?? "",
};
