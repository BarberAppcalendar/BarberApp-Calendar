import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PayPalButton from "@/components/PayPalButton";

export default function PaymentPayPal() {
  const { barber } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Acceso Requerido</CardTitle>
            <CardDescription>Inicia sesión para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayPalSubscription = async () => {
    setIsLoading(true);
    try {
      // Get PayPal subscription button configuration
      const response = await apiRequest("GET", "/api/paypal/subscription-config");
      const data = await response.json();
      
      if (data.buttonId) {
        // Redirect to PayPal subscription page
        window.open(
          `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${data.planId}`,
          '_blank'
        );
      } else {
        throw new Error("PayPal configuration not available");
      }
    } catch (error) {
      console.error("PayPal subscription error:", error);
      toast({
        title: "Error",
        description: "No se pudo inicializar el pago con PayPal",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/subscribe">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-lg font-bold">PP</span>
            </div>
            <CardTitle className="text-2xl">Pago con PayPal</CardTitle>
            <CardDescription>
              Activa tu suscripción premium a BarberApp Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen de la Suscripción</h3>
                <div className="flex justify-between items-center">
                  <span>BarberApp Calendar Premium</span>
                  <span className="font-bold">€4.95/mes</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Primer mes gratuito • Cancela cuando quieras
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">¿Por qué elegir PayPal?</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Pago seguro sin compartir datos bancarios
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Protección del comprador PayPal
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Cancela la suscripción fácilmente desde tu cuenta PayPal
                  </li>
                </ul>
              </div>

              {/* PayPal Integrated Button */}
              <div className="w-full">
                <PayPalButton 
                  amount="4.95"
                  currency="EUR"
                  intent="CAPTURE"
                />
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>🔒 Pago seguro procesado por PayPal</p>
                <p>No se realizará ningún cobro durante el primer mes</p>
                <p>Serás redirigido a PayPal para completar la suscripción</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}