import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Calendar, Shield, Info } from "lucide-react";

interface DataPrivacySettingsProps {
  barberId: string;
}

export function DataPrivacySettings({ barberId }: DataPrivacySettingsProps) {
  const [daysToKeep, setDaysToKeep] = useState(14);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cleanupMutation = useMutation({
    mutationFn: async (days: number) => {
      const response = await apiRequest("POST", "/api/admin/cleanup-client-data", { days });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Limpieza completada",
        description: data.message,
      });
      // Invalidar cache de citas para refrescar la vista
      queryClient.invalidateQueries({ queryKey: ["/api/appointments", barberId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo completar la limpieza de datos",
        variant: "destructive",
      });
    },
  });

  const handleCleanup = () => {
    if (confirm(`¿Estás seguro de que quieres eliminar todos los datos de clientes anteriores a ${daysToKeep} días? Esta acción no se puede deshacer.`)) {
      cleanupMutation.mutate(daysToKeep);
    }
  };

  return (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Shield className="h-5 w-5 text-orange-600" />
          Privacidad de Datos de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información actual */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Sistema Automático Activo</h4>
              <p className="text-sm text-blue-700 mt-1">
                Los datos de clientes se eliminan automáticamente después de <strong>14 días</strong> para cumplir con las regulaciones de privacidad.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                La limpieza automática se ejecuta diariamente a las 00:00 UTC.
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-800">Retención</p>
            <p className="text-lg font-bold text-green-900">14 días</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <Shield className="h-6 w-6 text-gray-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-800">Cumplimiento</p>
            <p className="text-lg font-bold text-gray-900">GDPR</p>
          </div>
        </div>

        {/* Limpieza manual */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-800 mb-3">Limpieza Manual</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="daysToKeep">Eliminar datos anteriores a (días):</Label>
              <Input
                id="daysToKeep"
                type="number"
                min="1"
                max="365"
                value={daysToKeep}
                onChange={(e) => setDaysToKeep(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Por defecto: 14 días (recomendado para privacidad)
              </p>
            </div>
            
            <Button
              onClick={handleCleanup}
              disabled={cleanupMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {cleanupMutation.isPending ? "Eliminando..." : "Eliminar Datos Antiguos"}
            </Button>
          </div>
        </div>

        {/* Información legal */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800">
            <strong>Nota Legal:</strong> Esta funcionalidad ayuda a cumplir con el GDPR y otras regulaciones de privacidad al eliminar automáticamente los datos personales de clientes después del período de retención especificado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}