import { apiRequest } from "./queryClient";
import type { Barber, InsertBarber, LoginCredentials } from "@shared/schema";

export interface AuthResponse {
  barber: Barber;
  subscriptionStatus?: {
    isActive: boolean;
    isTrialExpired: boolean;
  };
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return await response.json();
  },

  async register(data: InsertBarber): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return await response.json();
  },

  async getBarberByBarberId(barberId: string): Promise<{ barber: Barber }> {
    const response = await apiRequest("GET", `/api/barbers/${barberId}`);
    return await response.json();
  },

  async updateSettings(barberId: number, updates: Partial<Barber>): Promise<AuthResponse> {
    const response = await apiRequest("PATCH", `/api/barbers/${barberId}/settings`, updates);
    return await response.json();
  },
};
