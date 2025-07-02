import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "./firebase";
import type { Service, Appointment } from "@shared/schema";

export interface FirestoreBarber {
  uid?: string;
  id?: number;
  barberId: string;
  name: string;
  shopName: string;
  email: string;
  password?: string; // For demo users only
  subscriptionStatus: string;
  subscriptionExpires: Timestamp;
  trialEndsAt: Timestamp | null;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
  hasBreak?: boolean;
  workingHours?: {
    monday: { isOpen: boolean; start: string; end: string };
    tuesday: { isOpen: boolean; start: string; end: string };
    wednesday: { isOpen: boolean; start: string; end: string };
    thursday: { isOpen: boolean; start: string; end: string };
    friday: { isOpen: boolean; start: string; end: string };
    saturday: { isOpen: boolean; start: string; end: string };
    sunday: { isOpen: boolean; start: string; end: string };
  };
  pricing?: {
    corteBasico: number;
    barba: number;
    corteBarba: number;
    corteAvanzado: number;
  };
  // Legacy pricing for backward compatibility
  priceHaircut?: string;
  priceBeard?: string;
  priceComplete?: string;
  priceShave?: string;
  createdAt: Timestamp;
}

export interface FirestoreService {
  id?: string;
  barberId: string;
  name: string;
  price: string;
  duration: string;
  description?: string;
  isActive: boolean;
  order: string;
  createdAt: Timestamp;
}

export interface FirestoreAppointment {
  id?: string;
  barberId: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  time: string;
  service: string;
  price: string;
  status: string;
  createdAt: Timestamp;
}

export const firestoreService = {
  // Barber operations
  async createBarber(barberData: {
    uid: string;
    barberId: string;
    name: string;
    shopName: string;
    email: string;
  }): Promise<void> {
    const now = Timestamp.now();
    const oneMonthLater = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    const barber: FirestoreBarber = {
      ...barberData,
      subscriptionStatus: "trial",
      subscriptionExpires: oneMonthLater,
      trialEndsAt: oneMonthLater,
      isActive: true,
      startTime: "10:00",
      endTime: "20:30",
      breakStart: "13:30",
      breakEnd: "16:30",
      hasBreak: true,
      workingHours: {
        monday: { isOpen: true, start: '10:00', end: '20:30' },
        tuesday: { isOpen: true, start: '10:00', end: '20:30' },
        wednesday: { isOpen: true, start: '10:00', end: '20:30' },
        thursday: { isOpen: true, start: '10:00', end: '20:30' },
        friday: { isOpen: true, start: '10:00', end: '20:30' },
        saturday: { isOpen: true, start: '10:00', end: '20:30' },
        sunday: { isOpen: false, start: '10:00', end: '20:30' }
      },
      priceHaircut: "15.00",
      priceBeard: "10.00",
      priceComplete: "20.00",
      priceShave: "8.00",
      createdAt: now,
    };

    await setDoc(doc(db, "barbers", barberData.uid), barber);

    // Create default services
    const defaultServices = [
      { name: "Corte de cabello", price: "15.00", duration: "30", description: "Corte de cabello tradicional", order: "1" },
      { name: "Arreglo de barba", price: "10.00", duration: "20", description: "Recorte y arreglo de barba", order: "2" },
      { name: "Corte completo", price: "20.00", duration: "45", description: "Corte de cabello + arreglo de barba", order: "3" },
      { name: "Afeitado", price: "8.00", duration: "15", description: "Afeitado tradicional", order: "4" }
    ];

    const servicesCollection = collection(db, "services");
    for (const service of defaultServices) {
      await addDoc(servicesCollection, {
        ...service,
        barberId: barberData.barberId,
        isActive: true,
        createdAt: now,
      });
    }
  },

  async getBarberByUid(uid: string): Promise<FirestoreBarber | null> {
    const docRef = doc(db, "barbers", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreBarber;
    }
    return null;
  },

  async getBarberByBarberId(barberId: string): Promise<FirestoreBarber | null> {
    const q = query(collection(db, "barbers"), where("barberId", "==", barberId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirestoreBarber;
    }
    return null;
  },

  async getBarberByEmail(email: string): Promise<FirestoreBarber | null> {
    const q = query(collection(db, "barbers"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirestoreBarber;
    }
    return null;
  },

  async updateBarber(uid: string, updates: Partial<FirestoreBarber>): Promise<void> {
    const docRef = doc(db, "barbers", uid);
    await updateDoc(docRef, updates);
  },

  // Services operations
  async getServices(barberId: string): Promise<FirestoreService[]> {
    const q = query(
      collection(db, "services"), 
      where("barberId", "==", barberId),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    const services = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreService[];

    // Sort by name alphabetically since order field may not exist
    return services.sort((a, b) => a.name.localeCompare(b.name));
  },

  async createService(serviceData: Omit<FirestoreService, "id" | "createdAt">): Promise<string> {
    const servicesCollection = collection(db, "services");
    const docRef = await addDoc(servicesCollection, {
      ...serviceData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async updateService(serviceId: string, updates: Partial<FirestoreService>): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    await updateDoc(docRef, updates);
  },

  async deleteService(serviceId: string): Promise<void> {
    const docRef = doc(db, "services", serviceId);
    await deleteDoc(docRef);
  },

  // Appointments operations
  async getAppointments(barberId: string, date?: string): Promise<FirestoreAppointment[]> {
    let q = query(
      collection(db, "appointments"),
      where("barberId", "==", barberId)
    );

    if (date) {
      q = query(q, where("date", "==", date));
    }

    // Remove orderBy from query to avoid composite index requirements
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreAppointment[];

    // Sort in JavaScript instead of using Firebase orderBy
    return appointments.sort((a, b) => {
      // Sort by date desc, then by time asc
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.time.localeCompare(b.time);
    });
  },

  async createAppointment(appointmentData: Omit<FirestoreAppointment, "id" | "createdAt">): Promise<string> {
    const appointmentsCollection = collection(db, "appointments");
    const docRef = await addDoc(appointmentsCollection, {
      ...appointmentData,
      status: "confirmed",
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await updateDoc(docRef, { status: "cancelled" });
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    const docRef = doc(db, "appointments", appointmentId);
    await deleteDoc(docRef);
  },

  async getClientAppointments(clientPhone: string): Promise<FirestoreAppointment[]> {
    const q = query(
      collection(db, "appointments"),
      where("clientPhone", "==", clientPhone)
    );
    
    const querySnapshot = await getDocs(q);
    
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreAppointment[];

    // Sort in JavaScript instead of using Firebase orderBy
    return appointments.sort((a, b) => {
      // Sort by date desc, then by time asc
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return a.time.localeCompare(b.time);
    });
  }
};