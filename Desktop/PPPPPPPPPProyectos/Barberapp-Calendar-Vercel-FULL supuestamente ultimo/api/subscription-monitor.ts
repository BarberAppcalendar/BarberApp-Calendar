import { firestoreService } from "./firebase-storage";
import { paypalVerificationService } from "./paypal-verification";

interface NotificationData {
  barberId: string;
  email: string;
  daysLeft: number;
  shopName?: string;
  name?: string;
}

class SubscriptionMonitor {
  private _isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  get isRunning(): boolean {
    return this._isRunning;
  }

  // Ejecutar cada 6 horas
  private readonly CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 horas en milisegundos

  start(): void {
    if (this._isRunning) {
      console.log("🔄 Subscription monitor already running");
      return;
    }

    // Limpiar cualquier interval previo
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this._isRunning = true;
    console.log("🚀 Starting subscription monitor - checking every 6 hours");

    // Start with a delay to allow server to fully initialize
    setTimeout(() => {
      this.checkSubscriptions();
    }, 30000); // Wait 30 seconds before first check

    // Programar ejecuciones periódicas
    this.intervalId = setInterval(() => {
      this.checkSubscriptions();
    }, this.CHECK_INTERVAL);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this._isRunning = false;
    console.log("⏹️ Subscription monitor stopped");
  }

  private async checkSubscriptions(): Promise<void> {
    try {
      console.log("🔍 Checking subscription statuses...");

      // 1. Try to sync with PayPal but don't fail if it's not available
      try {
        console.log("🔄 Sincronizando con PayPal...");
        const paypalResult = await paypalVerificationService.syncAllSubscriptions();
        console.log(`📊 PayPal sync: ${paypalResult.updated} updated, ${paypalResult.errors} errors of ${paypalResult.total} total`);
      } catch (paypalError) {
        console.warn("⚠️ PayPal sync failed, continuing without it:", paypalError instanceof Error ? paypalError.message : paypalError);
      }

      // 2. Verificar suscripciones que expiran en los próximos 3 días
      const result = await firestoreService.processExpiringSubscriptions();

      if (result.notifications.length > 0) {
        console.log(`📧 Sending ${result.notifications.length} renewal notifications`);
        await this.sendRenewalNotifications(result.notifications);
      }

      if (result.expired > 0) {
        console.log(`⚠️ Marked ${result.expired} subscriptions as expired`);
      }

      if (result.expiringSoon > 0) {
        console.log(`⏰ Found ${result.expiringSoon} subscriptions expiring soon`);
      }

      if (result.notifications.length === 0 && result.expired === 0 && result.expiringSoon === 0) {
        console.log("✅ All subscriptions are in good standing");
      }

    } catch (error) {
      console.error("❌ Error checking subscriptions:", error);
      // Don't re-throw the error to prevent disrupting the server
    }
  }

  private async sendRenewalNotifications(notifications: NotificationData[]): Promise<void> {
    for (const notification of notifications) {
      try {
        await this.sendRenewalNotification(notification);
      } catch (error) {
        console.error(`❌ Failed to send notification to ${notification.email}:`, error);
      }
    }
  }

  private async sendRenewalNotification(data: NotificationData): Promise<void> {
    // En un entorno real, aquí se enviaría el email
    // Por ahora, solo registramos en el log

    const message = this.generateNotificationMessage(data);

    console.log(`📧 NOTIFICATION FOR ${data.email}:`);
    console.log(`🔔 Subject: Tu suscripción de BarberApp Calendar expira en ${data.daysLeft} día${data.daysLeft !== 1 ? 's' : ''}`);
    console.log(`📝 Message: ${message}`);
    console.log(`🔗 Renewal URL: ${process.env.REPLIT_DOMAINS || 'localhost:5000'}/subscribe`);
    console.log(`👤 Barber ID: ${data.barberId}`);
    console.log("---");

    // TODO: Integrar con servicio de email (SendGrid, Nodemailer, etc.)
    // await this.emailService.send({
    //   to: data.email,
    //   subject: `Tu suscripción de BarberApp Calendar expira en ${data.daysLeft} día${data.daysLeft !== 1 ? 's' : ''}`,
    //   html: this.generateEmailTemplate(data)
    // });
  }

  private generateNotificationMessage(data: NotificationData): string {
    const { daysLeft, shopName, name } = data;

    if (daysLeft <= 0) {
      return `Hola ${name || 'Barbero'}, tu suscripción de BarberApp Calendar para ${shopName || 'tu barbería'} ha expirado. Renueva ahora para seguir gestionando tus citas.`;
    } else if (daysLeft === 1) {
      return `Hola ${name || 'Barbero'}, tu suscripción de BarberApp Calendar para ${shopName || 'tu barbería'} expira mañana. ¡Renueva hoy para no perder el acceso!`;
    } else {
      return `Hola ${name || 'Barbero'}, tu suscripción de BarberApp Calendar para ${shopName || 'tu barbería'} expira en ${daysLeft} días. Considera renovar para mantener el servicio activo.`;
    }
  }

  private generateEmailTemplate(data: NotificationData): string {
    const { daysLeft, shopName, name, barberId } = data;
    const renewalUrl = `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/subscribe`;
    const dashboardUrl = `${process.env.REPLIT_DOMAINS || 'localhost:5000'}/dashboard`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Renovación de Suscripción - BarberApp Calendar</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #3C2E26; margin: 0;">BarberApp Calendar</h1>
                <p style="color: #666; margin: 10px 0 0 0;">Sistema de Gestión de Citas para Barberías</p>
            </div>

            <div style="background-color: ${daysLeft <= 1 ? '#FEF2F2' : '#FFF7ED'}; border-left: 4px solid ${daysLeft <= 1 ? '#EF4444' : '#F59E0B'}; padding: 16px; margin-bottom: 30px;">
                <h2 style="color: ${daysLeft <= 1 ? '#DC2626' : '#D97706'}; margin: 0 0 10px 0;">
                    ${daysLeft <= 0 ? '⚠️ Suscripción Expirada' : daysLeft === 1 ? '🚨 Expira Mañana' : `⏰ Expira en ${daysLeft} días`}
                </h2>
                <p style="margin: 0; color: #374151;">
                    ${this.generateNotificationMessage(data)}
                </p>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #3C2E26;">¿Por qué renovar?</h3>
                <ul style="color: #555; line-height: 1.6;">
                    <li>📅 Gestión completa de citas y horarios</li>
                    <li>🔗 Enlace personalizado para tus clientes</li>
                    <li>💼 Panel de control profesional</li>
                    <li>📱 Acceso desde cualquier dispositivo</li>
                    <li>🔄 Sincronización en tiempo real</li>
                </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
                <a href="${renewalUrl}" style="background-color: #3C2E26; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Renovar Suscripción - €4.95/mes
                </a>
            </div>

            <div style="background-color: #F9FAFB; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #3C2E26;">Información de tu cuenta:</h4>
                <p style="margin: 5px 0; color: #555;"><strong>Barbería:</strong> ${shopName || 'Tu barbería'}</p>
                <p style="margin: 5px 0; color: #555;"><strong>ID Barbero:</strong> ${barberId}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Dashboard:</strong> <a href="${dashboardUrl}" style="color: #3C2E26;">${dashboardUrl}</a></p>
            </div>

            <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center; color: #6B7280; font-size: 14px;">
                <p>¿Necesitas ayuda? Contáctanos respondiendo a este email.</p>
                <p style="margin: 10px 0 0 0;">© 2025 BarberApp Calendar. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Método para verificar manualmente el estado
  async manualCheck(): Promise<void> {
    console.log("🔧 Manual subscription check triggered");
    await this.checkSubscriptions();
  }
}

export const subscriptionMonitor = new SubscriptionMonitor();