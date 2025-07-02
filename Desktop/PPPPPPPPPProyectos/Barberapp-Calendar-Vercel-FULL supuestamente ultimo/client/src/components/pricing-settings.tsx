import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { updateBarberPricingSchema, type UpdateBarberPricing, type Barber } from "@shared/schema";
import { Settings, Euro } from "lucide-react";

interface PricingSettingsProps {
  barber: Barber;
}

export function PricingSettings({ barber }: PricingSettingsProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UpdateBarberPricing>({
    resolver: zodResolver(updateBarberPricingSchema),
    defaultValues: {
      priceHaircut: barber.priceHaircut ?? "15.00",
      priceBeard: barber.priceBeard ?? "10.00", 
      priceComplete: barber.priceComplete ?? "20.00",
      priceShave: barber.priceShave ?? "8.00",
    },
  });

  const updatePricingMutation = useMutation({
    mutationFn: async (data: UpdateBarberPricing) => {
      const response = await apiRequest("PUT", `/api/barbers/${barber.id}/pricing`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Precios actualizados",
        description: "Los precios de tus servicios han sido actualizados correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/barbers"] });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los precios",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateBarberPricing) => {
    updatePricingMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurar Precios
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Precios de Servicios
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="priceHaircut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corte de Cabello</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        placeholder="15.00"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceBeard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arreglo de Barba</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        placeholder="10.00"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceComplete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio Completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        placeholder="20.00"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceShave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afeitado</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-10"
                        placeholder="8.00"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={updatePricingMutation.isPending}
              >
                {updatePricingMutation.isPending ? "Guardando..." : "Guardar Precios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}