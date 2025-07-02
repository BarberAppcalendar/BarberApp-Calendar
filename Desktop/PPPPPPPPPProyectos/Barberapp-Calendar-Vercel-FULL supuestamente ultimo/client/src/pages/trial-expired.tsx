import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { Clock, Crown, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

export default function TrialExpired() {
  const [selectedPayment, setSelectedPayment] = useState<"paypal" | null>(null);

  // Simulando datos del barbero con trial expirado
  const mockBarber = {
    name: "Carlos Mendez",
    shopName: "Barbería El Corte",
    subscriptionStatus: "expired",
    trialEndsAt: "2025-06-20T00:00:00.000Z", // Hace 6 días
    subscriptionExpires: "2025-06-20T00:00:00.000Z"
  };

  const daysExpired = Math.ceil((new Date().getTime() - new Date(mockBarber.trialEndsAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Alert de prueba expirada */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Tu período de prueba gratuita ha expirado hace {daysExpired} días.</strong>
            <br />
            Para continuar usando BarberApp Calendar, activa tu suscripción Premium ahora.
          </AlertDescription>
        </Alert>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-12 h-12 text-orange-500 mr-3" />
            <h1 className="text-4xl font-bold">¡Continúa con Premium!</h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Hola {mockBarber.name}, tu prueba gratuita de BarberApp Calendar ha finalizado
          </p>
          
          <div className="flex justify-center mb-6">
            <Badge variant="destructive" className="text-lg px-6 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Acceso suspendido desde hace {daysExpired} días
            </Badge>
          </div>
        </div>

        {/* Funciones que se pierden sin premium */}
        <Card className="mb-8 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 text-center">
              Sin Premium, pierdes acceso a:
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Calendario de citas</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Reservas online de clientes</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Gestión de horarios</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Panel de cliente</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Configuración de precios</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Cancelación de citas</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Enlace de booking personal</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <X className="w-5 h-5 text-red-500 mr-3" />
                  <span className="line-through">Soporte técnico</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Premium */}
        <Card className="mb-8 border-2 border-green-500 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardTitle className="text-2xl">¡Reactiva tu Premium!</CardTitle>
            <CardDescription className="text-green-100">
              Recupera el control total de tu barbería
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-2 text-green-600">€4.95</div>
              <div className="text-gray-600">por mes</div>
              <div className="text-sm text-orange-600 font-semibold mt-2">
                ⚡ Activación inmediata
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Calendario inteligente restaurado</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Reservas online reactivadas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Acceso completo a tu panel</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Panel de clientes disponible</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Todas tus citas guardadas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Configuración preserved</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte prioritario</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Sin pérdida de datos</span>
                </div>
              </div>
            </div>

            {/* Botón de PayPal para reactivar */}
            <div className="text-center">
              <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                <input type="hidden" name="cmd" value="_xclick-subscriptions" />
                <input type="hidden" name="business" value="barberapp.calendar@gmail.com" />
                <input type="hidden" name="item_name" value="BarberApp Calendar Premium - Reactivación" />
                <input type="hidden" name="item_number" value="premium-reactivation" />
                <input type="hidden" name="currency_code" value="EUR" />
                <input type="hidden" name="a3" value="4.95" />
                <input type="hidden" name="p3" value="1" />
                <input type="hidden" name="t3" value="M" />
                <input type="hidden" name="src" value="1" />
                <input type="hidden" name="sra" value="1" />
                <input type="hidden" name="no_note" value="1" />
                <input type="hidden" name="custom" value={mockBarber.name} />
                <input type="hidden" name="notify_url" value={`${window.location.origin}/api/paypal/webhook`} />
                <input type="hidden" name="return" value={`${window.location.origin}/dashboard?payment=reactivated`} />
                <input type="hidden" name="cancel_return" value={`${window.location.origin}/trial-expired`} />
                
                <Button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mb-4" 
                  size="lg"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-3 bg-white rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">PP</span>
                    </div>
                    Reactivar Premium con PayPal - €4.95/mes
                  </div>
                </Button>
              </form>
              
              <p className="text-sm text-gray-600 mb-4">
                🔒 Pago seguro • Activación inmediata • Cancela cuando quieras
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-blue-700 text-sm">
              Si tienes problemas con el pago o necesitas asistencia, contacta nuestro soporte.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                Volver al Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                Página Principal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente X para mostrar elementos desactivados
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}