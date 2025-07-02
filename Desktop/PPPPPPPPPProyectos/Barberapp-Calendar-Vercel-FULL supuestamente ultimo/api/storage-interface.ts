import { type Barber, type InsertBarber, type Appointment, type InsertAppointment, type UpdateBarberPricing, type Service, type InsertService, type UpdateService } from "@shared/schema";

export interface IStorage {
  // Barber methods
  getBarber(id: number): Promise<Barber | undefined>;
  getBarberByEmail(email: string): Promise<Barber | undefined>;
  getBarberByBarberId(barberId: string): Promise<Barber | undefined>;
  getAllBarbers(): Promise<Barber[]>;
  createBarber(barber: InsertBarber): Promise<Barber>;
  updateBarber(id: number, updates: Partial<Barber>): Promise<Barber | undefined>;
  updateBarberPricing(id: number, pricing: UpdateBarberPricing): Promise<Barber | undefined>;
  checkSubscriptionStatus(barberId: number): Promise<{ isActive: boolean; isTrialExpired: boolean }>;
  
  // Service methods
  getServices(barberId: string): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, updates: UpdateService): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Appointment methods
  getAppointments(barberId: string, date?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  cancelAppointment(id: number): Promise<boolean>;
  deleteAppointment(id: number): Promise<boolean>;
  deleteAppointmentById(documentId: string): Promise<boolean>;
  checkTimeSlotAvailable(barberId: string, date: string, time: string): Promise<boolean>;
  
  // Data cleanup methods
  cleanupOldAppointments(monthsOld: number): Promise<number>;
  cleanupClientData(daysOld: number): Promise<number>;
  
  // Subscription management methods
  updateSubscriptionStatus(barberId: number, status: string, expiryDate?: Date): Promise<void>;
  createMonthlySubscription(barberId: number, paypalSubscriptionId: string): Promise<void>;
  getExpiredSubscriptions(): Promise<Barber[]>;
  getSubscriptionsExpiringIn(days: number): Promise<Barber[]>;
  markNotificationSent(barberId: number, notificationType: string): Promise<void>;
  processExpiredSubscriptions(): Promise<number>;
  processExpiringSubscriptions(): Promise<{ 
    expiringSoon: number; 
    expired: number; 
    notifications: Array<{barberId: string, email: string, daysLeft: number}> 
  }>;
}