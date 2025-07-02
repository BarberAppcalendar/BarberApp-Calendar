
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Scissors, CheckCircle, RefreshCw } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Barber {
  id: string;
  barberId: string;
  name: string;
  shopName: string;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isOpen: boolean;
    };
  };
  hasBreak?: boolean;
  breakStart?: string;
  breakEnd?: string;
  breakTimes?: Array<{
    start: string;
    end: string;
    description: string;
  }>;
}

interface Appointment {
  id: string;
  barberId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
  status: string;
}

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBreakTime: boolean;
  status: 'available' | 'booked' | 'break';
}

interface RealtimeBookingCalendarProps {
  barbers: Barber[];
  onBookingComplete?: (appointment: Appointment) => void;
}

export default function RealtimeBookingCalendar({ 
  barbers, 
  onBookingComplete 
}: RealtimeBookingCalendarProps) {
  const { toast } = useToast();

  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Formulario de reserva
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [service, setService] = useState("");

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // LISTENER EN TIEMPO REAL MEJORADO - Escucha TODOS los cambios
  useEffect(() => {
    if (!selectedBarber) {
      setAppointments([]);
      return;
    }

    console.log(`🔄 NUEVO LISTENER para ${selectedBarber.barberId} en fecha ${dateString}`);
    setIsLoading(true);

    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("barberId", "==", selectedBarber.barberId),
      where("date", "==", dateString),
      orderBy("time", "asc")
    );

    const unsubscribe = onSnapshot(appointmentsQuery, 
      (snapshot) => {
        console.log(`📡 DATOS RECIBIDOS: ${snapshot.docs.length} documentos`);
        
        const appointmentsList: Appointment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const appointment = {
            id: doc.id,
            barberId: data.barberId,
            clientName: data.clientName || '',
            clientPhone: data.clientPhone || '',
            date: data.date,
            time: data.time,
            service: data.service,
            status: data.status
          } as Appointment;

          console.log(`📋 Cita: ${appointment.time} - ${appointment.clientName} - Estado: ${appointment.status}`);
          appointmentsList.push(appointment);
        });

        setAppointments(appointmentsList);
        setLastUpdate(new Date());
        setIsLoading(false);
        setIsRefreshing(false);
        
        console.log(`✅ ACTUALIZADO: ${appointmentsList.length} citas cargadas`);
      },
      (error) => {
        console.error("❌ ERROR en listener:", error);
        setIsLoading(false);
        setIsRefreshing(false);
        toast({
          title: "Error de conexión",
          description: "Problema cargando datos en tiempo real",
          variant: "destructive",
        });
      }
    );

    return () => {
      console.log(`🔌 DESCONECTANDO listener para ${selectedBarber.barberId}`);
      unsubscribe();
    };
  }, [selectedBarber, dateString]);

  // GENERAR SLOTS CON LÓGICA SIMPLIFICADA
  useEffect(() => {
    if (!selectedBarber) {
      setTimeSlots([]);
      return;
    }

    console.log(`⚙️ GENERANDO SLOTS para ${selectedBarber.name}`);
    generateTimeSlots();
  }, [selectedBarber, appointments, selectedDate]);

  const generateTimeSlots = () => {
    if (!selectedBarber) return;

    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingDay = selectedBarber.workingHours[dayName];

    if (!workingDay || !workingDay.isOpen) {
      console.log(`❌ Barbero no trabaja el ${dayName}`);
      setTimeSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const startHour = parseInt(workingDay.start.split(':')[0]);
    const startMinute = parseInt(workingDay.start.split(':')[1]);
    const endHour = parseInt(workingDay.end.split(':')[0]);
    const endMinute = parseInt(workingDay.end.split(':')[1]);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

      // Verificar descanso
      const isBreakTime = (() => {
        if (!selectedBarber.hasBreak || !selectedBarber.breakStart || !selectedBarber.breakEnd) {
          return false;
        }

        const [breakStartHour, breakStartMinute] = selectedBarber.breakStart.split(':').map(Number);
        const [breakEndHour, breakEndMinute] = selectedBarber.breakEnd.split(':').map(Number);

        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        const breakStartInMinutes = breakStartHour * 60 + breakStartMinute;
        const breakEndInMinutes = breakEndHour * 60 + breakEndMinute;

        return currentTimeInMinutes >= breakStartInMinutes && currentTimeInMinutes < breakEndInMinutes;
      })();

      // Verificar citas - SOLO CONFIRMED cuentan como ocupado
      const confirmedAppointment = appointments.find(apt => 
        apt.time === timeString && apt.status === "confirmed"
      );

      let status: 'available' | 'booked' | 'break' = 'available';
      if (isBreakTime) {
        status = 'break';
      } else if (confirmedAppointment) {
        status = 'booked';
      }

      slots.push({
        time: timeString,
        isAvailable: status === 'available',
        isBreakTime: status === 'break',
        status
      });

      // Incrementar 30 minutos
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }

    console.log(`🎯 SLOTS GENERADOS: ${slots.length} total, ${slots.filter(s => s.isAvailable).length} disponibles`);
    setTimeSlots(slots);
  };

  const forceRefresh = async () => {
    if (!selectedBarber) return;
    
    setIsRefreshing(true);
    console.log(`🔄 FORZANDO ACTUALIZACIÓN para ${selectedBarber.barberId}`);
    
    // El listener se activará automáticamente
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
    setSelectedTime("");
  };

  const handleTimeSlotClick = (time: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedTime(selectedTime === time ? "" : time);
  };

  const handleBooking = async () => {
    if (!selectedBarber || !selectedTime || !clientName || !service) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const appointmentData = {
        barberId: selectedBarber.barberId,
        clientName,
        clientPhone: clientPhone || "",
        date: dateString,
        time: selectedTime,
        service,
        status: "confirmed", // SIEMPRE confirmed para clientes
        createdAt: Timestamp.now(),
      };

      console.log(`📝 CREANDO CITA:`, appointmentData);
      const docRef = await addDoc(collection(db, "appointments"), appointmentData);

      const newAppointment: Appointment = {
        id: docRef.id,
        ...appointmentData
      };

      toast({
        title: "¡Cita reservada!",
        description: `Tu cita ha sido confirmada para el ${format(selectedDate, 'dd/MM/yyyy')} a las ${selectedTime}`,
      });

      // Limpiar formulario
      setClientName("");
      setClientPhone("");
      setService("");
      setSelectedTime("");

      onBookingComplete?.(newAppointment);

    } catch (error) {
      console.error("❌ ERROR creando cita:", error);
      toast({
        title: "Error",
        description: "No se pudo reservar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSlotButtonClass = (slot: TimeSlot) => {
    if (slot.status === 'break') {
      return "bg-orange-200 text-orange-800 border-orange-300 cursor-not-allowed";
    }
    if (slot.status === 'booked') {
      return "bg-red-500 text-white cursor-not-allowed";
    }
    if (selectedTime === slot.time) {
      return "bg-green-600 text-white shadow-lg transform scale-105";
    }
    return "bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300";
  };

  const availableSlots = timeSlots.filter(slot => slot.isAvailable);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Scissors className="h-6 w-6" />
            Reserva tu Cita en Tiempo Real
            {(isLoading || isRefreshing) && (
              <RefreshCw className="h-4 w-4 animate-spin ml-2" />
            )}
          </CardTitle>
          <div className="text-sm opacity-90">
            Última actualización: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Botón de actualización manual */}
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={forceRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Selección de Barbero */}
          <div className="mb-6">
            <Label htmlFor="barber-select" className="text-base font-semibold mb-3 block">
              Selecciona tu Barbero
            </Label>
            <Select onValueChange={(value) => {
              const barber = barbers.find(b => b.barberId === value);
              setSelectedBarber(barber || null);
              setSelectedTime("");
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige un barbero..." />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.barberId} value={barber.barberId}>
                    <div className="flex flex-col">
                      <span className="font-medium">{barber.name}</span>
                      <span className="text-sm text-gray-500">{barber.shopName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBarber && (
            <>
              {/* Navegación de Fecha */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="border-blue-300 hover:bg-blue-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Grid de Horarios */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    Horarios Disponibles ({availableSlots.length} libres)
                  </h3>
                </div>

                {timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay horarios disponibles para esta fecha</p>
                    <p className="text-sm">El barbero no trabaja este día</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        onClick={() => handleTimeSlotClick(slot.time, slot.isAvailable)}
                        disabled={!slot.isAvailable}
                        className={`h-12 transition-all duration-200 ${getSlotButtonClass(slot)}`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.time}</div>
                          {slot.status === 'break' && (
                            <div className="text-xs">Descanso</div>
                          )}
                          {slot.status === 'booked' && (
                            <div className="text-xs">Ocupado</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Leyenda mejorada */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-green-200 rounded"></div>
                    <span>Disponible ({availableSlots.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Ocupado ({timeSlots.filter(s => s.status === 'booked').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded"></div>
                    <span>Descanso ({timeSlots.filter(s => s.status === 'break').length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Seleccionado</span>
                  </div>
                </div>
              </div>

              {/* Formulario de Reserva */}
              {selectedTime && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Confirmar Reserva
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientName">Nombre completo *</Label>
                        <Input
                          id="clientName"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Tu nombre completo"
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="clientPhone">Teléfono (opcional)</Label>
                        <Input
                          id="clientPhone"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="Tu número de teléfono"
                          className="border-green-300 focus:border-green-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="service">Servicio *</Label>
                        <Select value={service} onValueChange={setService}>
                          <SelectTrigger className="border-green-300 focus:border-green-500">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Corte de cabello">Corte de cabello - €15</SelectItem>
                            <SelectItem value="Arreglo de barba">Arreglo de barba - €10</SelectItem>
                            <SelectItem value="Corte completo">Corte completo - €20</SelectItem>
                            <SelectItem value="Afeitado">Afeitado - €8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Resumen de tu cita:</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>👤 <strong>Barbero:</strong> {selectedBarber.name}</div>
                        <div>🏪 <strong>Barbería:</strong> {selectedBarber.shopName}</div>
                        <div>📅 <strong>Fecha:</strong> {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}</div>
                        <div>🕒 <strong>Hora:</strong> {selectedTime}</div>
                        {service && <div>✂️ <strong>Servicio:</strong> {service}</div>}
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={!clientName || !service || isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Reservando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirmar Reserva
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
