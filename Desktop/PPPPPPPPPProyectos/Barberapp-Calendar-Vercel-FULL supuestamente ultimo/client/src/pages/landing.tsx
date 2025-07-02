
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Scissors, Calendar, Users, Clock, Star, CheckCircle, ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scissors className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">BarberApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            La App de Gestión para
            <span className="text-blue-600 block">Barberos Modernos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Gestiona tu barbería de forma profesional con nuestro sistema completo de reservas, 
            clientes y horarios. Potenciado por Firebase para máxima seguridad y rendimiento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Empezar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Acceso Rápido
              </h2>
              <p className="text-gray-600">
                ¿Ya tienes cuenta? Inicia sesión para acceder a tu panel de control
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Para Barberos Existentes
                </h3>
                <p className="text-gray-600">
                  Accede a tu dashboard para gestionar citas, clientes y horarios
                </p>
                <Link href="/login">
                  <Button className="w-full" size="lg">
                    Iniciar Sesión
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  ¿Primera vez aquí?
                </h3>
                <p className="text-gray-600">
                  Crea tu cuenta gratuita y comienza a gestionar tu barbería hoy mismo
                </p>
                <Link href="/register">
                  <Button variant="outline" className="w-full" size="lg">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas para tu barbería
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Herramientas profesionales diseñadas específicamente para barberos modernos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestión de Citas</CardTitle>
              <CardDescription>
                Sistema completo de reservas en tiempo real con sincronización automática
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Calendario en tiempo real
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Enlace de reservas personalizado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Notificaciones automáticas
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>
                Administra tu base de clientes de forma segura y eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Historial completo
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Datos seguros en Firebase
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Acceso desde cualquier dispositivo
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Horarios Flexibles</CardTitle>
              <CardDescription>
                Configura tus horarios, descansos y disponibilidad fácilmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Horarios personalizables
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Gestión de descansos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Servicios y precios custom
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Firebase Benefits */}
      <section className="container mx-auto px-4 py-20 bg-white/50 rounded-3xl mx-4">
        <div className="text-center mb-16">
          
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Seguridad y Rendimiento de Clase Mundial
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu barbería merece la mejor tecnología disponible
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Seguridad Avanzada</h3>
            <p className="text-sm text-gray-600">Datos protegidos con encriptación de nivel empresarial</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">99.9% Uptime</h3>
            <p className="text-sm text-gray-600">Disponibilidad garantizada para tu negocio</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Tiempo Real</h3>
            <p className="text-sm text-gray-600">Sincronización instantánea en todos los dispositivos</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Escalable</h3>
            <p className="text-sm text-gray-600">Crece con tu negocio sin límites</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            ¿Listo para revolucionar tu barbería?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a cientos de barberos que ya están usando BarberApp para gestionar 
            sus negocios de forma profesional.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Empezar Ahora - Es Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/direct-login">
              <Button variant="outline" className="text-sm border-amber-300 text-amber-700 hover:bg-amber-50">
                🧪 Panel de Testing y Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
