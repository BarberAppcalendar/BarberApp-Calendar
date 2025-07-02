import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { firestoreService } from "@/lib/firebase-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Settings, Users, DollarSign, Clock, LogOut, Copy, ExternalLink, Scissors, AlertTriangle, ChevronLeft, ChevronRight, Plus, Phone, User, Briefcase } from "lucide-react";
import { format, isToday, isTomorrow, parseISO, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ConfigurationPanel } from "@/components/configuration-panel";
import { SubscriptionStatus } from "@/components/subscription-status";
import { SubscriptionBlockedScreen } from "@/components/subscription-blocked-screen";
import type { FirestoreAppointment } from "@/lib/firebase-services";

export default function BarberDashboard() {
  const { barber, logout, isLoading } = useFirebaseAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Estado para verificación de suscripción
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [newAppointment, setNewAppointment] = useState({
    clientName: "",
    clientPhone: "",
    service: "Corte de pelo",
    price: "15"
  });

  useEffect(() => {
    if (!isLoading && !barber) {
      setLocation("/login");
      return;
    }

    if (barber?.barberId) {
      loadAppointments();
      checkSubscriptionStatus();
    }
  }, [barber, isLoading, setLocation]);

  const checkSubscriptionStatus = async () => {
    if (!barber?.barberId) return;
    
    try {
      setSubscriptionLoading(true);
      const response = await fetch(`/api/subscriptions/status/${barber.barberId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      } else {
        console.error('Error checking subscription:', response.status);
        // En caso de error, asumir que está activa para no bloquear innecesariamente
        setSubscriptionData({ isActive: true });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      // En caso de error, asumir que está activa para no bloquear innecesariamente
      setSubscriptionData({ isActive: true });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const loadAppointments = async () => {
    if (!barber?.barberId) return;

    try {
      setLoadingAppointments(true);
      const appointmentsList = await firestoreService.getAppointments(barber.barberId);
      setAppointments(appointmentsList);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Error",
        description: "Error al cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Generate time slots for calendar view
  const generateTimeSlots = () => {
    if (!barber) return [];

    const slots = [];
    const dateString = format(currentDate, 'yyyy-MM-dd');
    const dayAppointments = appointments.filter(apt => apt.date === dateString);

    // Get current day working hours
    const selectedDay = format(currentDate, 'EEEE', { locale: es }).toLowerCase();
    const dayMapping: { [key: string]: keyof typeof barber.workingHours } = {
      lunes: 'monday',
      martes: 'tuesday',
      miércoles: 'wednesday',
      jueves: 'thursday',
      viernes: 'friday',
      sábado: 'saturday',
      domingo: 'sunday'
    };

    const englishDay = dayMapping[selectedDay];
    const workingDay = barber.workingHours?.[englishDay];
    if (!workingDay?.isOpen) return [];

    const startHour = parseInt(workingDay.start.split(':')[0]);
    const startMinute = parseInt(workingDay.start.split(':')[1]);
    const endHour = parseInt(workingDay.end.split(':')[0]);
    const endMinute = parseInt(workingDay.end.split(':')[1]);

    // Helper function to check if time is during break
    const isTimeInBreakPeriod = (timeString: string) => {
      if (!barber.hasBreak || !barber.breakStart || !barber.breakEnd) {
        return false;
      }
      
      const [timeHour, timeMinute] = timeString.split(':').map(Number);
      const [breakStartHour, breakStartMinute] = barber.breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = barber.breakEnd.split(':').map(Number);
      
      const timeInMinutes = timeHour * 60 + timeMinute;
      const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;
      
      const isBreak = timeInMinutes >= breakStartInMinutes && timeInMinutes < breakEndInMinutes;
      
      // Log para debugging
      if (isBreak) {
        console.log(`🟠 Break time detected: ${timeString} (${barber.breakStart}-${barber.breakEnd})`);
      }
      
      return isBreak;
    };

    // Generate slots using current time logic like client-booking
    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');
      const appointment = dayAppointments.find(apt => apt.time === timeString);
      const isBreakTime = isTimeInBreakPeriod(timeString);

      slots.push({
        time: timeString,
        appointment,
        isBooked: !!appointment,
        isBreakTime: isBreakTime
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  };

  // Update time slots when date or appointments change
  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [currentDate, appointments, barber]);

  // Real-time appointment sync - refresh every 5 seconds
  useEffect(() => {
    if (!barber?.barberId) return;

    const interval = setInterval(() => {
      // Guardar posición del scroll antes del refresh
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      
      // Cargar appointments y restaurar posición después
      loadAppointments().then(() => {
        // Usar setTimeout para asegurar que el DOM se haya actualizado
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 50);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [barber?.barberId]);

  const handleCreateAppointment = async () => {
    if (!barber?.barberId || !selectedTimeSlot || !newAppointment.clientName) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const appointmentData = {
        barberId: barber.barberId,
        clientName: newAppointment.clientName,
        clientPhone: newAppointment.clientPhone,
        date: format(currentDate, 'yyyy-MM-dd'),
        time: selectedTimeSlot,
        service: newAppointment.service,
        price: newAppointment.price,
        status: 'confirmed'
      };

      await firestoreService.createAppointment(appointmentData);
      
      toast({
        title: "Cita creada",
        description: `Cita para ${newAppointment.clientName} el ${format(currentDate, 'dd/MM/yyyy')} a las ${selectedTimeSlot}`,
      });

      // Reset form and close dialog
      setNewAppointment({
        clientName: "",
        clientPhone: "",
        service: "Corte de pelo",
        price: "15"
      });
      setSelectedTimeSlot("");
      setIsCreatingAppointment(false);
      
      // Refresh appointments
      loadAppointments();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Usar la nueva API DELETE para eliminar completamente la cita
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada completamente. El horario ahora está libre.",
      });
      
      // Reload appointments to update the calendar
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive",
      });
    }
  };

  const handleTimeSlotClick = (timeSlot: string, isBooked: boolean, appointment?: any) => {
    if (isBooked && appointment) {
      // Show confirmation dialog for deleting appointment
      if (confirm(`¿Deseas eliminar la cita de ${appointment.clientName} a las ${timeSlot}? Esta acción liberará completamente el horario.`)) {
        handleCancelAppointment(appointment.id);
      }
    } else {
      setSelectedTimeSlot(timeSlot);
      setIsCreatingAppointment(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const copyBookingLink = () => {
    const bookingLink = `${window.location.origin}/client-booking/${barber?.barberId}`;
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: "¡Enlace copiado!",
      description: "El enlace de reservas ha sido copiado al portapapeles",
    });
  };

  const openBookingLink = () => {
    const bookingLink = `${window.location.origin}/client-booking/${barber?.barberId}`;
    window.open(bookingLink, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return null;
  }

  const todayAppointments = appointments.filter(apt => 
    isToday(parseISO(apt.date))
  );

  const tomorrowAppointments = appointments.filter(apt => 
    isTomorrow(parseISO(apt.date))
  );

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const totalRevenue = appointments
    .filter(apt => new Date(apt.date) <= new Date())
    .reduce((sum, apt) => sum + parseFloat(apt.price), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Solo bloquear acceso si el trial expiró Y no tiene suscripción activa
  if (!subscriptionLoading && subscriptionData && subscriptionData.needsSubscription) {
    return (
      <SubscriptionBlockedScreen 
        barberName={barber?.name || ""}
        shopName={barber?.shopName || ""}
        subscriptionExpires={subscriptionData.subscriptionExpires}
        daysUntilExpiry={subscriptionData.daysUntilExpiry}
        onLogout={handleLogout}
      />
    );
  }

  // Mostrar loading mientras se verifica la suscripción
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado de suscripción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex items-center space-x-3">
            <Scissors className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {barber.name}
              </h1>
              <p className="text-gray-600">{barber.shopName}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        {/* Estado de suscripción */}
        {barber?.barberId && (
          <SubscriptionStatus barberId={barber.barberId} />
        )}

        {/* Estadísticas compactas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Citas</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Hoy:</span>
                      <span className="font-bold">{todayAppointments.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Mañana:</span>
                      <span className="font-bold">{tomorrowAppointments.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total:</span>
                      <span className="font-bold">{appointments.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Ingresos</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">€{totalRevenue.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enlace de reservas compacto */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">Tu Enlace de Reservas</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2 bg-gray-50 rounded border font-mono text-xs break-all">
                  {window.location.origin}/client-booking/{barber.barberId}
                </div>
                <div className="flex gap-1">
                  <Button onClick={copyBookingLink} variant="outline" size="sm" className="text-xs h-7">
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <Button onClick={openBookingLink} variant="outline" size="sm" className="text-xs h-7">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs principales */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="appointments">Citas</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Calendario de Citas</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(subDays(currentDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-medium min-w-[180px] text-center">
                      {format(currentDate, "EEEE, dd 'de' MMMM yyyy", { locale: es })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addDays(currentDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Verde: Crear cita • Rojo: Cancelar cita • Naranja: Descanso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando calendario...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={slot.isBooked ? "destructive" : "outline"}
                        className={`h-16 flex flex-col items-center justify-center relative ${
                          slot.isBreakTime
                            ? "bg-orange-50 border-orange-200 text-orange-700 cursor-not-allowed"
                            : slot.isBooked 
                              ? "bg-red-50 border-red-200 text-red-700 cursor-pointer hover:bg-red-100 group" 
                              : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                        }`}
                        onClick={() => !slot.isBreakTime && handleTimeSlotClick(slot.time, slot.isBooked, slot.appointment)}
                        disabled={slot.isBreakTime}
                      >
                        <div className="text-sm font-semibold">{slot.time}</div>
                        {slot.isBreakTime ? (
                          <div className="text-xs">Descanso</div>
                        ) : slot.isBooked ? (
                          <>
                            <div className="text-xs">
                              {slot.appointment?.clientName?.substring(0, 10)}
                              {slot.appointment?.clientName?.length > 10 ? '...' : ''}
                            </div>
                            <div className="absolute top-1 right-1">
                              <div className="text-xs bg-red-600 text-white px-1 rounded">✕</div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs">Hacer Reserva</div>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>
                  Gestiona tus citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando citas...</p>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No tienes citas programadas
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-semibold">{appointment.clientName}</p>
                              <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              {format(parseISO(appointment.date), "EEEE, dd 'de' MMMM", { locale: es })}
                            </span>
                            <span>{appointment.time}</span>
                            <span>{appointment.service}</span>
                            <span className="font-semibold">€{appointment.price}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Settings className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Configuración</h3>
                    <p className="text-gray-600 mb-4">
                      Administra tu barbería, horarios de trabajo, precios y configuración general.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsConfigurationOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Abrir Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Appointment Creation Dialog */}
        <Dialog open={isCreatingAppointment} onOpenChange={setIsCreatingAppointment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nueva Cita - {selectedTimeSlot}
              </DialogTitle>
              <DialogDescription>
                Crear cita para el {format(currentDate, "dd 'de' MMMM yyyy", { locale: es })} a las {selectedTimeSlot}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre del cliente *
                </Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment({...newAppointment, clientName: e.target.value})}
                  placeholder="Nombre completo del cliente"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="clientPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                <Input
                  id="clientPhone"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                  placeholder="+34 123 456 789"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="service" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Servicio y Precio
                </Label>
                <Select 
                  value={newAppointment.service} 
                  onValueChange={(value) => {
                    // Extraer servicio y precio del valor seleccionado
                    const [service, price] = value.split('|');
                    setNewAppointment({
                      ...newAppointment, 
                      service: service,
                      price: price
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`Corte de pelo|${barber?.priceHaircut || '15.00'}`}>
                      Corte de pelo - €{barber?.priceHaircut || '15.00'}
                    </SelectItem>
                    <SelectItem value={`Arreglo de barba|${barber?.priceBeard || '10.00'}`}>
                      Arreglo de barba - €{barber?.priceBeard || '10.00'}
                    </SelectItem>
                    <SelectItem value={`Servicio completo|${barber?.priceComplete || '20.00'}`}>
                      Servicio completo - €{barber?.priceComplete || '20.00'}
                    </SelectItem>
                    <SelectItem value={`Afeitado|${barber?.priceShave || '8.00'}`}>
                      Afeitado - €{barber?.priceShave || '8.00'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Precio (€)
                </Label>
                <Input
                  id="price"
                  value={newAppointment.price}
                  onChange={(e) => setNewAppointment({...newAppointment, price: e.target.value})}
                  placeholder="15.00"
                  className="bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-600">El precio se asigna automáticamente según el servicio seleccionado</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreatingAppointment(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment}>
                Crear Cita
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configuration Panel Modal */}
        <ConfigurationPanel 
          isOpen={isConfigurationOpen}
          onClose={() => setIsConfigurationOpen(false)}
          barber={barber}
        />
      </div>
    </div>
  );
}