import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { storage as pgStorage } from "./storage.js";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase for migration
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function migratePostgresToFirebase() {
  console.log("🔄 Iniciando migración de PostgreSQL a Firebase...");
  
  try {
    // 1. Migrar barberos
    console.log("📋 Migrando barberos...");
    const barbers = await pgStorage.getAllBarbers();
    const batch = writeBatch(db);
    
    for (const barber of barbers) {
      const barberRef = doc(db, "barbers", barber.barberId);
      batch.set(barberRef, {
        ...barber,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await batch.commit();
    console.log(`✅ ${barbers.length} barberos migrados exitosamente`);
    
    // 2. Migrar citas para cada barbero
    console.log("📅 Migrando citas...");
    let totalAppointments = 0;
    
    for (const barber of barbers) {
      const appointments = await pgStorage.getAppointments(barber.barberId);
      const appointmentBatch = writeBatch(db);
      
      for (const appointment of appointments) {
        const appointmentRef = doc(db, "appointments", appointment.id.toString());
        appointmentBatch.set(appointmentRef, {
          ...appointment,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      if (appointments.length > 0) {
        await appointmentBatch.commit();
        totalAppointments += appointments.length;
      }
    }
    
    console.log(`✅ ${totalAppointments} citas migradas exitosamente`);
    
    // 3. Migrar servicios para cada barbero
    console.log("🔧 Migrando servicios personalizados...");
    let totalServices = 0;
    
    for (const barber of barbers) {
      const services = await pgStorage.getServices(barber.barberId);
      const servicesBatch = writeBatch(db);
      
      for (const service of services) {
        const serviceRef = doc(db, "services", service.id.toString());
        servicesBatch.set(serviceRef, {
          ...service,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      if (services.length > 0) {
        await servicesBatch.commit();
        totalServices += services.length;
      }
    }
    
    console.log(`✅ ${totalServices} servicios migrados exitosamente`);
    
    console.log("🎉 Migración completada exitosamente!");
    console.log(`Resumen:
    - ${barbers.length} barberos
    - ${totalAppointments} citas
    - ${totalServices} servicios personalizados
    `);
    
    return {
      success: true,
      barbers: barbers.length,
      appointments: totalAppointments,
      services: totalServices
    };
    
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  }
}