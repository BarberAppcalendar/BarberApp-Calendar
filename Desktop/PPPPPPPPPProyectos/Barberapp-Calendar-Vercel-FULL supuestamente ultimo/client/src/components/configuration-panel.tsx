import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, Euro, Calendar, Shield, Database, 
  Settings, User, Bell, Palette, Globe, 
  ChevronRight, Info, Check, AlertTriangle, Coffee
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigurationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  barber: any;
}

export function ConfigurationPanel({ isOpen, onClose, barber }: ConfigurationPanelProps) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('general');

  // Add null check for barber
  if (!barber) {
    return null;
  }

  const [settings, setSettings] = useState({
    // Configuración general
    shopName: barber?.shopName || '',
    email: barber?.email || '',
    phone: barber?.phone || '',
    address: barber?.address || '',
    
    // Horarios de trabajo
    workingHours: barber?.workingHours || {
      monday: { enabled: true, start: "09:00", end: "18:00" },
      tuesday: { enabled: true, start: "09:00", end: "18:00" },
      wednesday: { enabled: true, start: "09:00", end: "18:00" },
      thursday: { enabled: true, start: "09:00", end: "18:00" },
      friday: { enabled: true, start: "09:00", end: "18:00" },
      saturday: { enabled: true, start: "09:00", end: "15:00" },
      sunday: { enabled: false, start: "09:00", end: "18:00" }
    },
    
    // Descansos
    hasBreak: barber?.hasBreak !== undefined ? barber.hasBreak : true,
    breakStart: barber?.breakStart || "14:00",
    breakEnd: barber?.breakEnd || "15:00",
    
    // Precios
    priceHaircut: barber?.priceHaircut || "15.00",
    priceBeard: barber?.priceBeard || "10.00", 
    priceComplete: barber?.priceComplete || "20.00",
    priceShave: barber?.priceShave || "8.00",
    
    // Notificaciones
    notifications: {
      email: true,
      sms: false,
      newBookings: true,
      cancellations: true,
      reminders: true
    },
    
    // Privacidad
    dataRetention: "14", // días
    allowClientHistory: true,
    shareAnalytics: false,
    
    // Apariencia
    theme: "light",
    language: "es",
    currency: "EUR"
  });

  const sections = [
    { id: 'general', name: 'General', icon: User },
    { id: 'schedule', name: 'Horarios', icon: Clock },
    { id: 'pricing', name: 'Precios', icon: Euro },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'privacy', name: 'Privacidad', icon: Shield },
    { id: 'appearance', name: 'Apariencia', icon: Palette },
    { id: 'system', name: 'Sistema', icon: Database }
  ];

  const saveSettings = async () => {
    try {
      console.log('💾 Guardando configuración...', {
        workingHours: settings.workingHours,
        hasBreak: settings.hasBreak,
        breakStart: settings.breakStart,
        breakEnd: settings.breakEnd
      });

      // Actualizar barbero en Firebase usando la API existente
      const response = await fetch(`/api/barbers/${barber.barberId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hasBreak: settings.hasBreak,
          breakStart: settings.breakStart,
          breakEnd: settings.breakEnd,
          workingHours: settings.workingHours,
          shopName: settings.shopName,
          email: settings.email,
          phone: settings.phone,
          address: settings.address,
          priceHaircut: settings.priceHaircut,
          priceBeard: settings.priceBeard,
          priceComplete: settings.priceComplete,
          priceShave: settings.priceShave
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Error actualizando configuración');
      }

      const result = await response.json();
      console.log('✅ Configuración guardada:', result);
      
      toast({
        title: "Configuración guardada",
        description: "Los horarios de trabajo y descanso se han actualizado. Los cambios se reflejarán inmediatamente en el calendario.",
      });
      
      // Forzar actualización de la página para reflejar cambios inmediatamente
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderGeneralSection = () => (
    <div className="space-y-3">
      <div>
        <h3 className="text-md font-semibold mb-3">Información de la Barbería</h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="shopName" className="text-sm">Nombre de la barbería</Label>
            <Input
              id="shopName"
              value={settings.shopName}
              onChange={(e) => setSettings(prev => ({ ...prev, shopName: e.target.value }))}
              placeholder="Mi Barbería"
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              placeholder="info@mibarberia.com"
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">Teléfono</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+34 123 456 789"
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm">Dirección</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Calle Principal 123"
              className="h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduleSection = () => {
    const dayNames = {
      monday: 'Lun',
      tuesday: 'Mar', 
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom'
    };

    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios de Trabajo
          </h3>
          <div className="space-y-1">
            {Object.entries(settings.workingHours).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex items-center gap-2 p-2 border rounded text-sm">
                <div className="w-8 font-medium text-xs">
                  {dayNames[day as keyof typeof dayNames]}
                </div>
                <Switch
                  checked={hours.enabled || hours.isOpen}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      workingHours: {
                        ...prev.workingHours,
                        [day]: { ...hours, enabled: checked, isOpen: checked }
                      }
                    }))
                  }
                  className="scale-75"
                />
                <span className="text-xs text-muted-foreground w-12">
                  {(hours.enabled || hours.isOpen) ? 'Abierto' : 'Cerrado'}
                </span>
                {(hours.enabled || hours.isOpen) && (
                  <>
                    <Input
                      type="time"
                      value={hours.start}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day]: { ...hours, start: e.target.value }
                          }
                        }))
                      }
                      className="w-16 h-6 text-xs"
                    />
                    <span className="text-xs">a</span>
                    <Input
                      type="time"
                      value={hours.end}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day]: { ...hours, end: e.target.value }
                          }
                        }))
                      }
                      className="w-16 h-6 text-xs"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Horarios de Descanso */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horario de Descanso
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 border rounded">
              <Switch
                checked={settings.hasBreak}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, hasBreak: checked }))
                }
                className="scale-75"
              />
              <Label className="text-xs">Activar hora de descanso diaria</Label>
            </div>
            {settings.hasBreak && (
              <div className="flex items-center gap-2 p-2 border rounded bg-orange-50">
                <Label className="text-xs w-12">Desde:</Label>
                <Input
                  type="time"
                  value={settings.breakStart}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, breakStart: e.target.value }))
                  }
                  className="w-16 h-6 text-xs"
                />
                <Label className="text-xs w-12">Hasta:</Label>
                <Input
                  type="time"
                  value={settings.breakEnd}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, breakEnd: e.target.value }))
                  }
                  className="w-16 h-6 text-xs"
                />
              </div>
            )}
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              Los horarios de descanso aparecen en naranja en el calendario.
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPricingSection = () => (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Precios de Servicios
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="priceHaircut" className="text-xs">Corte de Pelo (€)</Label>
            <Input
              id="priceHaircut"
              type="number"
              step="0.01"
              value={settings.priceHaircut}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                priceHaircut: e.target.value
              }))}
              placeholder="15.00"
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="priceBeard" className="text-xs">Arreglo de Barba (€)</Label>
            <Input
              id="priceBeard"
              type="number"
              step="0.01"
              value={settings.priceBeard}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                priceBeard: e.target.value
              }))}
              placeholder="10.00"
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="priceComplete" className="text-xs">Servicio Completo (€)</Label>
            <Input
              id="priceComplete"
              type="number"
              step="0.01"
              value={settings.priceComplete}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                priceComplete: e.target.value
              }))}
              placeholder="20.00"
              className="h-6 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="priceShave" className="text-xs">Afeitado (€)</Label>
            <Input
              id="priceShave"
              type="number"
              step="0.01"
              value={settings.priceShave}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                priceShave: e.target.value
              }))}
              placeholder="8.00"
              className="h-6 text-xs"
            />
          </div>
        </div>
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          Los precios se aplicarán automáticamente en formularios de citas y cálculos del sistema.
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-3">
      <div>
        <h3 className="text-md font-semibold mb-3">Gestión de Datos</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border rounded text-sm">
            <div>
              <Label className="text-sm">Retención de datos</Label>
              <p className="text-xs text-muted-foreground">
                Tiempo que se mantienen los datos
              </p>
            </div>
            <Select
              value={settings.dataRetention}
              onValueChange={(value) => setSettings(prev => ({ ...prev, dataRetention: value }))}
            >
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="14">14 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-2 border rounded text-sm">
            <div>
              <Label className="text-sm">Historial de clientes</Label>
              <p className="text-xs text-muted-foreground">
                Ver historial de citas anteriores
              </p>
            </div>
            <Switch
              checked={settings.allowClientHistory}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, allowClientHistory: checked }))
              }
              className="scale-75"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-3">
      <div>
        <h3 className="text-md font-semibold mb-3">Estado del Sistema</h3>
        <div className="space-y-2">
          <div className="border-green-200 bg-green-50 border rounded p-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Firebase Conectado</p>
                <p className="text-xs text-green-600">Base de datos funcionando</p>
              </div>
            </div>
          </div>
          
          <div className="border rounded p-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>ID de Barbero:</span>
                <Badge variant="secondary" className="text-xs">{barber.barberId}</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Suscripción:</span>
                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                  {barber.subscriptionStatus}
                </Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>Versión:</span>
                <span className="text-xs text-muted-foreground">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSection();
      case 'schedule': return renderScheduleSection();
      case 'pricing': return renderPricingSection();
      case 'privacy': return renderPrivacySection();
      case 'system': return renderSystemSection();
      default: return renderGeneralSection();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-4 w-4" />
            Configuración
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 h-[75vh]">
          {/* Sidebar */}
          <div className="w-24 border-r pr-2">
            <nav className="space-y-0.5">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex flex-col items-center gap-1 px-1 py-2 text-xs rounded transition-colors ${
                    activeSection === section.id
                      ? 'bg-amber-100 text-amber-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="h-3 w-3" />
                  <span className="text-xs leading-tight">{section.name}</span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="pb-2">
              {renderContent()}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t pt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button onClick={saveSettings} className="bg-amber-600 hover:bg-amber-700" size="sm">
            <Check className="h-3 w-3 mr-1" />
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}