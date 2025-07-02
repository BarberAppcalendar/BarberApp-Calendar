import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LogOut, Copy, Check, Calendar, Clock, Users, Euro, Plus, 
  ChevronLeft, ChevronRight, Phone, Settings, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/footer";
import { format, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { InsertAppointment, InsertService } from "@shared/schema";

export default function CompleteDashboard() {
  const { barber, logout, isLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [linkCopied, setLinkCopied] = useState(false);
  const queryClient = useQueryClient();
  
  // State for dashboard
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    service: '',
    time: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '30',
    description: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !barber) {
      setLocation('/login');
    }
  }, [barber, isLoading, setLocation]);

  // Fetch appointments for selected date
  const { data: appointments = [] } = useQuery({
    queryKey: ['/api/appointments', barber?.barberId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!barber?.barberId) return [];
      const response = await fetch(`/api/appointments/${barber.barberId}?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      return data.appointments || [];
    },
    enabled: !!barber?.barberId,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ['/api/services', barber?.barberId],
    queryFn: async () => {
      if (!barber?.barberId) return [];
      const response = await fetch(`/api/services/${barber.barberId}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return data.services || [];
    },
    enabled: !!barber?.barberId,
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setShowNewAppointment(false);
      setNewAppointment({
        clientName: '',
        clientPhone: '',
        service: '',
        time: '',
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      toast({
        title: "Cita creada",
        description: "La nueva cita se ha creado exitosamente",
      });
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (service: InsertService) => {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setShowNewService(false);
      setNewService({
        name: '',
        price: '',
        duration: '30',
        description: ''
      });
      toast({
        title: "Servicio creado",
        description: "El nuevo servicio se ha creado exitosamente",
      });
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Cita cancelada",
        description: "La cita se ha cancelado exitosamente",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800">Cargando panel del barbero...</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return <div>Redirigiendo...</div>;
  }

  const shareableLink = `${window.location.origin}/book/${barber.barberId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      toast({
        title: "Enlace copiado",
        description: "El enlace de reservas ha sido copiado al portapapeles",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = [];
    const workingDay = barber.workingHours?.[format(selectedDate, 'EEEE').toLowerCase()];
    
    if (!workingDay || !workingDay.isOpen) {
      return [];
    }

    const [startHour, startMinute] = workingDay.start.split(':').map(Number);
    const [endHour, endMinute] = workingDay.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime; time += 30) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const isOccupied = appointments.some((apt: any) => apt.time === timeStr);
      
      slots.push({
        time: timeStr,
        isOccupied,
        appointment: isOccupied ? appointments.find((apt: any) => apt.time === timeStr) : null
      });
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleCreateAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.service || !newAppointment.time) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const selectedService = services.find((s: any) => s.name === newAppointment.service);
    const price = selectedService ? selectedService.price : barber.pricing?.corteBasico || 15;

    createAppointmentMutation.mutate({
      barberId: barber.barberId,
      clientName: newAppointment.clientName,
      clientPhone: newAppointment.clientPhone,
      service: newAppointment.service,
      price: price.toString(),
      date: newAppointment.date,
      time: newAppointment.time,
    });
  };

  const handleCreateService = () => {
    if (!newService.name || !newService.price) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre y precio del servicio",
        variant: "destructive",
      });
      return;
    }

    createServiceMutation.mutate({
      barberId: barber.barberId,
      name: newService.name,
      price: newService.price,
      duration: newService.duration,
      description: newService.description,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">
              Panel de {barber.name}
            </h1>
            <p className="text-amber-700">{barber.shopName}</p>
            <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
              Suscripción Activa
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={copyLink}
              className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white"
            >
              {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {linkCopied ? "Copiado" : "Copiar Enlace"}
            </Button>
            <Button 
              onClick={logout} 
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Citas Hoy</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Servicios</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Hoy</p>
                  <p className="text-2xl font-bold">
                    €{appointments.reduce((sum: number, apt: any) => sum + (parseFloat(apt.price) || 0), 0).toFixed(2)}
                  </p>
                </div>
                <Euro className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próxima Cita</p>
                  <p className="text-lg font-bold">
                    {appointments.length > 0 ? appointments[0]?.time : "Sin citas"}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar and Time Slots */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      disabled={isToday(selectedDate)}
                    >
                      Hoy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Día no laborable</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {timeSlots.map((slot: any) => (
                      <Button
                        key={slot.time}
                        variant={slot.isOccupied ? "default" : "outline"}
                        className={`h-20 flex flex-col justify-center ${
                          slot.isOccupied 
                            ? "bg-gradient-to-r from-amber-500 to-red-500 text-white" 
                            : "border-dashed border-amber-300 hover:bg-amber-50"
                        }`}
                        onClick={() => {
                          if (!slot.isOccupied) {
                            setNewAppointment(prev => ({
                              ...prev,
                              time: slot.time,
                              date: format(selectedDate, 'yyyy-MM-dd')
                            }));
                            setShowNewAppointment(true);
                          }
                        }}
                      >
                        <span className="font-bold">{slot.time}</span>
                        {slot.isOccupied && slot.appointment ? (
                          <div className="text-xs">
                            <div>{slot.appointment.clientName}</div>
                            <div>{slot.appointment.service}</div>
                          </div>
                        ) : (
                          <span className="text-xs opacity-70">Disponible</span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <Button
                    onClick={() => setShowNewAppointment(true)}
                    className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cita
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Citas de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay citas programadas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="p-3 border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-amber-900">
                              {appointment.time}
                            </div>
                            <div className="text-sm font-medium">
                              {appointment.clientName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.service}
                            </div>
                            {appointment.clientPhone && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {appointment.clientPhone}
                              </div>
                            )}
                            <div className="text-sm font-semibold text-green-600 mt-1">
                              €{appointment.price}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Mis Servicios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {services.map((service: any) => (
                    <div
                      key={service.id}
                      className="p-2 border rounded bg-gradient-to-r from-blue-50 to-purple-50"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            €{service.price} • {service.duration || '30'} min
                          </div>
                        </div>
                        <Badge variant="secondary">{service.price}€</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setShowNewService(true)}
                  variant="outline"
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Servicio
                </Button>
              </CardContent>
            </Card>

            {/* Quick Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Copy className="h-5 w-5" />
                  Enlace de Reservas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded border text-sm break-all">
                    {shareableLink}
                  </div>
                  <Button
                    onClick={copyLink}
                    className="w-full"
                    variant="outline"
                  >
                    {linkCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {linkCopied ? "¡Copiado!" : "Copiar Enlace"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* New Appointment Modal */}
        <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Cita</DialogTitle>
              <DialogDescription>
                Crear una nueva cita para {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nombre del Cliente *</Label>
                <Input
                  id="clientName"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input
                  id="clientPhone"
                  value={newAppointment.clientPhone}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="Número de teléfono"
                />
              </div>
              <div>
                <Label htmlFor="service">Servicio *</Label>
                <Select
                  value={newAppointment.service}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name} - €{service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Hora *</Label>
                <Select
                  value={newAppointment.time}
                  onValueChange={(value) => setNewAppointment(prev => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots
                      .filter((slot: any) => !slot.isOccupied)
                      .map((slot: any) => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateAppointment}
                  disabled={createAppointmentMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700"
                >
                  {createAppointmentMutation.isPending ? "Creando..." : "Crear Cita"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewAppointment(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Service Modal */}
        <Dialog open={showNewService} onOpenChange={setShowNewService}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Servicio</DialogTitle>
              <DialogDescription>
                Agregar un nuevo servicio a tu lista
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Nombre del Servicio *</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Corte con barba"
                />
              </div>
              <div>
                <Label htmlFor="servicePrice">Precio (€) *</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duración (minutos)</Label>
                <Select
                  value={newService.duration}
                  onValueChange={(value) => setNewService(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="serviceDescription">Descripción</Label>
                <Input
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del servicio"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateService}
                  disabled={createServiceMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createServiceMutation.isPending ? "Creando..." : "Crear Servicio"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewService(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}