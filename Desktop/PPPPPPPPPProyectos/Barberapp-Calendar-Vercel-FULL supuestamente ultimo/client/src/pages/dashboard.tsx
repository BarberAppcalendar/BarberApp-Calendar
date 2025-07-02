import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { SettingsModal } from "@/components/settings-modal";
import { PricingSettings } from "@/components/pricing-settings";
import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Settings, LogOut, Copy, Check, X, Plus, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { InsertAppointment } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { PWAInstallButton } from "@/components/pwa-install-button";
import { Footer } from "@/components/footer";

export default function Dashboard() {
  const { t } = useI18n();
  const { barber, logout } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({
    clientName: "",
    clientPhone: "",
    service: "corte"
  });

  const dateString = format(currentDate, 'yyyy-MM-dd');

  // Check subscription status on dashboard load - redirect to trial-expired if needed
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      if (!barber) return;
      
      // Check if trial has expired
      const now = new Date();
      const trialEnd = barber.trialEndsAt ? new Date(barber.trialEndsAt) : null;
      const hasActiveSubscription = barber.subscriptionStatus === "active";
      
      if (trialEnd && now > trialEnd && !hasActiveSubscription) {
        setLocation('/trial-expired');
      }
    };

    checkSubscriptionStatus();
  }, [barber, setLocation]);

  // Fetch appointments for current date from Firebase
  const { data: appointmentsData } = useQuery({
    queryKey: ["firebase-appointments", barber?.barberId, dateString],
    queryFn: async () => {
      if (!barber?.barberId) return { appointments: [] };
      const { db } = await import('@/lib/firebase');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('barberId', '==', barber.barberId),
        where('date', '==', dateString)
      );
      
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => ({
        id: parseInt(doc.id.split('_')[1] || '0'),
        ...doc.data()
      }));
      
      return { appointments };
    },
    enabled: !!barber?.barberId,
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const { db } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const appointmentRef = doc(db, 'appointments', `appointment_${appointmentId}`);
      await updateDoc(appointmentRef, {
        status: 'cancelled'
      });
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["firebase-appointments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive",
      });
    },
  });

  // Add appointment mutation
  const addAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cita añadida",
        description: "La cita ha sido creada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/available-slots"] });
      setAddAppointmentOpen(false);
      setAppointmentForm({ clientName: "", clientPhone: "", service: "corte" });
      setSelectedTimeSlot("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      });
    },
  });

  const appointments = appointmentsData?.appointments || [];
  const confirmedAppointments = appointments.filter((apt: any) => apt.status === 'confirmed');

  // Generate time slots
  const generateTimeSlots = () => {
    if (!barber) return [];
    
    const slots = [];
    const startHour = parseInt((barber.startTime || "09:00").split(':')[0]);
    const startMinute = parseInt((barber.startTime || "09:00").split(':')[1]);
    const endHour = parseInt((barber.endTime || "18:00").split(':')[0]);
    const endMinute = parseInt((barber.endTime || "18:00").split(':')[1]);
    
    // Parse break times if enabled
    let breakStartHour = 0, breakStartMinute = 0, breakEndHour = 0, breakEndMinute = 0;
    if (barber.hasBreak) {
      [breakStartHour, breakStartMinute] = (barber.breakStart || "14:00").split(':').map(Number);
      [breakEndHour, breakEndMinute] = (barber.breakEnd || "15:00").split(':').map(Number);
    }
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const appointment = confirmedAppointments.find((apt: any) => apt.time === timeString);
      
      // Check if current time is during break period
      let isBreakTime = false;
      if (barber.hasBreak) {
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
        isBreakTime = currentTimeMinutes >= breakStartMinutes && currentTimeMinutes < breakEndMinutes;
      }
      
      slots.push({
        time: timeString,
        appointment,
        isBooked: !!appointment,
        isBreakTime,
      });
      
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const todayAppointments = appointments.length;
  const availableSlots = timeSlots.filter(slot => !slot.isBooked && !slot.isBreakTime).length;

  const getServicePrice = (serviceType: string): string | null => {
    switch (serviceType) {
      case 'corte': return barber?.priceHaircut || null;
      case 'barba': return barber?.priceBeard || null;
      case 'completo': return barber?.priceComplete || null;
      case 'afeitado': return barber?.priceShave || null;
      default: return null;
    }
  };

  const handleAddAppointment = () => {
    if (!selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Por favor selecciona un horario",
        variant: "destructive",
      });
      return;
    }

    const servicePrice = getServicePrice(appointmentForm.service);
    const appointmentData: InsertAppointment = {
      barberId: barber!.barberId,
      clientName: appointmentForm.clientName || "Cliente sin nombre",
      clientPhone: appointmentForm.clientPhone || "",
      date: dateString,
      time: selectedTimeSlot,
      service: appointmentForm.service,
      price: servicePrice,
    };

    addAppointmentMutation.mutate(appointmentData);
  };

  const handleTimeSlotClick = (timeSlot: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedTimeSlot(timeSlot);
    setAddAppointmentOpen(true);
  };

  const copyBookingLink = async () => {
    if (!barber) return;
    
    const bookingUrl = `${window.location.origin}/book/${barber.barberId}`;
    
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setLinkCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace de reservas ha sido copiado al portapapeles",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace",
      });
    }
  };

  if (!barber) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PWAInstallButton />
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/icons/logo.webp" alt="BarberApp Calendar" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">BarberApp Calendar</h1>
              <Badge className="bg-primary text-white">PRO</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{barber.name}</span>
              <PWAInstallButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-500 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  📅
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">{t('dashboard.today')}</p>
                  <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-50 rounded-lg p-3">
                  ⏰
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">{t('dashboard.available')}</p>
                  <p className="text-2xl font-bold text-gray-900">{availableSlots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-50 rounded-lg p-3">
                  💰
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">{t('dashboard.revenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">€{todayAppointments * 25}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-50 rounded-lg p-3">
                  👥
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm">{t('dashboard.clients')}</p>
                  <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Link Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('dashboard.share.title')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                value={`${window.location.origin}/book/${barber.barberId}`}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button onClick={copyBookingLink} className="sm:w-auto">
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('dashboard.share.copy')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Section */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('dashboard.calendar')}
              </h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(subDays(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium text-gray-900">
                  {format(currentDate, 'EEEE, dd MMMM yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(addDays(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <div key={slot.time} className="calendar-slot">
                  <div className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">
                    {slot.time}
                  </div>
                  <div className="flex-1 ml-2">
                    {slot.isBreakTime ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        ☕ Descanso
                      </Badge>
                    ) : slot.isBooked ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="status-booked">
                            👤 {t('calendar.booked')}
                          </Badge>
                          <div className="text-gray-700">
                            <div className="font-medium">{slot.appointment?.clientName}</div>
                            {slot.appointment?.clientPhone && (
                              <div className="text-sm text-gray-500">📞 {slot.appointment.clientPhone}</div>
                            )}
                            <div className="text-sm text-gray-500">✂️ {slot.appointment?.service}</div>
                            {slot.appointment?.price && (
                              <div className="text-sm text-green-600">💰 €{slot.appointment.price}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelAppointmentMutation.mutate(slot.appointment!.id)}
                          disabled={cancelAppointmentMutation.isPending}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="status-available bg-green-50 hover:bg-green-100 text-green-700 border-green-200 justify-start pl-8 w-full"
                        onClick={() => handleTimeSlotClick(slot.time, true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="text-sm">Disponible - Toca para reservar</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      {/* Add Appointment Modal */}
      <Dialog open={addAppointmentOpen} onOpenChange={setAddAppointmentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Cita Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="selectedTime" className="text-sm font-medium">
                Horario seleccionado
              </Label>
              <Input
                id="selectedTime"
                value={selectedTimeSlot}
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="clientName" className="text-sm font-medium">
                Nombre del cliente (opcional)
              </Label>
              <Input
                id="clientName"
                placeholder="Introduce el nombre..."
                value={appointmentForm.clientName}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientName: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="clientPhone" className="text-sm font-medium">
                Teléfono del cliente (opcional)
              </Label>
              <Input
                id="clientPhone"
                placeholder="Introduce el teléfono..."
                value={appointmentForm.clientPhone}
                onChange={(e) => setAppointmentForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="service" className="text-sm font-medium">
                Tipo de servicio (opcional)
              </Label>
              <div className="mt-2 space-y-2">
                {[
                  { value: 'corte', label: 'Corte de pelo', price: barber?.priceHaircut },
                  { value: 'barba', label: 'Arreglo de barba', price: barber?.priceBeard },
                  { value: 'completo', label: 'Corte + Barba', price: barber?.priceComplete },
                  { value: 'afeitado', label: 'Afeitado', price: barber?.priceShave }
                ].map((service) => (
                  <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="service"
                      value={service.value}
                      checked={appointmentForm.service === service.value}
                      onChange={(e) => setAppointmentForm(prev => ({ ...prev, service: e.target.value }))}
                      className="text-primary"
                    />
                    <span className="text-sm">
                      {service.label}
                      {service.price && <span className="text-green-600 ml-1">(€{service.price})</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setAddAppointmentOpen(false);
                  setAppointmentForm({ clientName: "", clientPhone: "", service: "corte" });
                  setSelectedTimeSlot("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddAppointment}
                disabled={addAppointmentMutation.isPending}
              >
                {addAppointmentMutation.isPending ? "Creando..." : "Crear Cita"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
