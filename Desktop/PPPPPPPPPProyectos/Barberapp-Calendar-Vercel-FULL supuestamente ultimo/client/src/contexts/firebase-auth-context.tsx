import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-auth";
import { firestoreService, type FirestoreBarber } from "@/lib/firebase-services";
import { generateBarberId } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";

interface FirebaseAuthContextType {
  user: User | null;
  barber: FirestoreBarber | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; shopName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [barber, setBarber] = useState<FirestoreBarber | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn("🔥 Firebase no configurado, contexto de auth deshabilitado");
      setIsLoading(false);
      return;
    }

    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      console.log("🔄 Auth state change:", firebaseUser ? firebaseUser.uid : "logout");
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log("🔄 Buscando datos del barbero...");
          const barberData = await firestoreService.getBarberByUid(firebaseUser.uid);
          setBarber(barberData);
          console.log("✅ Datos del barbero cargados:", barberData?.name);
        } catch (error) {
          console.error("❌ Error al cargar datos del barbero:", error);
          setBarber(null);
        }
      } else {
        setBarber(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authResponse = await firebaseAuth.login(email, password);
      let barberData = await firestoreService.getBarberByUid(authResponse.uid);
      
      // Si no existe el perfil del barbero, crearlo automáticamente
      if (!barberData) {
        console.log("📋 No se encontró perfil de barbero, creando uno nuevo...");
        const barberId = generateBarberId();
        const newBarberData = {
          uid: authResponse.uid,
          barberId,
          name: authResponse.displayName || authResponse.email?.split('@')[0] || 'Barbero',
          shopName: 'Mi Barbería',
          email: authResponse.email || email,
        };
        
        try {
          await firestoreService.createBarber(newBarberData);
          barberData = await firestoreService.getBarberByUid(authResponse.uid);
          console.log("✅ Perfil de barbero creado exitosamente:", barberId);
        } catch (error) {
          console.error("❌ Error creando perfil de barbero:", error);
        }
      }
      
      setUser(authResponse.user);
      setBarber(barberData);
      queryClient.clear();
      setIsLoading(false);
      console.log("✅ Login completo - Usuario y barbero establecidos");
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data: { name: string; shopName: string; email: string; password: string }) => {
    try {
      const authResponse = await firebaseAuth.register(data.email, data.password);
      
      const barberId = generateBarberId();
      await firestoreService.createBarber({
        uid: authResponse.uid,
        barberId,
        name: data.name,
        shopName: data.shopName,
        email: data.email,
      });
      
      const barberData = await firestoreService.getBarberByUid(authResponse.uid);
      setBarber(barberData);
      queryClient.clear();
    } catch (error: any) {
      // Si es el error de Firebase auth no habilitado, redirigir a página de ayuda
      if (error.message && error.message.includes("El registro por email no está habilitado")) {
        window.location.href = "/firebase-setup";
        return;
      }
      throw error; // Re-lanzar otros errores
    }
  };

  const logout = async () => {
    await firebaseAuth.logout();
    setUser(null);
    setBarber(null);
    queryClient.clear();
  };

  return (
    <FirebaseAuthContext.Provider value={{ user, barber, login, register, logout, isLoading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}