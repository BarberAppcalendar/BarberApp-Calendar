import { pgTable, text, serial, timestamp, boolean, uuid, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  barberId: text("barber_id").notNull().unique(), // Unique ID for sharing
  name: text("name").notNull(),
  shopName: text("shop_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  subscriptionExpires: timestamp("subscription_expires").notNull(),
  subscriptionStatus: text("subscription_status").default("trial"), // trial, active, cancelled, expired
  trialEndsAt: timestamp("trial_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  paypalCustomerId: text("paypal_customer_id"),
  paypalSubscriptionId: text("paypal_subscription_id"),
  isActive: boolean("is_active").default(true),
  startTime: text("start_time").default("09:00"),
  endTime: text("end_time").default("18:00"),
  breakStart: text("break_start").default("14:00"),
  breakEnd: text("break_end").default("15:00"),
  hasBreak: boolean("has_break").default(false),
  // Legacy service pricing - kept for backward compatibility
  priceHaircut: numeric("price_haircut", { precision: 10, scale: 2 }).default("15.00"),
  priceBeard: numeric("price_beard", { precision: 10, scale: 2 }).default("10.00"),
  priceComplete: numeric("price_complete", { precision: 10, scale: 2 }).default("20.00"),
  priceShave: numeric("price_shave", { precision: 10, scale: 2 }).default("8.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  barberId: text("barber_id").notNull(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  duration: text("duration").default("30"), // in minutes
  description: text("description"),
  isActive: boolean("is_active").default(true),
  order: text("order").default("0"), // for sorting
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  barberId: text("barber_id").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  service: text("service").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBarberSchema = createInsertSchema(barbers).pick({
  name: true,
  shopName: true,
  email: true,
  password: true,
});

export const updateBarberPricingSchema = createInsertSchema(barbers).pick({
  priceHaircut: true,
  priceBeard: true,
  priceComplete: true,
  priceShave: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  barberId: true,
  name: true,
  price: true,
  duration: true,
  description: true,
  order: true,
});

export const updateServiceSchema = createInsertSchema(services).pick({
  name: true,
  price: true,
  duration: true,
  description: true,
  isActive: true,
  order: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  barberId: true,
  clientName: true,
  clientPhone: true,
  date: true,
  time: true,
  service: true,
  price: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbers.$inferSelect;
export type UpdateBarberPricing = z.infer<typeof updateBarberPricingSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type UpdateService = z.infer<typeof updateServiceSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
