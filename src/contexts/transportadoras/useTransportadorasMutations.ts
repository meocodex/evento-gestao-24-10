import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTransportadorasMutations() {
  const queryClient = useQueryClient();

  const criarTransportadora = useMutation({
    mutationFn: async (data: any) => {
      const { data: transportadora, error } = await supabase
        .from('transportadoras')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return transportadora;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora criada!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar transportadora', { description: error.message });
    }
  });

  const editarTransportadora = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('transportadoras')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora atualizada!');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar', { description: error.message });
    }
  });

  const excluirTransportadora = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transportadoras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora excluída!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir', { description: error.message });
    }
  });

  const adicionarRota = useMutation({
    mutationFn: async ({ transportadoraId, rota }: { transportadoraId: string; rota: any }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('rotas')
        .eq('id', transportadoraId)
        .single();

      const novasRotas = [...(transportadora?.rotas || []), rota];

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas: novasRotas })
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota adicionada!');
    }
  });

  const editarRota = useMutation({
    mutationFn: async ({ transportadoraId, rotaIndex, rota }: { transportadoraId: string; rotaIndex: number; rota: any }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('rotas')
        .eq('id', transportadoraId)
        .single();

      const rotas = [...(transportadora?.rotas || [])];
      rotas[rotaIndex] = rota;

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas })
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota atualizada!');
    }
  });

  const removerRota = useMutation({
    mutationFn: async ({ transportadoraId, rotaIndex }: { transportadoraId: string; rotaIndex: number }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('rotas')
        .eq('id', transportadoraId)
        .single();

      const rotas = [...(transportadora?.rotas || [])];
      rotas.splice(rotaIndex, 1);

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas })
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota removida!');
    }
  });

  const criarEnvio = useMutation({
    mutationFn: async (data: any) => {
      const { data: envio, error } = await supabase
        .from('transportadoras_envios')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return envio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio criado!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar envio', { description: error.message });
    }
  });

  const editarEnvio = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('transportadoras_envios')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio atualizado!');
    }
  });

  const atualizarStatusEnvio = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('transportadoras_envios')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Status atualizado!');
    }
  });

  const excluirEnvio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transportadoras_envios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio excluído!');
    }
  });

  return {
    criarTransportadora,
    editarTransportadora,
    excluirTransportadora,
    adicionarRota,
    editarRota,
    removerRota,
    criarEnvio,
    editarEnvio,
    atualizarStatusEnvio,
    excluirEnvio,
  };
}
