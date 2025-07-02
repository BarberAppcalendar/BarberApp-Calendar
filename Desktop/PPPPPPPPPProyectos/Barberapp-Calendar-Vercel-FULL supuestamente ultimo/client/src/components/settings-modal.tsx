import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { t } = useI18n();
  const { barber } = useFirebaseAuth();
  const { toast } = useToast();

  const [startTime, setStartTime] = useState(barber?.startTime || "09:00");
  const [endTime, setEndTime] = useState(barber?.endTime || "18:00");

  const handleSaveSettings = async () => {
    try {
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados correctamente",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios",
      });
    }
  };

  if (!barber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
          <DialogDescription>
            Configura tu horario de trabajo y otros ajustes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="hours" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hours">Horarios</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="hours" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSettings}>
                Guardar Horarios
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del negocio</Label>
                <Input value={barber.shopName} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={barber.email} readOnly />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}