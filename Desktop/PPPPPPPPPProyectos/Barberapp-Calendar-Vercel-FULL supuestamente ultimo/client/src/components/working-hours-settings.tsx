import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FirestoreBarber } from "@/lib/firebase-services";

interface WorkingHoursSettingsProps {
  barber: FirestoreBarber;
  onSave: (updatedHours: any) => Promise<void>;
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00', '23:30'
];

export default function WorkingHoursSettings({ barber, onSave }: WorkingHoursSettingsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para horarios de trabajo
  const [workingHours, setWorkingHours] = useState(() => {
    const defaultHours = {
      monday: { isOpen: true, start: '10:00', end: '20:30' },
      tuesday: { isOpen: true, start: '10:00', end: '20:30' },
      wednesday: { isOpen: true, start: '10:00', end: '20:30' },
      thursday: { isOpen: true, start: '10:00', end: '20:30' },
      friday: { isOpen: true, start: '10:00', end: '20:30' },
      saturday: { isOpen: true, start: '10:00', end: '20:30' },
      sunday: { isOpen: false, start: '10:00', end: '20:30' }
    };
    
    return barber.workingHours || defaultHours;
  });

  // Estado para horarios de descanso
  const [breakTimes, setBreakTimes] = useState(() => ({
    hasBreak: barber.hasBreak !== undefined ? barber.hasBreak : true,
    breakStart: barber.breakStart || '13:30',
    breakEnd: barber.breakEnd || '16:30'
  }));

  const handleDayToggle = (day: string, isOpen: boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        isOpen
      }
    }));
  };

  const handleTimeChange = (day: string, timeType: 'start' | 'end', time: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [timeType]: time
      }
    }));
  };

  const handleBreakToggle = (hasBreak: boolean) => {
    setBreakTimes(prev => ({
      ...prev,
      hasBreak
    }));
  };

  const handleBreakTimeChange = (timeType: 'breakStart' | 'breakEnd', time: string) => {
    setBreakTimes(prev => ({
      ...prev,
      [timeType]: time
    }));
  };

  const resetToDefault = () => {
    const defaultHours = {
      monday: { isOpen: true, start: '10:00', end: '20:30' },
      tuesday: { isOpen: true, start: '10:00', end: '20:30' },
      wednesday: { isOpen: true, start: '10:00', end: '20:30' },
      thursday: { isOpen: true, start: '10:00', end: '20:30' },
      friday: { isOpen: true, start: '10:00', end: '20:30' },
      saturday: { isOpen: true, start: '10:00', end: '20:30' },
      sunday: { isOpen: false, start: '10:00', end: '20:30' }
    };
    
    setWorkingHours(defaultHours);
    setBreakTimes({
      hasBreak: true,
      breakStart: '13:30',
      breakEnd: '16:30'
    });
    
    toast({
      title: "Horarios restablecidos",
      description: "Aplicados: 10:00-13:30 y 16:30-20:30 con descanso automático",
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Validaciones
      for (const day of DAYS) {
        const dayHours = workingHours[day.key as keyof typeof workingHours];
        if (dayHours.isOpen) {
          if (dayHours.start >= dayHours.end) {
            toast({
              title: "Error en horarios",
              description: `El horario de ${day.label} no es válido. La hora de inicio debe ser anterior a la de fin.`,
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Validar horario de descanso
      if (breakTimes.hasBreak && breakTimes.breakStart >= breakTimes.breakEnd) {
        toast({
          title: "Error en horario de descanso",
          description: "La hora de inicio del descanso debe ser anterior a la de fin.",
          variant: "destructive",
        });
        return;
      }

      // Preparar datos para guardar
      const updatedData = {
        workingHours,
        hasBreak: breakTimes.hasBreak,
        breakStart: breakTimes.breakStart,
        breakEnd: breakTimes.breakEnd
      };

      await onSave(updatedData);
      
      toast({
        title: "Horarios guardados",
        description: "Tus horarios de trabajo se han actualizado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los horarios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Horarios de trabajo por día */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-4 w-4" />
            Horarios de Trabajo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DAYS.map((day) => {
            const dayHours = workingHours[day.key as keyof typeof workingHours];
            return (
              <div key={day.key} className="flex items-center gap-3 p-2 border rounded text-sm">
                <div className="w-16">
                  <Label className="font-medium text-xs">{day.label}</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={dayHours.isOpen}
                    onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                    className="scale-75"
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {dayHours.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                {dayHours.isOpen && (
                  <div className="flex items-center gap-2 ml-auto">
                    <Select
                      value={dayHours.start}
                      onValueChange={(time) => handleTimeChange(day.key, 'start', time)}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time} className="text-xs">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <span className="text-muted-foreground text-xs">-</span>
                    
                    <Select
                      value={dayHours.end}
                      onValueChange={(time) => handleTimeChange(day.key, 'end', time)}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((time) => (
                          <SelectItem key={time} value={time} className="text-xs">
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Horario de descanso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Horario de Descanso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              checked={breakTimes.hasBreak}
              onCheckedChange={handleBreakToggle}
              className="scale-75"
            />
            <Label className="text-sm">Activar descanso diario</Label>
          </div>

          {breakTimes.hasBreak && (
            <div className="flex items-center gap-3 p-2 border rounded">
              <Label className="w-16 text-xs">Descanso:</Label>
              
              <Select
                value={breakTimes.breakStart}
                onValueChange={(time) => handleBreakTimeChange('breakStart', time)}
              >
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time} className="text-xs">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-muted-foreground text-xs">-</span>
              
              <Select
                value={breakTimes.breakEnd}
                onValueChange={(time) => handleBreakTimeChange('breakEnd', time)}
              >
                <SelectTrigger className="w-20 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time} className="text-xs">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          size="sm"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4"
        >
          <Save className="h-3 w-3 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
        
        <Button
          onClick={resetToDefault}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="px-4"
        >
          <RotateCcw className="h-3 w-3 mr-2" />
          Restablecer
        </Button>
      </div>
    </div>
  );
}