import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export function useFirebaseStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkFirebaseConfiguration() {
      try {
        setIsChecking(true);
        
        // Intentar escribir y leer un documento de prueba
        const testDoc = doc(db, 'test', 'configuration-check');
        const testData = {
          timestamp: new Date(),
          test: 'firebase-rules-check'
        };

        // Intentar escribir
        await setDoc(testDoc, testData);
        
        // Intentar leer
        const docSnap = await getDoc(testDoc);
        
        if (docSnap.exists() && isMounted) {
          // Si podemos leer y escribir, Firebase está configurado correctamente
          setIsConfigured(true);
          
          // Limpiar el documento de prueba
          try {
            await deleteDoc(testDoc);
          } catch (e) {
            // Ignorar errores de limpieza
          }
        }
      } catch (error: any) {
        if (isMounted) {
          if (error.code === 'permission-denied') {
            setIsConfigured(false);
          } else {
            // Otro tipo de error, asumir que está configurado pero hay un problema diferente
            setIsConfigured(true);
          }
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    checkFirebaseConfiguration();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isConfigured, isChecking };
}