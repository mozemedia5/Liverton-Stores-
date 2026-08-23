import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig } from "./runtimeConfig";

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig as FirebaseOptions);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseStatus() {
  const configured = Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
  const app = configured ? getFirebaseApp() : null;
  return {
    configured,
    projectId: firebaseConfig.projectId || null,
    authReady: Boolean(app),
  };
}
