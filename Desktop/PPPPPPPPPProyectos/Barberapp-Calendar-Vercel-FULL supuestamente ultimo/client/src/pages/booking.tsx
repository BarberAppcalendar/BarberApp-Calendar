import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { authApi } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { insertAppointmentSchema, type InsertAppointment, type Service } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import { z } from "zod";
import { BarberStorage } from "@/lib/barber-storage";
import { Link } from "wouter";
import { PWAInstallButton } from "@/components/pwa-install-button";

interface BookingFormData {
  clientName: string;
  clientPhone?: string;
  service: string;
}

const bookingFormSchema = insertAppointmentSchema.pick({
  clientName: true,
  clientPhone: true,
  service: true,
});

export default function Booking() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [barberId, setBarberId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Get barber ID from URL or use saved barber
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const barberIdFromUrl = urlParams.get('barbero');

    if (barberIdFromUrl) {
      // Using URL parameter (first time or specific barber)
      setBarberId(barberIdFromUrl);
    } else {
      // Try to use saved barber from previous visits
      const savedBarber = BarberStorage.getSavedBarber();
      if (savedBarber) {
        setBarberId(savedBarber.id);
      }
    }
  }, []);

  // Fetch barber data and auto-save for future visits
  const { data: barberData, isLoading: barberLoading } = useQuery({
    queryKey: ["/api/barbers", barberId],
    queryFn: () => authApi.getBarberByBarberId(barberId),
    enabled: !!barberId,
  });

  // Auto-save barber when data is loaded
  useEffect(() => {
    if (barberData?.barber) {
      BarberStorage.saveBarber(
        barberData.barber.barberId,
        barberData.barber.name,
        barberData.barber.shopName
      );
    }
  }, [barberData]);

  // Fetch available slots
  const { data: slotsData } = useQuery({
    queryKey: ["/api/available-slots", barberId, selectedDate],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/available-slots/${barberId}/${selectedDate}`);
      return response.json();
    },
    enabled: !!barberId && !!selectedDate,
  });

  // Fetch services
  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services", barberId],
    enabled: !!barberId,
  });

  const availableSlots = slotsData?.availableSlots || [];
  const barber = barberData?.barber;
  const services = servicesData?.services || [];

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientName: "",
      clientPhone: "",
      service: "corte",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Save barber info automatically after successful booking
      if (barber) {
        BarberStorage.saveBarber(barber.barberId, barber.name, barber.shopName);
      }

      setConfirmedBooking(data.appointment);
      setConfirmationOpen(true);
      queryClient.invalidateQueries({ queryKey: ["/api/available-slots"] });
      form.reset();
      setSelectedTime("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: "Error creating appointment",
      });
    },
  });

  const getServicePrice = (serviceName: string): string | null => {
    // First try to find in custom services
    const service = services.find(s => s.name === serviceName);
    if (service) {
      return service.price;
    }

    // Fallback to legacy pricing for backward compatibility
    switch (serviceName) {
      case 'corte': 
      case 'Corte de cabello': return barber?.priceHaircut || null;
      case 'barba':
      case 'Arreglo de barba': return barber?.priceBeard || null;
      case 'completo':
      case 'Corte completo': return barber?.priceComplete || null;
      case 'afeitado':
      case 'Afeitado': return barber?.priceShave || null;
      default: return null;
    }
  };

  const onSubmit = (data: BookingFormData) => {
    if (!selectedTime) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: "Please select a time",
      });
      return;
    }

    const servicePrice = getServicePrice(data.service);
    const appointmentData: InsertAppointment = {
      barberId: barberId,
      clientName: data.clientName,
      clientPhone: data.clientPhone || "",
      date: selectedDate,
      time: selectedTime,
      service: data.service,
      price: servicePrice,
    };

    bookingMutation.mutate(appointmentData);
  };

  if (barberLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Barber not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400" 
            alt="Professional barber at work" 
            className="hero-image mx-auto mb-6 w-full max-w-4xl h-64"
          />

          <div className="flex justify-center mb-4">
            <PWAInstallButton />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">{barber.shopName}</h1>
          <p className="text-xl text-gray-600 mb-2">{t('booking.subtitle')}</p>
          <p className="text-gray-500">
            {t('booking.barber')}: <span className="font-medium">{barber.name}</span>
          </p>

          {/* Show when barber is saved for easy future access */}
          {BarberStorage.hasBarberSaved() && BarberStorage.getSavedBarber()?.id === barberId && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-blue-800 text-sm font-medium">
                📱 Guardado en tu dispositivo - puedes reservar directamente desde la página principal
              </p>
            </div>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.date')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="rounded-xl"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.time')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSlots.map((time: string) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        className="time-slot-button"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                  {selectedTime && (
                    <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-lg">
                      <p className="text-primary font-medium">
                        {t('booking.selected')}: {selectedTime}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.name')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Juan Martínez"
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.phone')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            type="tel"
                            placeholder="+34 600 000 000"
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('booking.service')}</FormLabel>
                        <div className="grid grid-cols-1 gap-3">
                          {/* Show custom services if available */}
                          {services.length > 0 ? (
                            services.map((service) => (
                              <div
                                key={service.id}
                                className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                                  field.value === service.name
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(service.name)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                      field.value === service.name
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300'
                                    }`}>
                                      {field.value === service.name && (
                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-medium">{service.name}</span>
                                      {service.description && (
                                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-green-600 font-semibold">€{service.price}</span>
                                    {service.duration && (
                                      <p className="text-sm text-gray-500">{service.duration} min</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            /* Fallback to legacy services if no custom services */
                            [
                              { value: 'corte', label: t('services.haircut'), price: barber?.priceHaircut },
                              { value: 'barba', label: t('services.beard'), price: barber?.priceBeard },
                              { value: 'completo', label: t('services.complete'), price: barber?.priceComplete },
                              { value: 'afeitado', label: t('services.shave'), price: barber?.priceShave }
                            ].map((service) => (
                              <div
                                key={service.value}
                                className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                                  field.value === service.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => field.onChange(service.value)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                      field.value === service.value
                                        ? 'border-primary bg-primary'
                                        : 'border-gray-300'
                                    }`}>
                                      {field.value === service.value && (
                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                      )}
                                    </div>
                                    <span className="font-medium">{service.label}</span>
                                  </div>
                                  {service.price && (
                                    <span className="text-green-600 font-semibold">€{service.price}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Booking Summary & Confirmation */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.summary')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-gray-700 mb-6">
                    <div className="flex justify-between">
                      <span>{t('booking.barbershop')}:</span>
                      <span>{barber.shopName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('booking.barber')}:</span>
                      <span>{barber.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('booking.date')}:</span>
                      <span>{format(new Date(selectedDate), 'dd MMMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('booking.time')}:</span>
                      <span>{selectedTime || '-'}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedTime || bookingMutation.isPending}
                    className="w-full py-4 rounded-xl font-semibold"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    {bookingMutation.isPending ? t('common.loading') : t('booking.confirm')}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
              {t('confirmation.title')}
            </DialogTitle>
            <p className="text-gray-600 mb-6">{t('confirmation.message')}</p>
          </DialogHeader>

          {confirmedBooking && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 text-left mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('confirmation.details')}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <div><strong>{t('booking.date')}:</strong> {format(new Date(confirmedBooking.date), 'dd MMMM yyyy')}</div>
                  <div><strong>{t('booking.time')}:</strong> {confirmedBooking.time}</div>
                  <div><strong>{t('booking.barber')}:</strong> {barber.name}</div>
                  <div><strong>{t('booking.client')}:</strong> {confirmedBooking.clientName}</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <div className="text-blue-600 mr-2">📱</div>
                  <h4 className="font-semibold text-blue-800">Barbero guardado automáticamente</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Ahora puedes reservar futuras citas directamente desde el botón "Mi Barbero" en la página principal.
                </p>
                <Link href="/client">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                    Ir a "Mi Barbero"
                  </Button>
                </Link>
              </div>
            </>
          )}

          <Button
            onClick={() => setConfirmationOpen(false)}
            className="w-full rounded-xl"
          >
            {t('common.close')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}