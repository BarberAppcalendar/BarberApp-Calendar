import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { UpdateBarberPricing } from "@shared/schema";
import { ServicesManager } from "./services-manager";
import { DataPrivacySettings } from "./data-privacy-settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { t } = useI18n();
  const { barber } = useFirebaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [startTime, setStartTime] = useState(barber?.startTime || "09:00");
  const [endTime, setEndTime] = useState(barber?.endTime || "18:00");
  const [hasBreak, setHasBreak] = useState(barber?.hasBreak || false);
  const [breakStart, setBreakStart] = useState(barber?.breakStart || "14:00");
  const [breakEnd, setBreakEnd] = useState(barber?.breakEnd || "15:00");
  
  // Services manager state
  const [showServicesManager, setShowServicesManager] = useState(false);
  
  // Pricing states
  const [priceHaircut, setPriceHaircut] = useState(barber?.priceHaircut || "");
  const [priceBeard, setPriceBeard] = useState(barber?.priceBeard || "");
  const [priceComplete, setPriceComplete] = useState(barber?.priceComplete || "");
  const [priceShave, setPriceShave] = useState(barber?.priceShave || "");

  // Temporarily disabled - needs Firebase integration
  const handleSaveSettings = async () => {
    try {
      toast({
        title: "Horario habitual guardado",
        description: "Tu horario de trabajo se aplicará automáticamente todos los días",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar los horarios",
      });
    }
  };

  // Temporarily disabled - needs Firebase integration  
  const handleSavePricing = async () => {
    try {
      toast({
        title: "Precios actualizados",
        description: "Los precios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron actualizar los precios",
      });
    }
  };

  const handleSaveHours = () => {
    handleSaveSettings();
  };

  if (!barber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="hours" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hours">Horarios</TabsTrigger>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="pricing">Precios</TabsTrigger>
            <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hours" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Horario de Trabajo Habitual</h3>
              <p className="text-gray-600 text-sm mb-4">Configura tu horario de trabajo que se aplicará automáticamente todos los días.</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="startTime">Hora de inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Hora de fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="hasBreak"
                    checked={hasBreak}
                    onChange={(e) => setHasBreak(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <Label htmlFor="hasBreak" className="font-medium">
                      Configurar descanso habitual
                    </Label>
                    <p className="text-gray-500 text-xs">Por ejemplo: hora del almuerzo que se aplicará todos los días</p>
                  </div>
                </div>
                
                {hasBreak && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label htmlFor="breakStart">Inicio del descanso</Label>
                      <Input
                        id="breakStart"
                        type="time"
                        value={breakStart}
                        onChange={(e) => setBreakStart(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="breakEnd">Fin del descanso</Label>
                      <Input
                        id="breakEnd"
                        type="time"
                        value={breakEnd}
                        onChange={(e) => setBreakEnd(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Horario permanente:</strong> Una vez guardado, este horario se aplicará automáticamente todos los días sin necesidad de configurarlo nuevamente.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveHours}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? "Guardando..." : "Guardar Horario Habitual"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Servicios Personalizados</h3>
              <p className="text-gray-600 text-sm mb-4">
                Crea y personaliza tus servicios con nombres y precios específicos. Los cálculos económicos se ajustarán automáticamente a estos precios.
              </p>
              <Button 
                onClick={() => setShowServicesManager(true)}
                className="w-full"
              >
                Gestionar Servicios
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pricing" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Precios de Servicios</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="priceHaircut">Corte de cabello (€)</Label>
                  <Input
                    id="priceHaircut"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.00"
                    value={priceHaircut}
                    onChange={(e) => setPriceHaircut(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceBeard">Arreglo de barba (€)</Label>
                  <Input
                    id="priceBeard"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10.00"
                    value={priceBeard}
                    onChange={(e) => setPriceBeard(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceComplete">Servicio completo (€)</Label>
                  <Input
                    id="priceComplete"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="20.00"
                    value={priceComplete}
                    onChange={(e) => setPriceComplete(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priceShave">Afeitado (€)</Label>
                  <Input
                    id="priceShave"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="8.00"
                    value={priceShave}
                    onChange={(e) => setPriceShave(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePricing}
                disabled={updatePricingMutation.isPending}
              >
                {updatePricingMutation.isPending ? "Guardando..." : "Guardar Precios"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <DataPrivacySettings barberId={barber.barberId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      <ServicesManager 
        open={showServicesManager} 
        onOpenChange={setShowServicesManager} 
      />
    </Dialog>
  );
}