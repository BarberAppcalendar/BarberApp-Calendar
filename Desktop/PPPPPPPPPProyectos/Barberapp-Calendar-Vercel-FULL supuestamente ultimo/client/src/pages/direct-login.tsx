import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { firestoreService } from "@/lib/firebase-services";
import { Eye, EyeOff, LogIn } from "lucide-react";

export function DirectLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔄 Intentando login directo para:", email);
      
      // Usuarios de demo hardcodeados para testing
      const demoUsers = [
        {
          email: "expired.user.1751292327681@example.com",
          password: "expired123456",
          barberId: "expired_user_1751292327681",
          name: "Ana Rodríguez",
          shopName: "Salón Premium Ana",
          subscriptionStatus: "expired",
          subscriptionExpires: { seconds: 1717113600 }, // Fecha pasada
          trialEndsAt: { seconds: 1714521600 }, // Fecha pasada
          isActive: true
        },
        {
          email: "demo.user.1751292234005@example.com",
          password: "demo123456",
          barberId: "demo_user_1751292234005",
          name: "Carlos Méndez",
          shopName: "Barbería El Elegante",
          subscriptionStatus: "trial",
          subscriptionExpires: { seconds: Date.now() / 1000 + 30 * 24 * 60 * 60 }, // 30 días
          trialEndsAt: { seconds: Date.now() / 1000 + 30 * 24 * 60 * 60 }, // 30 días
          isActive: true
        }
      ];

      const barber = demoUsers.find(u => u.email === email && u.password === password);
      
      if (!barber) {
        throw new Error("Usuario no encontrado o contraseña incorrecta");
      }

      console.log("✅ Login directo exitoso:", barber.name);
      
      // Guardar datos en localStorage para simular sesión
      localStorage.setItem("directAuthBarber", JSON.stringify({
        id: 0,
        barberId: barber.barberId,
        name: barber.name,
        shopName: barber.shopName,
        email: barber.email,
        subscriptionStatus: barber.subscriptionStatus,
        subscriptionExpires: barber.subscriptionExpires,
        trialEndsAt: barber.trialEndsAt,
        isActive: barber.isActive
      }));

      toast({
        title: "Login exitoso",
        description: `Bienvenido, ${barber.name}`,
      });

      // Redirigir al dashboard directo
      setLocation("/direct-dashboard");

    } catch (error: any) {
      console.error("❌ Error en login directo:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillExpiredUser = () => {
    setEmail("expired.user.1751292327681@example.com");
    setPassword("expired123456");
  };

  const fillDemoUser = () => {
    setEmail("demo.user.1751292234005@example.com");
    setPassword("demo123456");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-amber-900">
            Login Directo BarberApp
          </CardTitle>
          <CardDescription className="text-amber-700">
            Acceso directo para testing de suscripciones
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleDirectLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-amber-900">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.email@ejemplo.com"
                required
                className="border-amber-200 focus:border-amber-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-900">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  className="border-amber-200 focus:border-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          {/* Botones de usuarios de prueba */}
          <div className="space-y-3 pt-4 border-t border-amber-200">
            <p className="text-sm text-amber-800 text-center font-medium">Usuarios de Prueba:</p>
            
            <Button
              onClick={fillExpiredUser}
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              🔴 Usuario Expirado
              <span className="text-xs ml-2">(suscripción caducada)</span>
            </Button>
            
            <Button
              onClick={fillDemoUser}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50"
            >
              ✅ Usuario Demo
              <span className="text-xs ml-2">(trial activo)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DirectLogin;