import { Footer } from '@/components/footer';
import RealtimeBookingComponent from '@/components/realtime-booking-component';
import { ArrowLeft, Calendar, Sparkles, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export default function BookingDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-amber-600" />
                <h1 className="text-2xl font-bold text-amber-900">
                  BarberApp Calendar
                </h1>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Demo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-amber-600" />
              <h2 className="text-4xl font-bold text-amber-900">
                Sistema de Reservas en Tiempo Real
              </h2>
            </div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Experimenta nuestro avanzado sistema de reservas con sincronización en tiempo real, 
              horarios inteligentes y una interfaz moderna y responsive.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <Clock className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                <CardTitle className="text-amber-900">Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Las citas se actualizan instantáneamente usando Firebase onSnapshot. 
                  Cuando alguien reserva, la disponibilidad se actualiza al momento.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <Users className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                <CardTitle className="text-amber-900">Multi-Barbero</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Selecciona entre múltiples barberos disponibles, cada uno con sus 
                  propios horarios, servicios y precios personalizados.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <CheckCircle className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                <CardTitle className="text-amber-900">Inteligente</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Respeta horarios de trabajo, descansos, citas existentes y 
                  horarios pasados. Solo muestra lo que realmente está disponible.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demo Component */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-amber-200 p-8 shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">
                Demostración Interactiva
              </h3>
              <p className="text-gray-600">
                Prueba el sistema de reservas completo. Todas las funcionalidades están activas.
              </p>
            </div>

            <RealtimeBookingComponent 
              onBookingComplete={(appointment) => {
                console.log('Demostración - Cita completada:', appointment);
              }}
              className="mb-8"
            />
          </div>

          {/* Technical Features */}
          <div className="mt-12 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 border border-amber-200">
            <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">
              Características Técnicas
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Firebase Firestore onSnapshot</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Intervalos de 30 minutos configurables</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Horarios de trabajo personalizables</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Gestión de descansos automática</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Diseño responsive y moderno</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Validación inteligente de horarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Servicios y precios dinámicos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Prevención de conflictos automática</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}