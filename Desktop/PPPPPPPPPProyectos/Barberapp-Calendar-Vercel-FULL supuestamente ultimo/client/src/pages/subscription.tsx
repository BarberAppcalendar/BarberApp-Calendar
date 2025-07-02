import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/contexts/firebase-auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, CreditCard, Shield, Clock, Users } from 'lucide-react';
import { Footer } from '@/components/footer';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface PayPalButtonProps {
  amount: string;
  currency: string;
  intent: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

function PayPalSubscriptionButton({ amount, currency, intent, onSuccess, onError }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Load PayPal SDK with production client ID
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=AcOHFnAtwMCUmjpZVhfg6M7v8CKE8Hq47hvYWpB4zNWNEMFt4KCBF4xgz7_P8a3nNELOxO2wCE3ZJl4-&vault=true&intent=subscription&currency=EUR";
      script.async = true;
      script.onload = () => {
        setPaypalLoaded(true);
        setIsLoading(false);
      };
      document.body.appendChild(script);
    } else {
      setPaypalLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
          height: 45
        },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            'plan_id': 'P-YOUR_PLAN_ID', // This should be configured in PayPal
            'application_context': {
              'brand_name': 'BarberApp Calendar',
              'user_action': 'SUBSCRIBE_NOW'
            }
          });
        },
        onApprove: function(data: any, actions: any) {
          console.log('Subscription approved:', data.subscriptionID);
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: function(err: any) {
          console.error('PayPal error:', err);
          if (onError) {
            onError(err);
          }
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, onSuccess, onError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <div id="paypal-button-container" className="w-full"></div>;
}

export default function SubscriptionPage() {
  const { barber } = useFirebaseAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    {
      icon: <Clock className="h-5 w-5 text-green-600" />,
      title: "Gestión de Horarios Completa",
      description: "Configura horarios de trabajo y descansos personalizados"
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      title: "Reservas Ilimitadas",
      description: "Acepta todas las citas que necesites sin límites"
    },
    {
      icon: <CreditCard className="h-5 w-5 text-green-600" />,
      title: "Servicios Personalizados",
      description: "Crea y edita tus servicios con precios personalizados"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-600" />,
      title: "Datos Seguros",
      description: "Protección completa de datos de clientes y citas"
    }
  ];

  const handleSubscriptionSuccess = async (subscriptionData?: any) => {
    setIsProcessing(true);
    
    try {
      // Activate subscription on the server
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionData?.subscriptionID || 'paypal-subscription',
          paypalSubscriptionId: subscriptionData?.subscriptionID
        }),
      });

      if (response.ok) {
        toast({
          title: "¡Suscripción Activada!",
          description: "Tu suscripción mensual se ha activado correctamente. Redirigiendo al panel...",
        });

        // Redirect to dashboard after successful subscription
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error('Failed to activate subscription');
      }
    } catch (error) {
      console.error('Subscription activation error:', error);
      toast({
        title: "Error de Activación",
        description: "La suscripción se procesó pero hubo un error al activarla. Contacta soporte.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscriptionError = (error: any) => {
    console.error('Subscription error:', error);
    toast({
      title: "Error en la Suscripción",
      description: "Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.",
      variant: "destructive"
    });
  };

  const trialEndDate = barber?.subscriptionExpires 
    ? barber.subscriptionExpires.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Crown className="h-12 w-12 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent mb-4">
              ¡Tu Prueba Gratuita Ha Terminado!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Continúa disfrutando de BarberApp Calendar con nuestra suscripción mensual
            </p>
            {trialEndDate && (
              <p className="text-sm text-gray-500">
                Tu período de prueba terminó el {trialEndDate}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            
            {/* Pricing Card */}
            <Card className="border-2 border-amber-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6" />
                  Plan Profesional
                </CardTitle>
                <CardDescription className="text-amber-100">
                  Acceso completo a todas las funciones
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    €4.95
                    <span className="text-xl font-normal text-gray-600">/mes</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Sin compromiso de permanencia
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 text-center">
                    Activa tu suscripción con PayPal
                  </h4>
                  {isProcessing ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <span>Procesando suscripción...</span>
                    </div>
                  ) : (
                    <PayPalSubscriptionButton
                      amount="4.95"
                      currency="EUR"
                      intent="subscription"
                      onSuccess={handleSubscriptionSuccess}
                      onError={handleSubscriptionError}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  ¿Por qué elegir BarberApp Calendar?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Interfaz Profesional</h4>
                      <p className="text-sm text-gray-600">Diseño elegante y fácil de usar para barberos profesionales</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Sistema de Reservas Inteligente</h4>
                      <p className="text-sm text-gray-600">Gestión automática de horarios con intervalos de 30 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Acceso desde Cualquier Dispositivo</h4>
                      <p className="text-sm text-gray-600">Funciona en móvil, tablet y ordenador</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Soporte Técnico</h4>
                      <p className="text-sm text-gray-600">Ayuda profesional cuando la necesites</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Actualizaciones Constantes</h4>
                      <p className="text-sm text-gray-600">Nuevas funciones y mejoras regularmente</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h4>
                  <p className="text-sm text-blue-700">
                    Si tienes alguna pregunta sobre la suscripción o necesitas asistencia técnica, 
                    contacta con nuestro equipo de soporte.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500 mb-8">
            <p>
              Tu suscripción se renovará automáticamente cada mes. 
              Puedes cancelar en cualquier momento desde tu cuenta PayPal.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}