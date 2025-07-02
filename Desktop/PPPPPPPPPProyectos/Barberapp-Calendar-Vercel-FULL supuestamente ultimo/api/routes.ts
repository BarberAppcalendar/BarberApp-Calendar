import { createServer } from "http";
import { Express } from "express";
import { firestoreService } from "./firebase-storage";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { paypalVerificationService } from "./paypal-verification";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { db } from "./firebase-storage";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });





  // Barber endpoints - Firebase only
  app.get("/api/barbers/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;
      const firebaseBarber = await firestoreService.getBarberByBarberId(barberId);

      if (!firebaseBarber) {
        return res.status(404).json({ message: "Barbero no encontrado" });
      }

      // Convert Firebase data to expected format
      const barber = {
        ...firebaseBarber,
        id: 0, // For compatibility
        isActive: firebaseBarber.isActive !== false,
        createdAt: firebaseBarber.createdAt || new Date()
      };

      res.json({ barber });
    } catch (error) {
      console.error("Error fetching barber:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Appointments endpoints - Firebase only
  app.get("/api/appointments/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;
      const appointments = await firestoreService.getAppointments(barberId);

      // Convert to expected format
      const formattedAppointments = appointments.map(apt => ({
        id: apt.id,
        barberId: apt.barberId,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        date: apt.date,
        time: apt.time,
        service: apt.service,
        price: apt.price,
        status: apt.status,
        createdAt: apt.createdAt
      }));

      res.json({ appointments: formattedAppointments });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = req.body;

      const newAppointment = await firestoreService.createAppointment(appointmentData);

      res.status(201).json({ appointment: newAppointment });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/appointments/:appointmentId", async (req, res) => {
    try {
      const { appointmentId } = req.params;
      
      console.log(`🗑️ Deleting appointment completely: ${appointmentId}`);
      
      // El appointmentId puede ser un número (timestamp) o string (documentId)
      // Primero intentar como documentId directo, luego buscar por id numérico
      let success = false;
      
      // Si es un número, buscar por id numérico y eliminar completamente
      if (!isNaN(Number(appointmentId))) {
        const numericId = Number(appointmentId);
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("id", "==", numericId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const appointmentDoc = querySnapshot.docs[0];
          // Eliminar completamente la cita para liberar el horario
          success = await firestoreService.deleteAppointmentById(appointmentDoc.id);
          console.log(`✅ Appointment ${appointmentId} deleted completely - time slot is now free`);
        }
      } else {
        // Si es string, usar como documentId directo y eliminar completamente
        success = await firestoreService.deleteAppointmentById(appointmentId);
        console.log(`✅ Appointment ${appointmentId} deleted completely - time slot is now free`);
      }
      
      if (success) {
        res.json({ success: true, message: "Cita eliminada exitosamente - horario libre para nuevas reservas" });
      } else {
        res.status(404).json({ message: "Cita no encontrada" });
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Services endpoints - Firebase only
  app.get("/api/services/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;

      const services = await firestoreService.getServices(barberId);

      // Convert to expected format
      const formattedServices = services.map(service => ({
        id: service.id,
        barberId: service.barberId,
        name: service.name,
        price: service.price,
        duration: service.duration,
        isActive: service.isActive
      }));

      res.json({ services: formattedServices });
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = req.body;

      const newService = await firestoreService.createService(serviceData);

      res.status(201).json({ service: newService });
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.put("/api/services/:serviceId", async (req, res) => {
    try {
      const { serviceId } = req.params;
      const updates = req.body;

      const updatedService = await firestoreService.updateService(parseInt(serviceId), updates);

      res.json({ service: updatedService });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  app.delete("/api/services/:serviceId", async (req, res) => {
    try {
      const { serviceId } = req.params;

      await firestoreService.deleteService(parseInt(serviceId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Update barber settings - Firebase only
  app.patch("/api/barbers/:barberId/settings", async (req, res) => {
    try {
      const { barberId } = req.params;
      const updates = req.body;

      const updatedBarber = await firestoreService.updateBarberByBarberId(barberId, updates);

      if (!updatedBarber) {
        return res.status(404).json({ message: "Barbero no encontrado" });
      }

      res.json({ barber: updatedBarber });
    } catch (error) {
      console.error("Error updating barber settings:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Subscription management endpoints
  app.post("/api/subscriptions/activate", async (req, res) => {
    try {
      const { barberId, paypalSubscriptionId } = req.body;
      
      if (!barberId || !paypalSubscriptionId) {
        return res.status(400).json({ message: "barberId y paypalSubscriptionId son requeridos" });
      }

      await firestoreService.createMonthlySubscription(barberId, paypalSubscriptionId);
      
      res.json({ 
        success: true, 
        message: "Suscripción activada correctamente",
        subscriptionId: paypalSubscriptionId 
      });
    } catch (error) {
      console.error("Error activating subscription:", error);
      res.status(500).json({ message: "Error activando suscripción" });
    }
  });

  app.get("/api/subscriptions/status/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;
      
      const barber = await firestoreService.getBarberByBarberId(barberId);
      if (!barber) {
        return res.status(404).json({ message: "Barbero no encontrado" });
      }

      const now = new Date();
      
      // Manejar fechas de Firebase para trial
      let trialEndsAt;
      if (barber.trialEndsAt && typeof barber.trialEndsAt === 'object' && 'seconds' in barber.trialEndsAt) {
        const timestamp = barber.trialEndsAt as any;
        trialEndsAt = new Date(timestamp.seconds * 1000);
      } else if (barber.trialEndsAt) {
        trialEndsAt = new Date(barber.trialEndsAt);
      } else {
        // Si no hay trialEndsAt, asumir que el trial ya expiró
        trialEndsAt = new Date(0);
      }
      
      // Manejar fechas de Firebase para suscripción
      let subscriptionExpiryDate;
      if (barber.subscriptionExpires && typeof barber.subscriptionExpires === 'object' && 'seconds' in barber.subscriptionExpires) {
        const timestamp = barber.subscriptionExpires as any;
        subscriptionExpiryDate = new Date(timestamp.seconds * 1000);
      } else if (barber.subscriptionExpires) {
        subscriptionExpiryDate = new Date(barber.subscriptionExpires);
      } else {
        subscriptionExpiryDate = new Date(0);
      }
      
      // Determinar si está en período de trial
      const isTrialActive = now <= trialEndsAt;
      const isSubscriptionActive = barber.subscriptionStatus === 'active' && now <= subscriptionExpiryDate;
      
      // El usuario tiene acceso si está en trial O tiene suscripción activa
      const hasAccess = isTrialActive || isSubscriptionActive;
      
      // Solo mostrar pantalla de suscripción si el trial ha expirado Y no tiene suscripción activa
      const needsSubscription = !isTrialActive && !isSubscriptionActive;

      const daysUntilExpiry = Math.ceil((subscriptionExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilTrialEnd = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log(`📊 Subscription check for ${barberId}:`, {
        isTrialActive,
        isSubscriptionActive,
        hasAccess,
        needsSubscription,
        daysUntilTrialEnd,
        daysUntilExpiry,
        trialEndsAt: trialEndsAt.toISOString(),
        subscriptionExpires: subscriptionExpiryDate.toISOString()
      });

      res.json({
        subscriptionStatus: barber.subscriptionStatus,
        subscriptionExpires: subscriptionExpiryDate.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        daysUntilExpiry: daysUntilExpiry,
        daysUntilTrialEnd: daysUntilTrialEnd,
        isTrialActive: isTrialActive,
        isSubscriptionActive: isSubscriptionActive,
        isActive: hasAccess,
        needsSubscription: needsSubscription,
        needsRenewal: daysUntilExpiry <= 3 && daysUntilExpiry > 0 && isSubscriptionActive
      });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Error verificando estado de suscripción" });
    }
  });

  app.post("/api/subscriptions/check", async (req, res) => {
    try {
      const { subscriptionMonitor } = await import("./subscription-monitor");
      await subscriptionMonitor.manualCheck();
      
      res.json({ 
        success: true, 
        message: "Verificación manual de suscripciones completada" 
      });
    } catch (error) {
      console.error("Error in manual subscription check:", error);
      res.status(500).json({ message: "Error en verificación manual" });
    }
  });

  app.get("/api/subscriptions/expiring", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const expiring = await firestoreService.getSubscriptionsExpiringIn(days);
      
      res.json({
        count: expiring.length,
        subscriptions: expiring.map(barber => ({
          barberId: barber.barberId,
          email: barber.email,
          shopName: barber.shopName,
          subscriptionExpires: barber.subscriptionExpires,
          daysLeft: Math.ceil((new Date(barber.subscriptionExpires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        }))
      });
    } catch (error) {
      console.error("Error getting expiring subscriptions:", error);
      res.status(500).json({ message: "Error obteniendo suscripciones por vencer" });
    }
  });

  // PayPal Verification Routes
  app.post("/api/paypal/verify/:barberId", async (req, res) => {
    try {
      const { barberId } = req.params;
      
      console.log(`🔍 Iniciando verificación PayPal para barbero: ${barberId}`);
      const success = await paypalVerificationService.syncSubscriptionWithFirebase(barberId);
      
      if (success) {
        res.json({ 
          success: true, 
          message: `Verificación exitosa para ${barberId}` 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: `Error verificando suscripción para ${barberId}` 
        });
      }
    } catch (error) {
      console.error("Error en verificación PayPal:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  });

  app.post("/api/paypal/verify-all", async (req, res) => {
    try {
      console.log("🔄 Iniciando verificación masiva de PayPal...");
      const result = await paypalVerificationService.syncAllSubscriptions();
      
      res.json({
        success: true,
        message: `Verificación completa: ${result.updated} actualizados de ${result.total} total`,
        ...result
      });
    } catch (error) {
      console.error("Error en verificación masiva PayPal:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error en verificación masiva" 
      });
    }
  });

  // PayPal Routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // PayPal Webhook para verificación instantánea de pagos
  app.post("/api/paypal/webhook", async (req, res) => {
    try {
      const webhookEvent = req.body;
      console.log('🔔 PayPal Webhook recibido:', webhookEvent.event_type);
      
      // Verificar tipos de eventos de pago exitoso
      if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED' || 
          webhookEvent.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' ||
          webhookEvent.event_type === 'CHECKOUT.ORDER.COMPLETED') {
        
        const paymentData = webhookEvent.resource;
        console.log('💰 Pago completado, datos:', JSON.stringify(paymentData, null, 2));
        
        // Buscar el barbero por email o ID de orden
        let barberId = null;
        
        // Extraer información del cliente del pago
        if (paymentData.payer && paymentData.payer.email_address) {
          const customerEmail = paymentData.payer.email_address;
          console.log('📧 Buscando barbero con email:', customerEmail);
          
          const barber = await firestoreService.getBarberByEmail(customerEmail);
          if (barber) {
            barberId = barber.barberId;
            console.log('👤 Barbero encontrado:', barberId);
            
            // Activar cuenta instantáneamente
            await firestoreService.updateBarberByBarberId(barberId, {
              subscriptionStatus: 'active',
              subscriptionExpires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 días
              isActive: true,
              paypalSubscriptionId: paymentData.id || paymentData.subscription_id
            });
            
            console.log('✅ Cuenta activada instantáneamente para:', barberId);
          }
        }
        
        res.status(200).json({ 
          success: true, 
          message: 'Pago procesado y cuenta activada',
          barberId: barberId
        });
      } else {
        console.log('ℹ️ Evento no relevante para activación:', webhookEvent.event_type);
        res.status(200).json({ success: true, message: 'Evento recibido' });
      }
      
    } catch (error) {
      console.error('❌ Error procesando webhook PayPal:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno' });
    }
  });

  // Endpoint para verificación manual de pago tras captura
  app.post("/api/paypal/verify-payment", async (req, res) => {
    try {
      const { orderID, customerEmail } = req.body;
      
      if (!orderID || !customerEmail) {
        return res.status(400).json({ 
          success: false, 
          error: 'orderID y customerEmail son requeridos' 
        });
      }
      
      console.log('🔍 Verificando pago manual - Order:', orderID, 'Email:', customerEmail);
      
      // Buscar barbero por email
      const barber = await firestoreService.getBarberByEmail(customerEmail);
      if (!barber) {
        return res.status(404).json({ 
          success: false, 
          error: 'Barbero no encontrado' 
        });
      }
      
      // Verificar el pago con PayPal
      const paymentVerified = await paypalVerificationService.verifyPayment(orderID);
      
      if (!paymentVerified) {
        return res.status(400).json({ 
          success: false, 
          error: 'Pago no verificado o pendiente en PayPal' 
        });
      }
      
      console.log('✅ Pago verificado exitosamente en PayPal');
      
      // Activar cuenta instantáneamente
      await firestoreService.updateBarberByBarberId(barber.barberId, {
        subscriptionStatus: 'active',
        subscriptionExpires: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
        isActive: true,
        paypalSubscriptionId: orderID
      });
      
      console.log('✅ Pago verificado y cuenta activada para:', barber.barberId);
      
      res.json({
        success: true,
        message: 'Pago verificado y cuenta activada',
        barberId: barber.barberId,
        subscriptionStatus: 'active'
      });
      
    } catch (error) {
      console.error('❌ Error verificando pago:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno' });
    }
  });

  // Client appointments endpoint
  app.get("/api/client-appointments/:clientPhone", async (req, res) => {
    try {
      const { clientPhone } = req.params;
      
      // Fetch from Firebase
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef,
        where("clientPhone", "==", clientPhone),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      const appointments: any[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const appointmentData = docSnapshot.data();
        
        // Get barber information
        const barberData = await firestoreService.getBarberByBarberId(appointmentData.barberId);
        
        appointments.push({
          id: docSnapshot.id,
          ...appointmentData,
          barberName: barberData?.name || 'Nombre no disponible',
          shopName: barberData?.shopName || 'Información no disponible'
        });
      }
      
      // Sort by date and time
      appointments.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });

      res.json({ appointments });
    } catch (error) {
      console.error("Error fetching client appointments:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Fallback for any other routes (debe ir al final)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "Endpoint no encontrado - Solo Firebase habilitado" });
  });

  return httpServer;
}