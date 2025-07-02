import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch,
  addDoc
} from "firebase/firestore";
import type { IStorage } from "./storage-interface";
import type { 
  Barber, 
  InsertBarber, 
  UpdateBarberPricing,
  Service,
  InsertService,
  UpdateService,
  Appointment,
  InsertAppointment
} from "@shared/schema";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the app and db instances for other modules
export { app, db };

export class FirebaseStorage implements IStorage {

  // Helper para generar barberId único
  private generateBarberId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BB_${randomPart}${timestamp.slice(-4)}`;
  }

  // Barber methods
  async getBarber(id: number): Promise<Barber | undefined> {
    try {
      const barbersRef = collection(db, "barbers");
      const q = query(barbersRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const barberDoc = querySnapshot.docs[0];
      return { barberId: barberDoc.id, ...barberDoc.data() } as Barber;
    } catch (error) {
      console.error("Error getting barber:", error);
      return undefined;
    }
  }

  async getBarberByEmail(email: string): Promise<Barber | undefined> {
    try {
      const barbersRef = collection(db, "barbers");
      const q = query(barbersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const barberDoc = querySnapshot.docs[0];
      return barberDoc.data() as Barber;
    } catch (error) {
      console.error("Error getting barber by email:", error);
      return undefined;
    }
  }

  async getBarberByBarberId(barberId: string): Promise<Barber | undefined> {
    try {
      // Primero intentar buscar por documento ID
      let barberDoc = await getDoc(doc(db, "barbers", barberId));

      if (!barberDoc.exists()) {
        // Si no existe, buscar por campo barberId
        const barbersRef = collection(db, "barbers");
        const q = query(barbersRef, where("barberId", "==", barberId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          barberDoc = querySnapshot.docs[0];
          const data = barberDoc.data();
          console.log(`📋 Firebase data (query) for ${barberId}:`, JSON.stringify(data, null, 2));

          if (data) {
            const barberResult = {
              id: data.id || 0,
              barberId: data.barberId || barberId,
              ...data
            };

            console.log(`📋 Barber result (query) for ${barberId}:`, JSON.stringify(barberResult, null, 2));
            return barberResult as Barber;
          }
        }

        return undefined;
      }

      const data = barberDoc.data();
      console.log(`📋 Firebase data for ${barberId}:`, JSON.stringify(data, null, 2));

      // Crear el objeto barber con todos los campos necesarios
      const barberResult = {
        id: data.id || 0,
        barberId: barberId,
        ...data  // Esto incluye todos los campos de Firebase
      };

      console.log(`📋 Barber result for ${barberId}:`, JSON.stringify(barberResult, null, 2));
      return barberResult as Barber;
    } catch (error) {
      console.error("Error getting barber by barberId:", error);
      return undefined;
    }
  }

  async getAllBarbers(): Promise<Barber[]> {
    try {
      const barbersRef = collection(db, "barbers");
      const querySnapshot = await getDocs(barbersRef);

      return querySnapshot.docs.map(doc => ({
        barberId: doc.id,
        ...doc.data()
      })) as Barber[];
    } catch (error) {
      console.error("Error getting all barbers:", error);
      return [];
    }
  }

  async createBarber(insertBarber: InsertBarber): Promise<Barber> {
    try {
      const barberId = this.generateBarberId();
      const id = Date.now(); // Temporal ID

      const barber: Barber = {
        id,
        barberId,
        ...insertBarber,
        startTime: "09:00",
        endTime: "18:00",
        hasBreak: false,
        breakStart: "13:00",
        breakEnd: "14:00",
        priceHaircut: "15.00",
        priceBeard: "10.00",
        priceComplete: "20.00",
        priceShave: "8.00",
        subscriptionStatus: "trial",
        subscriptionExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        paypalCustomerId: null,
        paypalSubscriptionId: null,
        isActive: true,
        createdAt: new Date()
      };

      // Guardar en Firebase
      await setDoc(doc(db, "barbers", barberId), barber);

      // Crear servicios por defecto
      const defaultServices = [
        { name: "Corte de Cabello", price: "15.00", duration: "30" },
        { name: "Arreglo de Barba", price: "10.00", duration: "20" },
        { name: "Servicio Completo", price: "20.00", duration: "45" },
        { name: "Afeitado", price: "8.00", duration: "15" }
      ];

      const batch = writeBatch(db);
      for (const service of defaultServices) {
        const serviceId = `${barberId}_${service.name.replace(/\s+/g, '_').toLowerCase()}`;
        const serviceDoc = doc(db, "services", serviceId);
        batch.set(serviceDoc, {
          id: Date.now() + Math.random(),
          barberId,
          ...service,
          isActive: true,
          createdAt: new Date()
        });
      }
      await batch.commit();

      return barber;
    } catch (error) {
      console.error("Error creating barber:", error);
      throw error;
    }
  }

  async updateBarber(id: number, updates: Partial<Barber>): Promise<Barber | undefined> {
    try {
      // Encontrar el barber por ID
      const barbersRef = collection(db, "barbers");
      const q = query(barbersRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const barberDoc = querySnapshot.docs[0];
      const barberId = barberDoc.id;

      await updateDoc(doc(db, "barbers", barberId), {
        ...updates,
        updatedAt: new Date()
      });

      // Retornar el barber actualizado
      const updatedDoc = await getDoc(doc(db, "barbers", barberId));
      return { barberId, ...updatedDoc.data() } as Barber;
    } catch (error) {
      console.error("Error updating barber:", error);
      return undefined;
    }
  }

  async updateBarberByBarberId(barberId: string, updates: Partial<Barber>): Promise<Barber | undefined> {
    try {
      // Buscar el documento por el campo barberId
      const barbersRef = collection(db, "barbers");
      const q = query(barbersRef, where("barberId", "==", barberId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`❌ Barbero no encontrado con barberId: ${barberId}`);
        return undefined;
      }

      // Obtener el primer documento encontrado
      const barberDoc = querySnapshot.docs[0];
      const documentId = barberDoc.id;
      const currentData = barberDoc.data();

      console.log(`✅ Barbero encontrado, documento ID: ${documentId}`);
      console.log(`📝 Actualizando campos:`, Object.keys(updates));

      // Combinar datos existentes con las actualizaciones
      const updatedData = {
        ...currentData,
        ...updates,
        updatedAt: Timestamp.now()
      };

      // Usar setDoc con merge para garantizar la actualización
      const barberRef = doc(db, "barbers", documentId);
      await setDoc(barberRef, updatedData, { merge: true });

      console.log(`✅ Actualización completada para ${barberId}`);

      // Retornar el barber actualizado
      return { barberId, ...updatedData } as Barber;
    } catch (error) {
      console.error("Error updating barber by barberId:", error);
      return undefined;
    }
  }

  async updateBarberPricing(id: number, pricing: UpdateBarberPricing): Promise<Barber | undefined> {
    return this.updateBarber(id, pricing);
  }

  async checkSubscriptionStatus(barberId: number): Promise<{ isActive: boolean; isTrialExpired: boolean }> {
    try {
      const barber = await this.getBarber(barberId);
      if (!barber) {
        return { isActive: false, isTrialExpired: true };
      }

      const now = new Date();
      const subscriptionExpires = new Date(barber.subscriptionExpires || 0);
      const trialEndsAt = new Date(barber.trialEndsAt || 0);

      const isTrialExpired = now > trialEndsAt;
      const isSubscriptionActive = barber.subscriptionStatus === "active" && now <= subscriptionExpires;

      return {
        isActive: !isTrialExpired || isSubscriptionActive,
        isTrialExpired: isTrialExpired && !isSubscriptionActive
      };
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return { isActive: false, isTrialExpired: true };
    }
  }

  // Service methods
  async getServices(barberId: string): Promise<Service[]> {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("barberId", "==", barberId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id || 0,
          barberId: data.barberId,
          name: data.name,
          price: data.price,
          duration: data.duration || null,
          description: data.description || null,
          order: data.order || null,
          isActive: data.isActive !== false,
          createdAt: data.createdAt || null
        } as Service;
      });
    } catch (error) {
      console.error("Error getting services:", error);
      return [];
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const serviceDoc = querySnapshot.docs[0];
      const data = serviceDoc.data();
      return {
        id: data.id || 0,
        barberId: data.barberId,
        name: data.name,
        price: data.price,
        duration: data.duration || null,
        description: data.description || null,
        order: data.order || null,
        isActive: data.isActive !== false,
        createdAt: data.createdAt || null
      } as Service;
    } catch (error) {
      console.error("Error getting service:", error);
      return undefined;
    }
  }

  async createService(insertService: InsertService): Promise<Service> {
    try {
      const serviceId = `${insertService.barberId}_${Date.now()}`;
      const id = Date.now();

      const service: Service = {
        id,
        barberId: insertService.barberId,
        name: insertService.name,
        price: insertService.price,
        duration: insertService.duration || null,
        description: insertService.description || null,
        order: insertService.order || null,
        isActive: true,
        createdAt: new Date()
      };

      await setDoc(doc(db, "services", serviceId), service);
      return service;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  }

  async updateService(id: number, updates: UpdateService): Promise<Service | undefined> {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const serviceDoc = querySnapshot.docs[0];
      const serviceId = serviceDoc.id;

      await updateDoc(doc(db, "services", serviceId), {
        ...updates,
        updatedAt: new Date()
      });

      const updatedDoc = await getDoc(doc(db, "services", serviceId));
      const data = updatedDoc.data();
      return {
        id: data?.id || 0,
        barberId: data?.barberId,
        name: data?.name,
        price: data?.price,
        duration: data?.duration || null,
        description: data?.description || null,
        order: data?.order || null,
        isActive: data?.isActive !== false,
        createdAt: data?.createdAt || null
      } as Service;
    } catch (error) {
      console.error("Error updating service:", error);
      return undefined;
    }
  }

  async deleteService(id: number): Promise<boolean> {
    try {
      const servicesRef = collection(db, "services");
      const q = query(servicesRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const serviceDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "services", serviceDoc.id));
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      return false;
    }
  }

  // Appointment methods
  async getAppointments(barberId: string, date?: string): Promise<Appointment[]> {
    try {
      console.log(`📋 Firebase query: barberId=${barberId}, date=${date || 'all'}`);
      const appointmentsRef = collection(db, "appointments");
      let q = query(appointmentsRef, where("barberId", "==", barberId));

      if (date) {
        q = query(q, where("date", "==", date));
      }

      q = query(q, orderBy("date"), orderBy("time"));
      const querySnapshot = await getDocs(q);
      
      console.log(`📊 Firebase returned ${querySnapshot.docs.length} appointment documents`);

      const appointments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const appointment = {
          id: data.id || 0,
          barberId: data.barberId,
          date: data.date,
          time: data.time,
          clientName: data.clientName,
          clientPhone: data.clientPhone || null,
          service: data.service,
          price: data.price || null,
          status: data.status,
          createdAt: data.createdAt || null
        } as Appointment;
        
        console.log(`📅 Appointment: ${appointment.id} - ${appointment.date} ${appointment.time} - Status: ${appointment.status}`);
        return appointment;
      });

      return appointments;
    } catch (error) {
      console.error("❌ Error getting appointments from Firebase:", error);
      return [];
    }
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return undefined;

      const appointmentDoc = querySnapshot.docs[0];
      const data = appointmentDoc.data();
      return {
        id: data.id || 0,
        barberId: data.barberId,
        date: data.date,
        time: data.time,
        clientName: data.clientName,
        clientPhone: data.clientPhone || null,
        service: data.service,
        price: data.price || null,
        status: data.status,
        createdAt: data.createdAt || null
      } as Appointment;
    } catch (error) {
      console.error("Error getting appointment:", error);
      return undefined;
    }
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    try {
      const appointmentId = `${insertAppointment.barberId}_${Date.now()}`;
      const id = Date.now();

      const appointment: Appointment = {
        id,
        barberId: insertAppointment.barberId,
        date: insertAppointment.date,
        time: insertAppointment.time,
        clientName: insertAppointment.clientName,
        clientPhone: insertAppointment.clientPhone || null,
        service: insertAppointment.service,
        price: insertAppointment.price || null,
        status: "scheduled",
        createdAt: new Date()
      };

      await setDoc(doc(db, "appointments", appointmentId), appointment);
      return appointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }

  async cancelAppointment(id: number): Promise<boolean> {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const appointmentDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "appointments", appointmentDoc.id), {
        status: "cancelled",
        cancelledAt: new Date()
      });

      return true;
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      return false;
    }
  }

  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("id", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return false;

      const appointmentDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "appointments", appointmentDoc.id));
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }
  }

  async deleteAppointmentById(documentId: string): Promise<boolean> {
    try {
      const appointmentRef = doc(db, "appointments", documentId);
      await deleteDoc(appointmentRef);
      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }
  }

  async updateAppointment(documentId: string, updates: any): Promise<boolean> {
    try {
      const appointmentRef = doc(db, "appointments", documentId);
      await updateDoc(appointmentRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error("Error updating appointment:", error);
      return false;
    }
  }

  async checkTimeSlotAvailable(barberId: string, date: string, time: string): Promise<boolean> {
    try {
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef, 
        where("barberId", "==", barberId),
        where("date", "==", date),
        where("time", "==", time),
        where("status", "==", "scheduled")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error("Error checking time slot availability:", error);
      return false;
    }
  }

  // Data cleanup methods
  async cleanupOldAppointments(monthsOld: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("createdAt", "<", cutoffDate));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return querySnapshot.size;
    } catch (error) {
      console.error("Error cleaning up old appointments:", error);
      return 0;
    }
  }

  async cleanupClientData(daysOld: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("createdAt", "<", cutoffDate));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      return querySnapshot.size;
    } catch (error) {
      console.error("Error cleaning up client data:", error);
      return 0;
    }
  }

  // Subscription management methods
  async updateSubscriptionStatus(barberId: number, status: string, expiryDate?: Date): Promise<void> {
    try {
      const barber = await this.getBarber(barberId);
      if (!barber) return;

      const updates: any = { 
        subscriptionStatus: status,
        updatedAt: new Date(),
        lastNotificationSent: null // Reset notification flag
      };

      if (expiryDate) {
        updates.subscriptionExpires = expiryDate;
      }

      // Si es una suscripción activa, calcular próxima fecha de vencimiento
      if (status === 'active' && !expiryDate) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        updates.subscriptionExpires = nextMonth;
      }

      await this.updateBarber(barberId, updates);
      console.log(`✅ Subscription updated for barber ${barber.barberId}: ${status}, expires: ${updates.subscriptionExpires}`);
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  }

  async createMonthlySubscription(barberId: number, paypalSubscriptionId: string): Promise<void> {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const updates = {
        subscriptionStatus: 'active',
        paypalSubscriptionId: paypalSubscriptionId,
        subscriptionExpires: nextMonth,
        updatedAt: new Date(),
        lastNotificationSent: null
      };

      await this.updateBarber(barberId, updates);
      console.log(`✅ Monthly subscription created for barber ${barberId}, expires: ${nextMonth.toLocaleDateString()}`);
    } catch (error) {
      console.error("Error creating monthly subscription:", error);
    }
  }

  async getExpiredSubscriptions(): Promise<Barber[]> {
    try {
      const barbersRef = collection(db, "barbers");
      const now = new Date();

      const q = query(barbersRef, where("subscriptionExpires", "<", now));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        barberId: doc.id,
        ...doc.data()
      })) as Barber[];
    } catch (error) {
      console.error("Error getting expired subscriptions:", error);
      return [];
    }
  }

  async getSubscriptionsExpiringIn(days: number): Promise<Barber[]> {
    try {
      const barbersRef = collection(db, "barbers");
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      // Simplificar la consulta para evitar índices complejos
      const q = query(
        barbersRef, 
        where("subscriptionStatus", "==", "active")
      );
      const querySnapshot = await getDocs(q);

      // Filtrar en memoria las fechas
      const result = querySnapshot.docs
        .map(doc => ({
          barberId: doc.id,
          ...doc.data()
        }))
        .filter(barber => {
          const barberData = barber as any; // Firebase permite campos adicionales
          if (!barberData.subscriptionExpires) return false;
          const expiryDate = new Date(barberData.subscriptionExpires);
          return expiryDate >= now && expiryDate <= futureDate;
        }) as Barber[];

      return result;
    } catch (error) {
      console.error("Error getting subscriptions expiring soon:", error);
      return [];
    }
  }

  async markNotificationSent(barberId: number, notificationType: string): Promise<void> {
    try {
      const barber = await this.getBarber(barberId);
      if (!barber) return;

      // Usar Firebase directamente para campos adicionales
      const barberRef = doc(db, "barbers", barber.barberId);
      await updateDoc(barberRef, {
        lastNotificationSent: new Date(),
        lastNotificationType: notificationType,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error marking notification as sent:", error);
    }
  }

  async processExpiredSubscriptions(): Promise<number> {
    try {
      const expiredBarbers = await this.getExpiredSubscriptions();

      const batch = writeBatch(db);
      expiredBarbers.forEach(barber => {
        const barberRef = doc(db, "barbers", barber.barberId);
        batch.update(barberRef, {
          subscriptionStatus: "expired",
          updatedAt: new Date()
        });
      });

      await batch.commit();
      console.log(`✅ Processed ${expiredBarbers.length} expired subscriptions`);
      return expiredBarbers.length;
    } catch (error) {
      console.error("Error processing expired subscriptions:", error);
      return 0;
    }
  }

  async processExpiringSubscriptions(): Promise<{ 
    expiringSoon: number; 
    expired: number; 
    notifications: Array<{barberId: string, email: string, daysLeft: number}> 
  }> {
    try {
      // Buscar suscripciones que expiran en 3 días
      const expiringSoon = await this.getSubscriptionsExpiringIn(3);

      // Buscar suscripciones ya expiradas
      const expired = await this.getExpiredSubscriptions();

      const notifications: Array<{barberId: string, email: string, daysLeft: number}> = [];

      // Procesar suscripciones que expiran pronto
      for (const barber of expiringSoon) {
        const daysLeft = Math.ceil((new Date(barber.subscriptionExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        // Solo enviar notificación si no se ha enviado en las últimas 24 horas
        const barberData = barber as any; // Firebase permite campos adicionales
        const lastNotification = barberData.lastNotificationSent ? new Date(barberData.lastNotificationSent) : null;
        const now = new Date();
        const hoursSinceLastNotification = lastNotification ? 
          (now.getTime() - lastNotification.getTime()) / (1000 * 60 * 60) : 24;

        if (!lastNotification || hoursSinceLastNotification >= 24) {
          notifications.push({
            barberId: barber.barberId,
            email: barber.email,
            daysLeft: daysLeft
          });

          // Marcar notificación como enviada
          await this.markNotificationSent(barber.id, `expiring_${daysLeft}_days`);
        }
      }

      // Procesar suscripciones expiradas
      const batch = writeBatch(db);
      expired.forEach(barber => {
        if (barber.subscriptionStatus !== 'expired') {
          const barberRef = doc(db, "barbers", barber.barberId);
          batch.update(barberRef, {
            subscriptionStatus: "expired",
            updatedAt: new Date()
          });
        }
      });

      if (expired.length > 0) {
        await batch.commit();
      }

      console.log(`📊 Subscription check: ${notifications.length} notifications to send, ${expired.length} expired`);

      return {
        expiringSoon: expiringSoon.length,
        expired: expired.length,
        notifications
      };
    } catch (error) {
      console.error("Error processing expiring subscriptions:", error);
      return { expiringSoon: 0, expired: 0, notifications: [] };
    }
  }
}

// Export an instance of FirebaseStorage
export const firestoreService = new FirebaseStorage();