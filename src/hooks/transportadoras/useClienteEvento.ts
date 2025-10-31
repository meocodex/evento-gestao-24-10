import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useClienteEvento(eventoId: string | null) {
  return useQuery({
    queryKey: ['cliente-evento', eventoId],
    queryFn: async () => {
      if (!eventoId) return null;
      
      const { data: evento } = await supabase
        .from('eventos')
        .select('cliente_id, endereco, cidade, estado')
        .eq('id', eventoId)
        .single();
      
      if (!evento?.cliente_id) return null;
      
      const { data: cliente } = await supabase
        .from('clientes')
        .select('endereco')
        .eq('id', evento.cliente_id)
        .single();
      
      return {
        eventoEndereco: evento.endereco,
        eventoCidade: evento.cidade,
        eventoEstado: evento.estado,
        clienteEndereco: cliente?.endereco,
      };
    },
    enabled: !!eventoId,
  });
}
