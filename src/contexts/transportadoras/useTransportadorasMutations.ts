import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  DatabaseError, 
  getErrorMessage,
  TransportadoraCreateData,
  TransportadoraUpdateData,
  RotaAtendidaUI,
  EnvioCreateData,
  EnvioUpdateData
} from '@/types/utils';

type StatusEnvio = 'pendente' | 'em_transito' | 'entregue' | 'cancelado';

// Helper para converter rota de camelCase para snake_case
function rotaToSnakeCase(rota: RotaAtendidaUI) {
  return {
    id: rota.id || crypto.randomUUID(),
    cidade_destino: rota.cidadeDestino,
    estado_destino: rota.estadoDestino,
    prazo_entrega: rota.prazoEntrega,
    valor_base: rota.valorBase,
    ativa: rota.ativa,
  };
}

// Helper para converter transportadora de camelCase para snake_case
function transportadoraToSnakeCase(data: TransportadoraCreateData | TransportadoraUpdateData) {
  return {
    nome: data.nome,
    cnpj: data.cnpj,
    razao_social: data.razaoSocial,
    telefone: data.telefone,
    email: data.email,
    responsavel: data.responsavel,
    status: data.status,
    endereco: data.endereco,
    dados_bancarios: data.dadosBancarios ? {
      banco: data.dadosBancarios.banco,
      agencia: data.dadosBancarios.agencia,
      conta: data.dadosBancarios.conta,
      tipo_conta: data.dadosBancarios.tipoConta,
    } : undefined,
    rotas: data.rotasAtendidas?.map(rotaToSnakeCase),
    observacoes: data.observacoes,
  };
}

// Helper para converter envio de camelCase para snake_case
function envioToSnakeCase(data: EnvioCreateData | EnvioUpdateData) {
  return {
    transportadora_id: data.transportadoraId,
    evento_id: data.eventoId,
    tipo: data.tipo,
    status: data.status,
    data_coleta: data.dataColeta,
    data_entrega: data.dataEntrega,
    data_entrega_prevista: data.dataEntregaPrevista,
    origem: data.origem,
    destino: data.destino,
    rastreio: data.rastreio,
    valor: data.valor,
    forma_pagamento: data.formaPagamento,
    comprovante_pagamento: data.comprovantePagamento,
    despesa_evento_id: data.despesaEventoId,
    observacoes: data.observacoes,
  };
}

export function useTransportadorasMutations() {
  const queryClient = useQueryClient();

  const criarTransportadora = useMutation({
    mutationFn: async (data: TransportadoraCreateData) => {
      const payload = transportadoraToSnakeCase(data);
      const { data: transportadora, error } = await supabase
        .from('transportadoras')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return transportadora;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora criada!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao criar transportadora', { description: getErrorMessage(error) });
    }
  });

  const editarTransportadora = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransportadoraUpdateData }) => {
      const payload = transportadoraToSnakeCase(data);
      const { error } = await supabase
        .from('transportadoras')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora atualizada!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar', { description: getErrorMessage(error) });
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Transportadora excluída!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao excluir', { description: getErrorMessage(error) });
    }
  });

  const adicionarRota = useMutation({
    mutationFn: async ({ transportadoraId, rota }: { transportadoraId: string; rota: RotaAtendidaUI }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('*')
        .eq('id', transportadoraId)
        .single();

      const rotasAtuais = ((transportadora as Record<string, unknown>)?.rotas || []) as Array<Record<string, unknown>>;
      const novaRotaDB = rotaToSnakeCase(rota);
      const novasRotas = [...rotasAtuais, novaRotaDB];

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas: novasRotas } as Record<string, unknown>)
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota adicionada!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao adicionar rota', { description: getErrorMessage(error) });
    }
  });

  const editarRota = useMutation({
    mutationFn: async ({ transportadoraId, rotaIndex, rota }: { transportadoraId: string; rotaIndex: number; rota: RotaAtendidaUI }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('*')
        .eq('id', transportadoraId)
        .single();

      const rotasAtuais = ((transportadora as Record<string, unknown>)?.rotas || []) as Array<Record<string, unknown>>;
      const rotas = [...rotasAtuais];
      rotas[rotaIndex] = rotaToSnakeCase(rota);

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas } as Record<string, unknown>)
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota atualizada!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar rota', { description: getErrorMessage(error) });
    }
  });

  const removerRota = useMutation({
    mutationFn: async ({ transportadoraId, rotaIndex }: { transportadoraId: string; rotaIndex: number }) => {
      const { data: transportadora } = await supabase
        .from('transportadoras')
        .select('*')
        .eq('id', transportadoraId)
        .single();

      const rotasAtuais = ((transportadora as Record<string, unknown>)?.rotas || []) as Array<Record<string, unknown>>;
      const rotas = [...rotasAtuais];
      rotas.splice(rotaIndex, 1);

      const { error } = await supabase
        .from('transportadoras')
        .update({ rotas } as Record<string, unknown>)
        .eq('id', transportadoraId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast.success('Rota removida!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao remover rota', { description: getErrorMessage(error) });
    }
  });

  const criarEnvio = useMutation({
    mutationFn: async (data: EnvioCreateData) => {
      const payload = envioToSnakeCase(data);
      const { data: envio, error } = await supabase
        .from('envios')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return envio;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio criado!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao criar envio', { description: getErrorMessage(error) });
    }
  });

  const editarEnvio = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EnvioUpdateData }) => {
      const payload = envioToSnakeCase(data);
      const { error } = await supabase
        .from('envios')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio atualizado!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar envio', { description: getErrorMessage(error) });
    }
  });

  const atualizarStatusEnvio = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusEnvio }) => {
      const { error } = await supabase
        .from('envios')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Status atualizado!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao atualizar status', { description: getErrorMessage(error) });
    }
  });

  const excluirEnvio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('envios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transportadoras-envios'] });
      toast.success('Envio excluído!');
    },
    onError: (error: DatabaseError) => {
      toast.error('Erro ao excluir envio', { description: getErrorMessage(error) });
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
