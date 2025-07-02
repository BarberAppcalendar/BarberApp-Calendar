import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Scissors, CheckCircle, RefreshCw } from 'lucide-react';
import { format, addDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'wouter';

interface TimeSlot {
  time: string;
  status: 'available' | 'booked' | 'break';
  appointment?: any;
}

interface Service {
  id: string;
  name: string;
  price: string;
  duration: number;
}

interface Barber {
  id: number;
  barberId: string;
  name: string;
  shopName: string;
  email: string;
  isActive: boolean;
  subscriptionStatus: string;
  workingHours: any;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

interface Appointment {
  id: string;
  barberId: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  service: string;
  price: string;
}

function ClientBooking() {
  const params = useParams();
  const barberId = params.barberId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
  });
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Estado para preservar la posición del scroll durante auto-refresh
  const [scrollPosition, setScrollPosition] = useState(0);

  // Obtener información del barbero
  const { data: barberData, isLoading: barberLoading, error: barberError } = useQuery<{ barber: Barber }>({
    queryKey: [`/api/barbers/${barberId}`],
    queryFn: async () => {
      const response = await fetch(`/api/barbers/${barberId}`);
      if (!response.ok) {
        throw new Error('Barbero no encontrado');
      }
      return response.json();
    },
    enabled: !!barberId,
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  const barber = barberData?.barber;

  // Obtener servicios del barbero
  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: [`/api/services/${barberId}`],
    queryFn: async () => {
      const response = await fetch(`/api/services/${barberId}`);
      if (!response.ok) {
        return { services: [] };
      }
      return response.json();
    },
    enabled: !!barberId,
    refetchInterval: 5000,
  });

  const services = servicesData?.services || [];

  // Obtener citas del barbero para la fecha seleccionada
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery<{ appointments: Appointment[] }>({
    queryKey: [`/api/appointments/${barberId}`, selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${barberId}?date=${selectedDate}`);
      if (!response.ok) {
        return { appointments: [] };
      }
      return response.json();
    },
    enabled: !!barberId && !!selectedDate,
    refetchInterval: 5000, // Auto-refresh cada 5 segundos
  });

  const appointments = appointmentsData?.appointments || [];

  // Actualizar timestamp de última actualización
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Guardar posición del scroll antes de cada auto-refresh
  useEffect(() => {
    const saveScrollPosition = () => {
      const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
      setScrollPosition(currentPosition);
    };

    // Guardar posición antes de que TanStack Query haga refetch
    const interval = setInterval(saveScrollPosition, 4500); // Guardar 500ms antes del refetch

    return () => clearInterval(interval);
  }, []);

  // Restaurar posición del scroll después de auto-refresh
  useEffect(() => {
    if (scrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  }, [barberData, appointmentsData, servicesData]);

  // Generar slots de tiempo disponibles
  const generateTimeSlots = (): TimeSlot[] => {
    if (!barber?.workingHours) return [];

    const selectedDay = format(parseISO(selectedDate), 'EEEE', { locale: es }).toLowerCase();
    const dayMapping: { [key: string]: string } = {
      lunes: 'monday',
      martes: 'tuesday',
      miércoles: 'wednesday',
      jueves: 'thursday',
      viernes: 'friday',
      sábado: 'saturday',
      domingo: 'sunday'
    };

    const workingDay = barber.workingHours[dayMapping[selectedDay]];
    if (!workingDay?.isOpen) return [];

    const slots: TimeSlot[] = [];
    const startHour = parseInt(workingDay.start.split(':')[0]);
    const startMinute = parseInt(workingDay.start.split(':')[1]);
    const endHour = parseInt(workingDay.end.split(':')[0]);
    const endMinute = parseInt(workingDay.end.split(':')[1]);

    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm');
      
      // Verificar si es hora de descanso
      let isBreakTime = false;
      if (barber.hasBreak && barber.breakStart && barber.breakEnd) {
        const breakStart = barber.breakStart;
        const breakEnd = barber.breakEnd;
        if (timeString >= breakStart && timeString < breakEnd) {
          isBreakTime = true;
        }
      }

      // Verificar si hay una cita reservada
      const existingAppointment = appointments.find((apt: Appointment) => 
        apt.date === selectedDate && apt.time === timeString
      );

      let status: 'available' | 'booked' | 'break' = 'available';
      if (isBreakTime) {
        status = 'break';
      } else if (existingAppointment) {
        status = 'booked';
      }

      // Mostrar TODOS los slots (disponibles, ocupados y descansos)
      slots.push({
        time: timeString,
        status,
        appointment: existingAppointment
      });

      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Mutación para crear cita
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest('POST', `/api/appointments`, appointmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '¡Cita confirmada!',
        description: 'Tu cita ha sido reservada correctamente.',
      });
      
      // Limpiar formulario
      setBookingData({ clientName: '', clientPhone: '', service: '' });
      setSelectedTimeSlot('');
      setShowBookingDialog(false);
      
      // Invalidar caché para actualizar datos
      queryClient.invalidateQueries({ queryKey: [`/api/appointments/${barberId}`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al reservar',
        description: error.message || 'No se pudo crear la cita',
        variant: 'destructive',
      });
    },
  });

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
    setShowBookingDialog(true);
  };

  const handleBookingSubmit = () => {
    if (!bookingData.clientName.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor ingresa tu nombre',
        variant: 'destructive',
      });
      return;
    }

    if (!bookingData.service) {
      toast({
        title: 'Servicio requerido',
        description: 'Por favor selecciona un servicio',
        variant: 'destructive',
      });
      return;
    }

    const selectedService = services.find(s => s.name === bookingData.service);
    
    createAppointmentMutation.mutate({
      barberId,
      date: selectedDate,
      time: selectedTimeSlot,
      clientName: bookingData.clientName,
      clientPhone: bookingData.clientPhone || '',
      service: selectedService?.name || 'Servicio',
      price: selectedService?.price || '0',
    });
  };

  // Generar fechas disponibles (próximos 14 días)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      dates.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, d MMMM', { locale: es }),
        isToday: isToday(date),
        isTomorrow: isTomorrow(date),
      });
    }
    return dates;
  };

  if (barberLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-amber-800">Cargando información del barbero...</p>
        </div>
      </div>
    );
  }

  if (barberError || !barber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <strong>Barbero no encontrado.</strong> 
                El enlace puede ser incorrecto o el barbero no está disponible.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (barber.isActive === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Barbero no disponible.</strong> 
                Este barbero no está aceptando citas en este momento.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-amber-600" />
                <h1 className="text-2xl font-bold text-amber-900">
                  Reservar Cita
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCw className="h-3 w-3" />
              <span>Actualizado {format(lastRefresh, 'HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Información del Barbero */}
          <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-amber-900">
                <div className="bg-amber-200 p-3 rounded-full">
                  <Scissors className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-2xl">{barber.name}</h2>
                  <p className="text-lg text-amber-700">{barber.shopName}</p>
                </div>
                <div className="ml-auto">
                  <Badge 
                    variant={barber.subscriptionStatus === 'active' ? 'default' : 'secondary'}
                    className={barber.subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                  >
                    {barber.subscriptionStatus === 'active' ? 'Suscripción Activa' : 'Período de Prueba'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">Horarios de trabajo:</span>
                  </div>
                  <div className="text-gray-700 text-sm ml-6">
                    {Object.entries(barber.workingHours || {}).map(([day, hours]: [string, any]) => {
                      if (!hours?.isOpen) return null;
                      const dayNames: { [key: string]: string } = {
                        monday: 'Lunes',
                        tuesday: 'Martes', 
                        wednesday: 'Miércoles',
                        thursday: 'Jueves',
                        friday: 'Viernes',
                        saturday: 'Sábado',
                        sunday: 'Domingo'
                      };
                      return (
                        <div key={day}>
                          {dayNames[day]}: {hours.start} - {hours.end}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {barber.hasBreak && barber.breakStart && barber.breakEnd && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">Horario de descanso:</span>
                    </div>
                    <p className="text-gray-700 text-sm ml-6">
                      Diariamente de {barber.breakStart} a {barber.breakEnd}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selector de Fecha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una fecha" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDates().map((date) => (
                    <SelectItem key={date.value} value={date.value}>
                      {date.label}
                      {date.isToday && ' (Hoy)'}
                      {date.isTomorrow && ' (Mañana)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Horarios Disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios Disponibles
                {appointmentsLoading && <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay horarios disponibles para esta fecha</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => {
                    if (slot.status === 'available') {
                      return (
                        <Button
                          key={slot.time}
                          variant="outline"
                          className="h-12 bg-green-50 border-green-200 hover:bg-green-100 text-green-800"
                          onClick={() => handleTimeSlotSelect(slot.time)}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{slot.time}</div>
                            <div className="text-xs">Hacer Reserva</div>
                          </div>
                        </Button>
                      );
                    } else if (slot.status === 'booked') {
                      return (
                        <div
                          key={slot.time}
                          className="h-12 bg-red-50 border border-red-200 rounded-md flex items-center justify-center cursor-not-allowed"
                        >
                          <div className="text-center">
                            <div className="font-semibold text-red-800">{slot.time}</div>
                            <div className="text-xs text-red-600">Ocupado</div>
                          </div>
                        </div>
                      );
                    } else if (slot.status === 'break') {
                      return (
                        <div
                          key={slot.time}
                          className="h-12 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-center cursor-not-allowed"
                        >
                          <div className="text-center">
                            <div className="font-semibold text-orange-800">{slot.time}</div>
                            <div className="text-xs text-orange-600">Descanso</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información sobre servicios */}
          {services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Servicios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-amber-600 font-bold">€{service.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de Reserva */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Fecha:</strong> {format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: es })}
              </p>
              <p className="text-sm text-amber-800">
                <strong>Hora:</strong> {selectedTimeSlot}
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="clientName">Nombre completo *</Label>
                <Input
                  id="clientName"
                  value={bookingData.clientName}
                  onChange={(e) => setBookingData({...bookingData, clientName: e.target.value})}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Teléfono (opcional)</Label>
                <Input
                  id="clientPhone"
                  value={bookingData.clientPhone}
                  onChange={(e) => setBookingData({...bookingData, clientPhone: e.target.value})}
                  placeholder="Tu número de teléfono"
                />
              </div>

              {services.length > 0 && (
                <div>
                  <Label htmlFor="service">Servicio *</Label>
                  <Select value={bookingData.service} onValueChange={(value) => setBookingData({...bookingData, service: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service, index) => (
                        <SelectItem key={`${service.name}-${index}`} value={service.name}>
                          {service.name} - €{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBookingDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700"
                onClick={handleBookingSubmit}
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirmar Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default ClientBooking;