import { firestoreService } from "./firebase-storage";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

const isPayPalConfigured = !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

// PayPal API URLs
const PAYPAL_API_BASE = process.env.NODE_ENV === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

export interface PayPalSubscriptionStatus {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  billing_info?: {
    last_payment?: {
      time: string;
      amount: {
        currency_code: string;
        value: string;
      };
    };
    next_billing_time?: string;
  };
}

export class PayPalVerificationService {
  
  private async getAccessToken(): Promise<string | null> {
    if (!isPayPalConfigured) return null;

    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
      
      const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (response.ok) {
        const data = await response.json();
        return data.access_token;
      }
      
      console.error('Error obteniendo token PayPal:', response.status);
      return null;
    } catch (error) {
      console.error('Error en autenticación PayPal:', error);
      return null;
    }
  }
  
  async verifySubscription(paypalSubscriptionId: string): Promise<PayPalSubscriptionStatus | null> {
    if (!isPayPalConfigured) {
      console.warn("PayPal no configurado para verificación de suscripciones");
      return null;
    }

    try {
      console.log(`🔍 Verificando suscripción PayPal: ${paypalSubscriptionId}`);
      
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        console.error("No se pudo obtener token de acceso PayPal");
        return null;
      }

      const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${paypalSubscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const subscriptionData = await response.json() as PayPalSubscriptionStatus;
        console.log(`✅ Estado PayPal para ${paypalSubscriptionId}: ${subscriptionData.status}`);
        return subscriptionData;
      } else {
        console.error(`❌ Error verificando suscripción PayPal: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error("Error verificando suscripción en PayPal:", error);
      return null;
    }
  }

  async syncSubscriptionWithFirebase(barberId: string): Promise<boolean> {
    try {
      // Obtener datos del barbero desde Firebase
      const barber = await firestoreService.getBarberByBarberId(barberId);
      if (!barber || !barber.paypalSubscriptionId) {
        console.log(`❌ Barbero ${barberId} no tiene suscripción PayPal`);
        return false;
      }

      // Verificar estado en PayPal
      const paypalStatus = await this.verifySubscription(barber.paypalSubscriptionId);
      if (!paypalStatus) {
        console.log(`❌ No se pudo verificar suscripción PayPal para ${barberId}`);
        return false;
      }

      // Mapear estado de PayPal a nuestro sistema
      const newStatus = this.mapPayPalStatusToFirebase(paypalStatus.status);
      const currentFirebaseStatus = barber.subscriptionStatus;

      // Solo actualizar si hay cambios
      if (newStatus !== currentFirebaseStatus) {
        console.log(`🔄 Actualizando estado ${barberId}: ${currentFirebaseStatus} → ${newStatus}`);
        
        const updates: any = {
          subscriptionStatus: newStatus,
          lastPayPalCheck: new Date(),
        };

        // Si está activa, extender la fecha de expiración
        if (newStatus === 'active' && paypalStatus.billing_info?.next_billing_time) {
          updates.subscriptionExpires = new Date(paypalStatus.billing_info.next_billing_time);
        }

        // Actualizar directamente en Firebase
        const { doc, updateDoc, Timestamp, getDoc, collection, query, where, getDocs, getFirestore } = await import("firebase/firestore");
        const { initializeApp } = await import("firebase/app");
        
        // Configurar Firebase directamente
        const firebaseConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.VITE_FIREBASE_APP_ID
        };
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // Buscar documento por barberId
        let docRef = doc(db, "barbers", barberId);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          const barbersRef = collection(db, "barbers");
          const q = query(barbersRef, where("barberId", "==", barberId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docRef = querySnapshot.docs[0].ref;
          }
        }

        // Convertir fechas a Timestamp
        const firebaseUpdates = { ...updates };
        if (firebaseUpdates.lastPayPalCheck) {
          firebaseUpdates.lastPayPalCheck = Timestamp.fromDate(firebaseUpdates.lastPayPalCheck);
        }
        if (firebaseUpdates.subscriptionExpires) {
          firebaseUpdates.subscriptionExpires = Timestamp.fromDate(firebaseUpdates.subscriptionExpires);
        }

        await updateDoc(docRef, firebaseUpdates);
        console.log(`✅ Estado actualizado para ${barberId}: ${newStatus}`);
        return true;
      } else {
        console.log(`ℹ️ Sin cambios para ${barberId}: ya está ${currentFirebaseStatus}`);
        return true;
      }
    } catch (error) {
      console.error(`Error sincronizando ${barberId}:`, error);
      return false;
    }
  }

  private mapPayPalStatusToFirebase(paypalStatus: string): string {
    switch (paypalStatus) {
      case 'ACTIVE':
        return 'active';
      case 'SUSPENDED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'expired';
      case 'APPROVAL_PENDING':
      case 'APPROVED':
        return 'pending';
      default:
        return 'expired';
    }
  }

  async verifyPayment(orderID: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        console.error('No se pudo obtener token de acceso PayPal para verificar pago');
        return false;
      }

      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Error verificando pago PayPal:', response.status);
        return false;
      }

      const orderData = await response.json();
      console.log('📊 Datos del pago verificado:', JSON.stringify(orderData, null, 2));

      // Verificar si el pago fue completado exitosamente
      const isCompleted = orderData.status === 'COMPLETED' || 
                         orderData.status === 'APPROVED' ||
                         (orderData.purchase_units && 
                          orderData.purchase_units.some((unit: any) => 
                            unit.payments && 
                            unit.payments.captures && 
                            unit.payments.captures.some((capture: any) => capture.status === 'COMPLETED')
                          ));

      return isCompleted;
    } catch (error) {
      console.error('❌ Error verificando pago PayPal:', error);
      return false;
    }
  }

  async syncAllSubscriptions(): Promise<{ updated: number; total: number; errors: number }> {
    console.log("🔄 Iniciando sincronización masiva con PayPal...");
    
    try {
      // Obtener todos los barberos con suscripciones PayPal
      const allBarbers = await firestoreService.getAllBarbers();
      const barbersWithPayPal = allBarbers.filter(barber => 
        barber.paypalSubscriptionId && 
        barber.subscriptionStatus !== 'trial'
      );

      console.log(`📊 Encontrados ${barbersWithPayPal.length} barberos con suscripciones PayPal`);

      let updated = 0;
      let errors = 0;

      for (const barber of barbersWithPayPal) {
        try {
          const wasUpdated = await this.syncSubscriptionWithFirebase(barber.barberId);
          if (wasUpdated) updated++;
          
          // Pequeña pausa entre verificaciones para no sobrecargar PayPal
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          errors++;
          console.error(`Error procesando ${barber.barberId}:`, error);
        }
      }

      console.log(`✅ Sincronización completa: ${updated} actualizados, ${errors} errores de ${barbersWithPayPal.length} total`);
      
      return {
        updated,
        total: barbersWithPayPal.length,
        errors
      };
    } catch (error) {
      console.error("Error en sincronización masiva:", error);
      return { updated: 0, total: 0, errors: 1 };
    }
  }
}

export const paypalVerificationService = new PayPalVerificationService();