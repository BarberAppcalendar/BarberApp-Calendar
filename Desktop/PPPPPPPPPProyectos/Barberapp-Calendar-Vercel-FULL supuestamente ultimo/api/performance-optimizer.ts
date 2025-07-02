// Optimizaciones específicas para 100 clientes simultáneos
import { storage } from "./storage";

interface PerformanceMetrics {
  activeConnections: number;
  requestsPerMinute: number;
  dbQueryTime: number;
  memoryUsage: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    activeConnections: 0,
    requestsPerMinute: 0,
    dbQueryTime: 0,
    memoryUsage: 0
  };
  
  private appointmentCache = new Map<string, any>();
  private barberCache = new Map<string, any>();
  private lastCleanup = Date.now();
  
  // Cache de citas para reducir consultas DB
  async getCachedAppointments(barberId: string, date?: string): Promise<any[]> {
    const cacheKey = `${barberId}-${date || 'all'}`;
    const cached = this.appointmentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
      return cached.data;
    }
    
    const appointments = await storage.getAppointments(barberId, date);
    this.appointmentCache.set(cacheKey, {
      data: appointments,
      timestamp: Date.now()
    });
    
    return appointments;
  }
  
  // Cache de barberos para reducir consultas
  async getCachedBarber(barberId: string): Promise<any> {
    const cached = this.barberCache.get(barberId);
    
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 min cache
      return cached.data;
    }
    
    const barber = await storage.getBarberByBarberId(barberId);
    if (barber) {
      this.barberCache.set(barberId, {
        data: barber,
        timestamp: Date.now()
      });
    }
    
    return barber;
  }
  
  // Invalidar cache cuando hay cambios
  invalidateAppointmentCache(barberId: string): void {
    const keysToDelete = Array.from(this.appointmentCache.keys())
      .filter(key => key.startsWith(barberId));
    
    keysToDelete.forEach(key => this.appointmentCache.delete(key));
  }
  
  invalidateBarberCache(barberId: string): void {
    this.barberCache.delete(barberId);
  }
  
  // Limpieza automática de cache cada 15 minutos
  startAutoCleanup(): void {
    setInterval(() => {
      this.cleanupCache();
    }, 15 * 60 * 1000); // 15 minutos
  }
  
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = 15 * 60 * 1000; // 15 minutos
    
    // Limpiar cache de citas viejas
    const appointmentKeys = Array.from(this.appointmentCache.keys());
    appointmentKeys.forEach(key => {
      const value = this.appointmentCache.get(key);
      if (value && now - value.timestamp > maxAge) {
        this.appointmentCache.delete(key);
      }
    });
    
    // Limpiar cache de barberos viejos
    const barberKeys = Array.from(this.barberCache.keys());
    barberKeys.forEach(key => {
      const value = this.barberCache.get(key);
      if (value && now - value.timestamp > maxAge) {
        this.barberCache.delete(key);
      }
    });
    
    console.log(`Cache cleanup completed. Appointments: ${this.appointmentCache.size}, Barbers: ${this.barberCache.size}`);
  }
  
  // Monitoreo de rendimiento
  updateMetrics(type: 'connection' | 'request' | 'query', value?: number): void {
    switch (type) {
      case 'connection':
        this.metrics.activeConnections += value || 1;
        break;
      case 'request':
        this.metrics.requestsPerMinute++;
        break;
      case 'query':
        this.metrics.dbQueryTime = value || 0;
        break;
    }
  }
  
  getMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    return { ...this.metrics };
  }
  
  // Verificar si el sistema está bajo estrés
  isUnderStress(): boolean {
    return (
      this.metrics.activeConnections > 80 ||
      this.metrics.requestsPerMinute > 500 ||
      this.metrics.memoryUsage > 512 // 512MB
    );
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// Iniciar limpieza automática
performanceOptimizer.startAutoCleanup();