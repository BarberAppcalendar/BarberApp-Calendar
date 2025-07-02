import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema, updateServiceSchema, type Service, type InsertService, type UpdateService } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Euro, Clock } from "lucide-react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";

interface ServicesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServicesManager({ open, onOpenChange }: ServicesManagerProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { barber } = useFirebaseAuth();

  const { data: servicesData } = useQuery<{ services: Service[] }>({
    queryKey: ["/api/services", barber?.barberId],
    enabled: !!barber?.barberId,
  });

  const services = servicesData?.services || [];

  const form = useForm<InsertService | UpdateService>({
    resolver: zodResolver(editingService ? updateServiceSchema : insertServiceSchema),
    defaultValues: {
      name: "",
      price: "0.00",
      duration: "30",
      description: "",
      order: "0",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      const response = await apiRequest("POST", "/api/services", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Servicio creado",
        description: "El servicio ha sido creado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el servicio",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, ...data }: UpdateService & { id: number }) => {
      const response = await apiRequest("PUT", `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Servicio actualizado",
        description: "El servicio ha sido actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      handleCloseForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/services/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    },
  });

  const handleNewService = () => {
    setEditingService(null);
    form.reset({
      name: "",
      price: "0.00",
      duration: "30",
      description: "",
      order: services.length.toString(),
    });
    setShowForm(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      price: service.price,
      duration: service.duration || "30",
      description: service.description || "",
      order: service.order || "0",
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingService(null);
    form.reset();
  };

  const onSubmit = (data: InsertService | UpdateService) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...data as UpdateService });
    } else {
      createServiceMutation.mutate(data as InsertService);
    }
  };

  const handleDeleteService = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      deleteServiceMutation.mutate(id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Gestionar Servicios
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Personaliza tus servicios y precios
                </p>
                <Button onClick={handleNewService} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Servicio
                </Button>
              </div>

              <div className="space-y-3">
                {services.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tienes servicios configurados</p>
                    <p className="text-sm">Agrega tu primer servicio para comenzar</p>
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{service.name}</h3>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {service.price}€
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration || "30"} min
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {editingService ? "Editar Servicio" : "Nuevo Servicio"}
                  </h3>
                  <Button type="button" variant="outline" onClick={handleCloseForm}>
                    Cancelar
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Servicio</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ej: Corte degradado, Barba completa, etc."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (€)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              {...field}
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
                    name="duration"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <FormItem>
                        <FormLabel>Duración (minutos)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="number"
                              min="15"
                              step="15"
                              className="pl-10"
                              placeholder="30"
                              name={name}
                              ref={ref}
                              onChange={onChange}
                              onBlur={onBlur}
                              value={form.getValues("duration") || "30"}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del servicio..."
                          rows={3}
                          name={name}
                          ref={ref}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={form.getValues("description") || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                  >
                    {editingService ? "Actualizar Servicio" : "Crear Servicio"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}