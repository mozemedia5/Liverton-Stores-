import type { Auth } from "firebase-admin/auth";
import { getFirebaseFirestore, type FirebaseAdminServices as FirebaseFirestoreServices, parseFirebaseServiceAccount } from "./firebaseFirestore.js";

export type FirebaseAdminServices = FirebaseFirestoreServices & {
  auth: Auth;
};

let services: FirebaseAdminServices | null = null;

export { parseFirebaseServiceAccount };

export async function getFirebaseAdmin(): Promise<FirebaseAdminServices> {
  if (services) return services;
  const { app, firestore }: FirebaseFirestoreServices = getFirebaseFirestore();
  const { getAuth } = await import("firebase-admin/auth");
  services = { app, auth: getAuth(app), firestore };
  return services;
}
