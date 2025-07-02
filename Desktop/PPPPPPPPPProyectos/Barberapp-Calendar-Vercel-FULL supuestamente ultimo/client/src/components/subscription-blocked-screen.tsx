import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, Calendar, LogOut, Clock } from "lucide-react";
import { useLocation } from "wouter";
import PayPalButton from "@/components/PayPalButton";

interface SubscriptionBlockedScreenProps {
  barberName: string;
  shopName: string;
  subscriptionExpires: string;
  daysUntilExpiry: number;
  onLogout: () => void;
}

export function SubscriptionBlockedScreen({ 
  barberName, 
  shopName, 
  subscriptionExpires,
  daysUntilExpiry,
  onLogout 
}: SubscriptionBlockedScreenProps) {
  const [, setLocation] = useLocation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysExpiredText = () => {
    const daysExpired = Math.abs(daysUntilExpiry);
    if (daysExpired === 1) {
      return "hace 1 día";
    }
    return `hace ${daysExpired} días`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header con logout */}
        <div className="flex justify-end mb-6">
          <Button 
            onClick={onLogout} 
            variant="outline" 
            className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>

        {/* Contenido principal */}
        <Card className="border-red-200 bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            {/* Icono de alerta */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-red-800 mb-2">
              Suscripción Expirada
            </h1>
            
            {/* Información del barbero */}
            <div className="mb-6">
              <p className="text-lg text-gray-700 mb-1">
                Hola <strong>{barberName}</strong>
              </p>
              <p className="text-gray-600">
                {shopName}
              </p>
            </div>

            {/* Información de la expiración */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-red-600" />
                <h2 className="text-xl font-semibold text-red-800">
                  Acceso Suspendido
                </h2>
              </div>
              <p className="text-red-700 mb-4">
                Tu suscripción expiró el <strong>{formatDate(subscriptionExpires)}</strong>
                <br />
                ({getDaysExpiredText()})
              </p>
              <p className="text-red-600 text-sm">
                Para acceder a tu dashboard y gestionar citas, debes renovar tu suscripción.
              </p>
            </div>

            {/* Beneficios de renovar */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Al renovar tendrás acceso a:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Dashboard completo de citas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Calendario interactivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Gestión de horarios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Enlaces de reserva para clientes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Configuración de servicios</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Sincronización en tiempo real</span>
                </div>
              </div>
            </div>

            {/* Botón de renovación PayPal */}
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-green-700 mb-2">
                  Renovar por solo €4.95/mes
                </h4>
                <p className="text-sm text-gray-600">
                  Pago seguro con PayPal • Suscripción mensual
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="mb-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-800">
                    Haz clic en el botón PayPal para renovar instantáneamente
                  </p>
                </div>
                
                {/* Botón PayPal integrado */}
                <div className="flex justify-center">
                  <div className="w-48 h-12 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <PayPalButton 
                      amount="4.95"
                      currency="EUR"
                      intent="CAPTURE"
                    />
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Después del pago tu acceso se restaurará automáticamente
              </p>
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda? Contáctanos respondiendo a cualquier email de notificación.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}