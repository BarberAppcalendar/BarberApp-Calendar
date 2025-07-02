import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

export interface FirebaseAuthResponse {
  user: User;
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const firebaseAuth = {
  async register(email: string, password: string): Promise<FirebaseAuthResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("🔥 Firebase no está configurado. Configura las variables de entorno VITE_FIREBASE_*");
    }
    
    if (!auth) {
      throw new Error("🔥 Firebase Auth no está inicializado correctamente.");
    }

    // Validar inputs
    if (!email || !email.includes('@')) {
      throw new Error("📧 Email inválido");
    }
    
    if (!password || password.length < 6) {
      throw new Error("🔒 La contraseña debe tener al menos 6 caracteres");
    }
    
    try {
      console.log("🔄 Intentando registrar usuario:", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Usuario registrado exitosamente:", user.uid);
      
      return {
        user,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error("⚠️ El registro por email no está habilitado en Firebase.\n\n🔧 Solución:\n1. Ve a Firebase Console\n2. Autenticación > Métodos de acceso\n3. Habilita 'Correo electrónico/contraseña'");
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error("📧 Este email ya está registrado. Usa 'Iniciar Sesión' en su lugar.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("🔒 La contraseña debe tener al menos 6 caracteres.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("📧 El formato del email no es válido.");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("🌐 Error de conexión. Verifica tu internet.");
      }
      throw new Error(`❌ ${error.message || "Error al crear la cuenta"}`);
    }
  },

  async login(email: string, password: string): Promise<FirebaseAuthResponse> {
    if (!isFirebaseConfigured) {
      throw new Error("🔥 Firebase no está configurado. Configura las variables de entorno VITE_FIREBASE_*");
    }
    
    if (!auth) {
      throw new Error("🔥 Firebase Auth no está inicializado correctamente.");
    }

    // Validar inputs
    if (!email || !email.includes('@')) {
      throw new Error("📧 Email inválido");
    }
    
    if (!password) {
      throw new Error("🔒 La contraseña es requerida");
    }
    
    try {
      console.log("🔄 Intentando login:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("✅ Login exitoso:", user.uid);
      
      return {
        user,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      throw error; // Re-lanzar para manejo en componente
    }
  },

  async logout(): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase no está configurado.");
    }
    await signOut(auth);
  },

  getCurrentUser(): User | null {
    if (!isFirebaseConfigured || !auth) {
      return null;
    }
    return auth.currentUser;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    if (!isFirebaseConfigured || !auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
};