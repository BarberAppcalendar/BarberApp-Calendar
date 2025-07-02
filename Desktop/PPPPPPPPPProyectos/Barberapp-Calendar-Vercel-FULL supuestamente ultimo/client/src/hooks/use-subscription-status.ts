import { useQuery } from "@tanstack/react-query";

interface SubscriptionData {
  subscriptionStatus: string;
  subscriptionExpires: string;
  daysUntilExpiry: number;
  isActive: boolean;
  needsRenewal: boolean;
}

export function useSubscriptionStatus(barberId: string | undefined) {
  return useQuery<SubscriptionData>({
    queryKey: [`/api/subscriptions/status/${barberId}`],
    queryFn: async () => {
      if (!barberId) throw new Error('barberId is required');
      
      const response = await fetch(`/api/subscriptions/status/${barberId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!barberId,
    refetchInterval: 30 * 1000, // Refrescar cada 30 segundos para verificar cambios
    retry: 2,
    staleTime: 10 * 1000, // 10 segundos de cache
  });
}