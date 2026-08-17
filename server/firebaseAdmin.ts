import { cert, getApps, initializeApp, type App, type ServiceAccount as FirebaseServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export type FirebaseAdminServices = {
  app: App;
  auth: Auth;
  firestore: Firestore;
};

type ServiceAccount = FirebaseServiceAccount & {
  project_id: string;
  client_email: string;
  private_key: string;
};

export function parseFirebaseServiceAccount(raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON): ServiceAccount | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) return null;
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

let services: FirebaseAdminServices | null = null;

export function getFirebaseAdmin(): FirebaseAdminServices {
  if (services) return services;
  const serviceAccount = parseFirebaseServiceAccount();
  if (!serviceAccount) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured or is invalid");
  const app = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });
  services = { app, auth: getAuth(app), firestore: getFirestore(app) };
  return services;
}
