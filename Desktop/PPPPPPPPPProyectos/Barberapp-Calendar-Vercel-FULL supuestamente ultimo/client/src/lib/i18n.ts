import { create } from 'zustand';

interface Translation {
  [key: string]: string;
}

interface Translations {
  [language: string]: Translation;
}

const translations: Translations = {
  es: {
    // Landing page
    'landing.title': 'BarberApp Calendar',
    'landing.subtitle': 'Sistema profesional de reservas para barberos',
    'landing.login': 'Iniciar Sesión',
    'landing.register': 'Registrarse',
    
    // Features
    'features.calendar': 'Calendario Inteligente',
    'features.calendar.desc': 'Gestiona tus citas con intervalos de 30 minutos',
    'features.clients': 'Reservas de Clientes',
    'features.clients.desc': 'Tus clientes pueden reservar online 24/7',
    'features.premium': 'Plan Premium',
    'features.premium.desc': '1 mes gratis, luego 4.95€/mes',
    
    // Auth
    'login.title': 'Iniciar Sesión',
    'login.subtitle': 'Accede a tu panel de barbero',
    'login.email': 'Email',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar Sesión',
    'login.register.link': '¿No tienes cuenta? Regístrate',
    
    'register.title': 'Crear Cuenta',
    'register.subtitle': 'Únete a BarberBook hoy',
    'register.trial': '🎉 ¡Primer mes GRATIS!',
    'register.name': 'Nombre del Barbero',
    'register.shop': 'Nombre de la Barbería',
    'register.email': 'Email',
    'register.password': 'Contraseña',
    'register.submit': 'Crear Cuenta',
    'register.login.link': '¿Ya tienes cuenta? Inicia sesión',
    
    // Dashboard
    'dashboard.today': 'Hoy',
    'dashboard.available': 'Disponibles',
    'dashboard.revenue': 'Ingresos',
    'dashboard.clients': 'Clientes',
    'dashboard.share.title': 'Comparte tu enlace de reservas',
    'dashboard.share.copy': 'Copiar',
    'dashboard.calendar': 'Calendario de Citas',
    
    // Calendar
    'calendar.available': 'Disponible',
    'calendar.booked': 'Ocupado',
    
    // Booking
    'booking.subtitle': 'Reserva tu cita',
    'booking.barber': 'Barbero',
    'booking.date': 'Selecciona la fecha',
    'booking.time': 'Horarios disponibles',
    'booking.selected': 'Hora seleccionada',
    'booking.info': 'Información del cliente',
    'booking.name': 'Nombre completo',
    'booking.phone': 'Teléfono (opcional)',
    'booking.service': 'Servicio',
    'booking.summary': 'Resumen de la reserva',
    'booking.barbershop': 'Barbería',
    'booking.client': 'Cliente',
    'booking.confirm': 'Confirmar Reserva',
    
    // Services
    'services.haircut': 'Corte de pelo',
    'services.beard': 'Arreglo de barba',
    'services.complete': 'Corte + Barba',
    'services.shave': 'Afeitado clásico',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.subscription.active': 'Plan Premium Activo',
    'settings.subscription.expires': 'Expira',
    'settings.payment': 'Métodos de pago',
    'settings.payment.change': 'Cambiar',
    'settings.hours': 'Horario de trabajo',
    'settings.hours.start': 'Inicio',
    'settings.hours.end': 'Fin',
    'settings.save': 'Guardar',
    
    // Confirmation
    'confirmation.title': '¡Reserva Confirmada!',
    'confirmation.message': 'Tu cita ha sido registrada exitosamente',
    'confirmation.details': 'Detalles de la cita:',
    
    // Common
    'common.back': '← Volver',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    
    // Legal pages
    'Información Legal': 'Información Legal',
    'Privacidad': 'Privacidad',
    'Términos': 'Términos',
    'Cookies': 'Cookies',
    'Aviso Legal': 'Aviso Legal',
    'Todos los derechos reservados': 'Todos los derechos reservados',
    'Contacto': 'Contacto',
    'Sistema profesional de gestión de citas para barberías': 'Sistema profesional de gestión de citas para barberías',
    'Volver al inicio': 'Volver al inicio',
    'Volver a información legal': 'Volver a información legal',
    
    // PWA
    'Instalar App': 'Instalar App',
    
    // Social Media
    'Síguenos en redes sociales': 'Síguenos en redes sociales',
    
    // Subscription Management
    accessRequired: "Acceso Requerido",
    loginToManageSubscription: "Inicia sesión para gestionar tu suscripción",
    loadingSubscriptionInfo: "Cargando información de suscripción...",
    subscriptionStatus: "Estado de Suscripción",
    subscriptionExpires: "La suscripción expira",
    trialEnds: "El período de prueba termina",
    active: "Activa",
    trial: "Prueba",
    expired: "Expirada",
    cancelled: "Cancelada",
    manageBarbershipProfessionally: "Gestiona tu barbería de forma profesional",
    premiumPlan: "Plan Premium",
    everythingForYourBarbershop: "Todo lo que necesitas para tu barbería",
    perMonth: "por mes",
    firstMonthFree: "Primer mes GRATIS",
    smartCalendarWithAppointments: "Calendario inteligente con citas",
    onlineBooking24_7: "Reservas online 24/7",
    scheduleAndBreakManagement: "Gestión de horarios y descansos",
    servicesPricingConfiguration: "Configuración de precios por servicio",
    clientPanelNoRegistration: "Panel para clientes sin registro",
    appointmentCancellation: "Cancelación de citas",
    multiLanguageSupport: "Soporte multiidioma",
    automaticUpdates: "Actualizaciones automáticas",
    choosePaymentMethod: "Elige tu método de pago",
    subscribeWithPayPal: "Suscribirse con PayPal",
    securePaymentEasyCancellation: "Pago seguro y fácil cancelación desde tu cuenta PayPal",
    paymentNotConfigured: "Pagos no configurados",
    contactAdminToConfigurePayments: "Contacta al administrador para configurar los pagos",
    securePayment100Percent: "Pago 100% seguro. Puedes cancelar en cualquier momento.",
    noChargesDuringTrial: "No se realizará ningún cobro durante el período de prueba gratuita.",
  },
  en: {
    // Landing page
    'landing.title': 'BarberApp Calendar',
    'landing.subtitle': 'Professional booking system for barbers',
    'landing.login': 'Login',
    'landing.register': 'Register',
    
    // Features
    'features.calendar': 'Smart Calendar',
    'features.calendar.desc': 'Manage appointments with 30-minute intervals',
    'features.clients': 'Client Bookings',
    'features.clients.desc': 'Your clients can book online 24/7',
    'features.premium': 'Premium Plan',
    'features.premium.desc': '1 month free, then €4.95/month',
    
    // Auth
    'login.title': 'Login',
    'login.subtitle': 'Access your barber panel',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.register.link': "Don't have an account? Register",
    
    'register.title': 'Create Account',
    'register.subtitle': 'Join BarberBook today',
    'register.trial': '🎉 First month FREE!',
    'register.name': 'Barber Name',
    'register.shop': 'Barbershop Name',
    'register.email': 'Email',
    'register.password': 'Password',
    'register.submit': 'Create Account',
    'register.login.link': 'Already have an account? Login',
    
    // Dashboard
    'dashboard.today': 'Today',
    'dashboard.available': 'Available',
    'dashboard.revenue': 'Revenue',
    'dashboard.clients': 'Clients',
    'dashboard.share.title': 'Share your booking link',
    'dashboard.share.copy': 'Copy',
    'dashboard.calendar': 'Appointment Calendar',
    
    // Calendar
    'calendar.available': 'Available',
    'calendar.booked': 'Booked',
    
    // Booking
    'booking.subtitle': 'Book your appointment',
    'booking.barber': 'Barber',
    'booking.date': 'Select date',
    'booking.time': 'Available times',
    'booking.selected': 'Selected time',
    'booking.info': 'Client information',
    'booking.name': 'Full name',
    'booking.phone': 'Phone (optional)',
    'booking.service': 'Service',
    'booking.summary': 'Booking summary',
    'booking.barbershop': 'Barbershop',
    'booking.client': 'Client',
    'booking.confirm': 'Confirm Booking',
    
    // Services
    'services.haircut': 'Haircut',
    'services.beard': 'Beard trim',
    'services.complete': 'Cut + Beard',
    'services.shave': 'Classic shave',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subscription.active': 'Premium Plan Active',
    'settings.subscription.expires': 'Expires',
    'settings.payment': 'Payment methods',
    'settings.payment.change': 'Change',
    'settings.hours': 'Working hours',
    'settings.hours.start': 'Start',
    'settings.hours.end': 'End',
    'settings.save': 'Save',
    
    // Confirmation
    'confirmation.title': 'Booking Confirmed!',
    'confirmation.message': 'Your appointment has been registered successfully',
    'confirmation.details': 'Appointment details:',
    
    // Common
    'common.back': '← Back',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    
    // Legal pages
    'Información Legal': 'Legal Information',
    'Privacidad': 'Privacy',
    'Términos': 'Terms',
    'Cookies': 'Cookies',
    'Aviso Legal': 'Legal Notice',
    'Todos los derechos reservados': 'All rights reserved',
    'Contacto': 'Contact',
    'Sistema profesional de gestión de citas para barberías': 'Professional appointment management system for barbershops',
    'Volver al inicio': 'Back to home',
    'Volver a información legal': 'Back to legal information',
    
    // PWA
    'Instalar App': 'Install App',
    
    // Social Media
    'Síguenos en redes sociales': 'Follow us on social media',
    
    // Subscription Management
    accessRequired: "Access Required",
    loginToManageSubscription: "Log in to manage your subscription",
    loadingSubscriptionInfo: "Loading subscription info...",
    subscriptionStatus: "Subscription Status",
    subscriptionExpires: "Subscription expires",
    trialEnds: "Trial period ends",
    active: "Active",
    trial: "Trial",
    expired: "Expired",
    cancelled: "Cancelled",
    manageBarbershipProfessionally: "Manage your barbershop professionally",
    premiumPlan: "Premium Plan",
    everythingForYourBarbershop: "Everything you need for your barbershop",
    perMonth: "per month",
    firstMonthFree: "First month FREE",
    smartCalendarWithAppointments: "Smart calendar with appointments",
    onlineBooking24_7: "Online booking 24/7",
    scheduleAndBreakManagement: "Schedule and break management",
    servicesPricingConfiguration: "Service pricing configuration",
    clientPanelNoRegistration: "Client panel without registration",
    appointmentCancellation: "Appointment cancellation",
    multiLanguageSupport: "Multi-language support",
    automaticUpdates: "Automatic updates",
    choosePaymentMethod: "Choose your payment method",
    subscribeWithPayPal: "Subscribe with PayPal",
    securePaymentEasyCancellation: "Secure payment and easy cancellation from your PayPal account",
    paymentNotConfigured: "Payments not configured",
    contactAdminToConfigurePayments: "Contact admin to configure payments",
    securePayment100Percent: "100% secure payment. You can cancel at any time.",
    noChargesDuringTrial: "No charges will be made during the free trial period.",
  },
};

interface I18nStore {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nStore>((set, get) => ({
  language: 'es',
  setLanguage: (lang: string) => set({ language: lang }),
  t: (key: string) => {
    const { language } = get();
    return translations[language]?.[key] || key;
  },
}));
