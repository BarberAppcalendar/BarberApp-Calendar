import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Check if Firebase is configured
const isFirebaseConfigured = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialize Firebase only if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable Auth persistence
    auth.settings = { ...auth.settings };
    
    console.log("✅ Firebase initialized successfully");
    console.log("📧 Auth Domain:", firebaseConfig.authDomain);
    console.log("🏗️ Project ID:", firebaseConfig.projectId);
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    console.error("🔧 Config used:", firebaseConfig);
  }
} else {
  console.warn("⚠️ Firebase not configured - missing environment variables:");
  console.warn("Missing API Key:", !import.meta.env.VITE_FIREBASE_API_KEY);
  console.warn("Missing Auth Domain:", !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  console.warn("Missing Project ID:", !import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

export { auth, db, isFirebaseConfigured };
export default app;