import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";
import { usePWA } from "@/hooks/use-pwa";
import { useState } from "react";

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isSupported, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed || !isSupported) {
    return null;
  }

  // Only show if browser detected PWA is installable
  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    
    if (!success) {
      // Show manual installation instructions
      const isAndroid = /Android/.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      let message = "";
      if (isAndroid) {
        message = "Para instalar:\n1. Toca el menú del navegador (⋮)\n2. Selecciona 'Instalar aplicación'\n3. Confirma la instalación";
      } else if (isIOS) {
        message = "Para instalar:\n1. Toca el botón 'Compartir' (⬆️)\n2. Selecciona 'Añadir a la pantalla de inicio'\n3. Confirma tocando 'Añadir'";
      } else {
        message = "Para instalar:\n1. Busca el ícono de instalación (⬇️) en la barra de direcciones\n2. Haz clic en 'Instalar'";
      }
      
      alert(message);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5" />
          <div>
            <p className="font-semibold text-sm">¡Instala BarberApp Calendar!</p>
            <p className="text-xs text-blue-100">Acceso rápido desde tu pantalla de inicio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-2"
          >
            <Download className="h-3 w-3" />
            Instalar
          </Button>
          <Button
            onClick={() => setDismissed(true)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}