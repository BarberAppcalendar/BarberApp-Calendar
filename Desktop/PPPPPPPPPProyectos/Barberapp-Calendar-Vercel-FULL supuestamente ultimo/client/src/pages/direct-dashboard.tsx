import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Settings, Users, DollarSign, Clock, LogOut, Copy, ExternalLink, Scissors, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionBlockedScreen } from "@/components/subscription-blocked-screen";

interface DirectBarber {
  id: number;
  barberId: string;
  name: string;
  shopName: string;
  email: string;
  subscriptionStatus: string;
  subscriptionExpires: any;
  trialEndsAt: any;
  isActive: boolean;
}

export default function DirectDashboard() {
  const [barber, setBarber] = useState<DirectBarber | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Cargar datos del localStorage
    const storedBarber = localStorage.getItem("directAuthBarber");
    if (storedBarber) {
      try {
        const barberData = JSON.parse(storedBarber);
        setBarber(barberData);
        console.log("✅ Datos de barbero cargados desde localStorage:", barberData.name);
      } catch (error) {
        console.error("❌ Error parseando datos del barbero:", error);
        setLocation("/direct-login");
      }
    } else {
      setLocation("/direct-login");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("directAuthBarber");
    setLocation("/direct-login");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    });
  };

  const copyBookingLink = () => {
    if (barber) {
      const bookingLink = `${window.location.origin}/book/${barber.barberId}`;
      navigator.clipboard.writeText(bookingLink);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace de reservas ha sido copiado al portapapeles",
      });
    }
  };

  const openBookingLink = () => {
    if (barber) {
      const bookingLink = `${window.location.origin}/book/${barber.barberId}`;
      window.open(bookingLink, '_blank');
    }
  };

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Verificar si la suscripción ha expirado
  const isSubscriptionExpired = () => {
    if (barber.subscriptionStatus === 'expired') return true;
    if (barber.subscriptionStatus === 'trial') {
      const trialEnd = barber.trialEndsAt?.seconds ? new Date(barber.trialEndsAt.seconds * 1000) : new Date(barber.trialEndsAt);
      return new Date() > trialEnd;
    }
    if (barber.subscriptionExpires) {
      const expirationDate = barber.subscriptionExpires?.seconds ? new Date(barber.subscriptionExpires.seconds * 1000) : new Date(barber.subscriptionExpires);
      return new Date() > expirationDate;
    }
    return false;
  };

  const getSubscriptionStatusBadge = () => {
    if (isSubscriptionExpired()) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Suscripción Expirada
        </Badge>
      );
    }
    
    if (barber.subscriptionStatus === 'trial') {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="h-3 w-3 mr-1" />
          Trial Activo
        </Badge>
      );
    }
    
    if (barber.subscriptionStatus === 'active') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          ✅ Suscripción Activa
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        Estado: {barber.subscriptionStatus}
      </Badge>
    );
  };

  const getExpirationInfo = () => {
    if (barber.subscriptionStatus === 'trial' && barber.trialEndsAt) {
      const trialEnd = barber.trialEndsAt?.seconds ? new Date(barber.trialEndsAt.seconds * 1000) : new Date(barber.trialEndsAt);
      return `Trial termina: ${format(trialEnd, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
    }
    
    if (barber.subscriptionExpires) {
      const expirationDate = barber.subscriptionExpires?.seconds ? new Date(barber.subscriptionExpires.seconds * 1000) : new Date(barber.subscriptionExpires);
      return `Suscripción ${isSubscriptionExpired() ? 'expiró' : 'expira'}: ${format(expirationDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`;
    }
    
    return "Sin información de expiración";
  };

  // Si la suscripción está expirada, mostrar pantalla de bloqueo
  if (isSubscriptionExpired()) {
    const expirationDate = barber.subscriptionExpires?.seconds ? new Date(barber.subscriptionExpires.seconds * 1000) : new Date(barber.subscriptionExpires);
    const daysExpired = Math.floor((new Date().getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <SubscriptionBlockedScreen 
        barberName={barber.name}
        shopName={barber.shopName}
        subscriptionExpires={expirationDate.toISOString()}
        daysUntilExpiry={-daysExpired} // Negative since it's expired
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <Scissors className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido, {barber.name}
              </h1>
              <p className="text-gray-600">{barber.shopName}</p>
              <div className="mt-2 flex flex-col gap-2">
                {getSubscriptionStatusBadge()}
                <p className="text-sm text-gray-500">{getExpirationInfo()}</p>
              </div>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        {/* Enlaces de reserva */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Enlaces de Reserva para Clientes</span>
            </CardTitle>
            <CardDescription>
              Comparte estos enlaces para que tus clientes puedan reservar citas online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={copyBookingLink}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Enlace
              </Button>
              <Button 
                onClick={openBookingLink}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Panel
              </Button>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <code className="text-sm text-gray-700">
                {window.location.origin}/book/{barber.barberId}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-2xl font-bold">€0</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibilidad</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mensaje informativo para modo demo */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Scissors className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Dashboard de Testing</h3>
              <p className="text-gray-600">
                Este es un dashboard simplificado para probar el sistema de suscripciones. 
                {isSubscriptionExpired() ? (
                  <span className="text-red-600 font-medium"> Tu suscripción ha expirado y deberías ver la pantalla de renovación.</span>
                ) : (
                  <span className="text-green-600 font-medium"> Tu suscripción está activa y puedes acceder al sistema.</span>
                )}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}