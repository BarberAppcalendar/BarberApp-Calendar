import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { CheckCircle, Clock, CreditCard, Calendar, Euro, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import PayPalButton from "@/components/PayPalButton";

interface SubscriptionInfo {
  status: string;
  expiresAt: string;
  trialEndsAt: string | null;
  isPayPalConfigured: boolean;
  subscriptionPrice: string;
  currency: string;
}

export default function Subscribe() {
  const { t, language } = useI18n();
  const { barber } = useFirebaseAuth();
  const [selectedPayment, setSelectedPayment] = useState<"stripe" | "paypal" | null>(null);

  // Fetch subscription status
  const { data: subscriptionInfo, isLoading } = useQuery<SubscriptionInfo>({
    queryKey: ["/api/subscription/status"],
    enabled: !!barber,
    queryFn: async () => {
      const res = await fetch("/api/subscription/status", {
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch subscription status");
      }
      
      return await res.json();
    },
  });

  if (!barber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-amber-900">
              {t("accessRequired")}
            </CardTitle>
            <CardDescription className="text-amber-700">
              {t("loginToManageSubscription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-300">
                {t("login")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-amber-700">{t("loadingSubscriptionInfo")}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />{t("active")}</Badge>;
      case "trial":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />{t("trial")}</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />{t("expired")}</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t("cancelled")}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === "es" ? es : enUS;
    return format(date, "PPP", { locale });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-amber-900">BarberApp Calendar Premium</h1>
          <p className="text-xl text-amber-700 mb-6">
            {t("manageBarbershipProfessionally")}
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionInfo && (
          <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl text-amber-900">{t("subscriptionStatus")}</span>
                {getStatusBadge(subscriptionInfo.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-amber-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-semibold">{t("subscriptionExpires")}:</span>
                  </div>
                  <p className="text-gray-700 ml-6">{formatDate(subscriptionInfo.expiresAt)}</p>
                </div>
                
                {subscriptionInfo.trialEndsAt && (
                  <div className="space-y-2">
                    <div className="flex items-center text-amber-700">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{t("trialEnds")}:</span>
                    </div>
                    <p className="text-gray-700 ml-6">{formatDate(subscriptionInfo.trialEndsAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plan Details */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">{t("premiumPlan")}</CardTitle>
            <CardDescription className="text-amber-100">
              {t("everythingForYourBarbershop")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-2">€4.95</div>
              <div className="text-gray-600">por mes</div>
              <div className="text-sm text-green-600 font-semibold mt-2">
                ✨ Primer mes GRATIS
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Calendario inteligente con citas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Reservas online 24/7</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Gestión de horarios y descansos</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Configuración de precios por servicio</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Panel para clientes sin registro</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Cancelación de citas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte multiidioma</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Actualizaciones automáticas</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center mb-6">Elige tu método de pago</h3>
              
              <div className="text-center">
                <Link href="/payment/paypal">
                  <Button size="lg" className="px-12 bg-blue-600 hover:bg-blue-700">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-3 bg-white rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">PP</span>
                      </div>
                      Suscribirse con PayPal
                    </div>
                  </Button>
                </Link>
                <p className="text-sm text-gray-600 mt-4">
                  Pago seguro y fácil cancelación desde tu cuenta PayPal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-sm text-gray-600">
          <p>🔒 Pago 100% seguro. Puedes cancelar en cualquier momento.</p>
          <p>No se realizará ningún cobro durante el período de prueba gratuita.</p>
        </div>
      </div>
    </div>
  );
}