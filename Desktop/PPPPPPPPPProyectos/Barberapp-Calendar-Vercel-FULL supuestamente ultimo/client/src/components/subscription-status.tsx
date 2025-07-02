import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle, Clock, CreditCard } from "lucide-react";
import { useLocation } from "wouter";

interface SubscriptionStatusProps {
  barberId: string;
}

interface SubscriptionData {
  subscriptionStatus: string;
  subscriptionExpires: string;
  daysUntilExpiry: number;
  isActive: boolean;
  needsRenewal: boolean;
}

export function SubscriptionStatus({ barberId }: SubscriptionStatusProps) {
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading } = useQuery<SubscriptionData>({
    queryKey: ['/api/subscriptions/status', barberId],
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
  });

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <div className="animate-pulse bg-gray-200 h-6 w-6 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return null;
  }

  const getStatusColor = () => {
    if (!subscription.isActive) return "bg-red-50 border-red-200";
    if (subscription.needsRenewal) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  const getStatusIcon = () => {
    if (!subscription.isActive) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (subscription.needsRenewal) return <Clock className="h-5 w-5 text-orange-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getStatusText = () => {
    if (!subscription.isActive) return "Suscripción Expirada";
    if (subscription.needsRenewal) return "Renovación Requerida";
    return "Suscripción Activa";
  };

  const getStatusBadge = () => {
    if (!subscription.isActive) {
      return <Badge variant="destructive">EXPIRADA</Badge>;
    }
    if (subscription.needsRenewal) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">EXPIRA PRONTO</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">ACTIVA</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getMessage = () => {
    if (!subscription.isActive) {
      return "Tu suscripción ha expirado. Renueva ahora para seguir gestionando tus citas.";
    }
    if (subscription.daysUntilExpiry <= 0) {
      return "Tu suscripción expira hoy. ¡Renueva ahora para evitar interrupciones!";
    }
    if (subscription.daysUntilExpiry === 1) {
      return "Tu suscripción expira mañana. Considera renovar para mantener el servicio activo.";
    }
    if (subscription.needsRenewal) {
      return `Tu suscripción expira en ${subscription.daysUntilExpiry} días. Renueva pronto para evitar interrupciones.`;
    }
    return `Tu suscripción está activa y expira en ${subscription.daysUntilExpiry} días.`;
  };

  return (
    <Card className={`${getStatusColor()} mb-6`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {getStatusText()}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {getMessage()}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Expira: {formatDate(subscription.subscriptionExpires)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {subscription.daysUntilExpiry > 0 
                      ? `${subscription.daysUntilExpiry} día${subscription.daysUntilExpiry !== 1 ? 's' : ''} restante${subscription.daysUntilExpiry !== 1 ? 's' : ''}`
                      : "Expirada"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {(subscription.needsRenewal || !subscription.isActive) && (
            <Button 
              className={`${
                subscription.isActive 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
              onClick={() => setLocation("/subscribe")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {subscription.isActive ? "Renovar" : "Reactivar"}
            </Button>
          )}
        </div>

        {subscription.isActive && !subscription.needsRenewal && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">
                ✅ Todas las funciones están disponibles
              </span>
              <Button 
                variant="outline" 
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setLocation("/subscribe")}
              >
                Gestionar Suscripción
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}