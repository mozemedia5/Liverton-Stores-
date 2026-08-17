type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

function readFirebaseConfig(): FirebaseConfig {
  const fallback: FirebaseConfig = { apiKey: "", authDomain: "", projectId: "", appId: "" };
  const raw = import.meta.env.VITE_FIREBASE_CONFIG_JSON;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as FirebaseConfig;
    if (!parsed.apiKey || !parsed.authDomain || !parsed.projectId || !parsed.appId) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export const firebaseConfig = readFirebaseConfig();
