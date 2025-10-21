import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transportadora, Envio, RotaAtendida } from '@/types/transportadoras';
import { toast } from '@/hooks/use-toast';
import { useEventos } from './EventosContext';
import { Despesa } from '@/types/eventos';
import { useTransportadorasQueries, useEnviosQueries, FiltrosTransportadora, FiltrosEnvio } from './transportadoras/useTransportadorasQueries';

interface TransportadorasContextData {
  transportadoras: Transportadora[];
  envios: Envio[];
  loading: boolean;
  totalTransportadoras: number;
  totalEnvios: number;
  pageTransportadoras: number;
  pageEnvios: number;
  pageSizeTransportadoras: number;
  pageSizeEnvios: number;
  filtrosTransportadoras: FiltrosTransportadora;
  filtrosEnvios: FiltrosEnvio;
  setPageTransportadoras: (page: number) => void;
  setPageEnvios: (page: number) => void;
  setFiltrosTransportadoras: (filtros: FiltrosTransportadora) => void;
  setFiltrosEnvios: (filtros: FiltrosEnvio) => void;
  criarTransportadora: (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarTransportadora: (id: string, data: Partial<Transportadora>) => void;
  excluirTransportadora: (id: string) => void;
  criarEnvio: (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarEnvio: (id: string, data: Partial<Envio>) => void;
  excluirEnvio: (id: string) => void;
  atualizarStatusEnvio: (id: string, status: Envio['status']) => void;
  buscarEnviosPorEvento: (eventoId: string) => Envio[];
  buscarEnviosPorTransportadora: (transportadoraId: string) => Envio[];
  buscarTransportadorasPorCidade: (cidade: string, estado: string) => Transportadora[];
  adicionarRota: (transportadoraId: string, rota: Omit<RotaAtendida, 'id'>) => void;
  editarRota: (transportadoraId: string, rotaId: string, data: Partial<RotaAtendida>) => void;
  removerRota: (transportadoraId: string, rotaId: string) => void;
}

const TransportadorasContext = createContext<TransportadorasContextData>({} as TransportadorasContextData);

export function TransportadorasProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const eventosContext = useEventos();

  const [pageTransportadoras, setPageTransportadoras] = useState(1);
  const [pageEnvios, setPageEnvios] = useState(1);
  const [pageSizeTransportadoras] = useState(50);
  const [pageSizeEnvios] = useState(50);
  const [filtrosTransportadoras, setFiltrosTransportadoras] = useState<FiltrosTransportadora>({});
  const [filtrosEnvios, setFiltrosEnvios] = useState<FiltrosEnvio>({});

  const { data: transportadorasData, isLoading: loadingTransportadoras } = useTransportadorasQueries(
    pageTransportadoras,
    pageSizeTransportadoras,
    filtrosTransportadoras
  );

  const { data: enviosData, isLoading: loadingEnvios } = useEnviosQueries(
    pageEnvios,
    pageSizeEnvios,
    filtrosEnvios
  );

  const transportadorasRaw = transportadorasData?.transportadoras;
  const enviosRaw = enviosData?.envios;

  // Mapeamento de dados
  const transportadoras = useMemo(() => {
    if (!transportadorasRaw) return [];
    
    return transportadorasRaw.map(t => ({
      id: t.id,
      nome: t.nome,
      cnpj: t.cnpj,
      razaoSocial: t.razao_social,
      telefone: t.telefone,
      email: t.email,
      responsavel: t.responsavel,
      status: t.status as 'ativa' | 'inativa',
      endereco: t.endereco as Transportadora['endereco'],
      dadosBancarios: t.dados_bancarios as Transportadora['dadosBancarios'],
      rotasAtendidas: (t.rotas || []).map((r: any) => ({
        id: r.id,
        cidadeDestino: r.cidade_destino,
        estadoDestino: r.estado_destino,
        prazoEntrega: r.prazo_entrega,
        valorBase: r.valor_base,
        ativa: r.ativa
      })),
      observacoes: t.observacoes,
      criadoEm: t.created_at,
      atualizadoEm: t.updated_at
    }));
  }, [transportadorasRaw]);

  const envios = useMemo(() => {
    if (!enviosRaw) return [];
    
    return enviosRaw.map(e => ({
      id: e.id,
      transportadoraId: e.transportadora_id!,
      eventoId: e.evento_id!,
      tipo: e.tipo as 'ida' | 'volta',
      status: e.status as Envio['status'],
      dataColeta: e.data_coleta,
      dataEntrega: e.data_entrega,
      dataEntregaPrevista: e.data_entrega_prevista,
      origem: e.origem,
      destino: e.destino,
      rastreio: e.rastreio,
      valor: e.valor ? Number(e.valor) : undefined,
      formaPagamento: e.forma_pagamento as Envio['formaPagamento'],
      comprovantePagamento: e.comprovante_pagamento,
      despesaEventoId: e.despesa_evento_id,
      observacoes: e.observacoes,
      criadoEm: e.created_at,
      atualizadoEm: e.updated_at
    }));
  }, [enviosRaw]);

  const loading = loadingTransportadoras || loadingEnvios;
  const totalTransportadoras = transportadorasData?.totalCount || 0;
  const totalEnvios = enviosData?.totalCount || 0;

  // Mutations
  const criarTransportadoraMutation = useMutation({
    mutationFn: async (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      const { data: transportadora, error } = await supabase
        .from('transportadoras')
        .insert({
          nome: data.nome,
          cnpj: data.cnpj,
          razao_social: data.razaoSocial,
          telefone: data.telefone,
          email: data.email,
          responsavel: data.responsavel,
          status: data.status,
          endereco: data.endereco,
          dados_bancarios: data.dadosBancarios,
          observacoes: data.observacoes
        })
        .select()
        .single();
      
      if (error) throw error;

      // Inserir rotas
      if (data.rotasAtendidas.length > 0) {
        const rotasInsert = data.rotasAtendidas.map(r => ({
          transportadora_id: transportadora.id,
          cidade_destino: r.cidadeDestino,
          estado_destino: r.estadoDestino,
          prazo_entrega: r.prazoEntrega,
          valor_base: r.valorBase,
          ativa: r.ativa
        }));

        const { error: rotasError } = await supabase
          .from('transportadoras_rotas')
          .insert(rotasInsert);
        
        if (rotasError) throw rotasError;
      }

      return transportadora;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Transportadora criada',
        description: 'Transportadora cadastrada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar transportadora',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const editarTransportadoraMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transportadora> }) => {
      const updateData: any = {};
      if (data.nome) updateData.nome = data.nome;
      if (data.status) updateData.status = data.status;
      if (data.responsavel) updateData.responsavel = data.responsavel;
      if (data.telefone) updateData.telefone = data.telefone;
      if (data.email) updateData.email = data.email;
      if (data.endereco) updateData.endereco = data.endereco;
      if (data.dadosBancarios) updateData.dados_bancarios = data.dadosBancarios;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;
      
      const { error } = await supabase
        .from('transportadoras')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Transportadora atualizada',
        description: 'Dados atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const excluirTransportadoraMutation = useMutation({
    mutationFn: async (id: string) => {
      // Verificar envios vinculados
      const { data: enviosVinculados } = await supabase
        .from('envios')
        .select('id')
        .eq('transportadora_id', id)
        .limit(1);
      
      if (enviosVinculados && enviosVinculados.length > 0) {
        throw new Error('Esta transportadora possui envios vinculados.');
      }

      const { error } = await supabase
        .from('transportadoras')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Transportadora excluída',
        description: 'Transportadora removida do sistema.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const criarEnvioMutation = useMutation({
    mutationFn: async (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
      const { data: novoEnvio, error } = await supabase
        .from('envios')
        .insert({
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
          observacoes: data.observacoes
        })
        .select()
        .single();
      
      if (error) throw error;

      // Criar despesa no evento (EventosContext ainda em mock)
      if (data.valor && data.eventoId) {
        const transportadora = transportadoras?.find(t => t.id === data.transportadoraId);
        const statusDespesa = data.formaPagamento === 'antecipado' ? 'pago' : 'pendente';
        
        const novaDespesa: Despesa = {
          id: `desp-${Date.now()}`,
          descricao: `Frete ${data.tipo === 'ida' ? 'Ida' : 'Volta'} - ${transportadora?.nome || 'Transportadora'}`,
          categoria: 'transporte',
          quantidade: 1,
          valorUnitario: data.valor,
          valor: data.valor,
          data: new Date().toISOString(),
          dataPagamento: data.formaPagamento === 'antecipado' ? new Date().toISOString() : undefined,
          status: statusDespesa,
          comprovante: data.comprovantePagamento,
          observacoes: `Envio ID: ${novoEnvio.id} | ${data.origem} → ${data.destino} | Pagamento: ${data.formaPagamento}`,
        };

        eventosContext.adicionarDespesa(data.eventoId, novaDespesa);
      }

      return novoEnvio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envios'] });
      toast({
        title: 'Envio criado',
        description: 'Envio registrado com sucesso e despesa adicionada ao evento.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar envio',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const editarEnvioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Envio> }) => {
      const envioAtual = envios?.find(e => e.id === id);
      if (!envioAtual) throw new Error('Envio não encontrado');

      const updateData: any = {};
      if (data.tipo) updateData.tipo = data.tipo;
      if (data.status) updateData.status = data.status;
      if (data.dataColeta !== undefined) updateData.data_coleta = data.dataColeta;
      if (data.dataEntrega !== undefined) updateData.data_entrega = data.dataEntrega;
      if (data.dataEntregaPrevista) updateData.data_entrega_prevista = data.dataEntregaPrevista;
      if (data.rastreio !== undefined) updateData.rastreio = data.rastreio;
      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.formaPagamento) updateData.forma_pagamento = data.formaPagamento;
      if (data.comprovantePagamento !== undefined) updateData.comprovante_pagamento = data.comprovantePagamento;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

      const { error } = await supabase
        .from('envios')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;

      // Atualizar despesa vinculada (EventosContext ainda em mock)
      if (envioAtual.despesaEventoId && (data.valor || data.formaPagamento || data.comprovantePagamento)) {
        const novoValor = data.valor ?? envioAtual.valor;
        const novaFormaPagamento = data.formaPagamento ?? envioAtual.formaPagamento;
        const novoComprovante = data.comprovantePagamento ?? envioAtual.comprovantePagamento;

        eventosContext.editarDespesa(envioAtual.eventoId, envioAtual.despesaEventoId, {
          valor: novoValor,
          valorUnitario: novoValor,
          status: novaFormaPagamento === 'antecipado' ? 'pago' : 'pendente',
          dataPagamento: novaFormaPagamento === 'antecipado' ? new Date().toISOString() : undefined,
          comprovante: novoComprovante,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envios'] });
      toast({
        title: 'Envio atualizado',
        description: 'Dados do envio atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const atualizarStatusEnvioMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Envio['status'] }) => {
      const { error } = await supabase
        .from('envios')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['envios'] });
      toast({
        title: 'Status atualizado',
        description: `Envio marcado como ${variables.status}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const adicionarRotaMutation = useMutation({
    mutationFn: async ({ transportadoraId, rota }: { transportadoraId: string; rota: Omit<RotaAtendida, 'id'> }) => {
      const { error } = await supabase
        .from('transportadoras_rotas')
        .insert({
          transportadora_id: transportadoraId,
          cidade_destino: rota.cidadeDestino,
          estado_destino: rota.estadoDestino,
          prazo_entrega: rota.prazoEntrega,
          valor_base: rota.valorBase,
          ativa: rota.ativa
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Rota adicionada',
        description: 'Nova rota cadastrada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar rota',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const editarRotaMutation = useMutation({
    mutationFn: async ({ rotaId, data }: { rotaId: string; data: Partial<RotaAtendida> }) => {
      const updateData: any = {};
      if (data.cidadeDestino) updateData.cidade_destino = data.cidadeDestino;
      if (data.estadoDestino) updateData.estado_destino = data.estadoDestino;
      if (data.prazoEntrega !== undefined) updateData.prazo_entrega = data.prazoEntrega;
      if (data.valorBase !== undefined) updateData.valor_base = data.valorBase;
      if (data.ativa !== undefined) updateData.ativa = data.ativa;

      const { error } = await supabase
        .from('transportadoras_rotas')
        .update(updateData)
        .eq('id', rotaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Rota atualizada',
        description: 'Dados da rota atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar rota',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const removerRotaMutation = useMutation({
    mutationFn: async (rotaId: string) => {
      const { error } = await supabase
        .from('transportadoras_rotas')
        .delete()
        .eq('id', rotaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      toast({
        title: 'Rota removida',
        description: 'Rota excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover rota',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Funções de busca (client-side)
  const buscarEnviosPorEvento = (eventoId: string) => {
    return envios?.filter(e => e.eventoId === eventoId) || [];
  };

  const buscarEnviosPorTransportadora = (transportadoraId: string) => {
    return envios?.filter(e => e.transportadoraId === transportadoraId) || [];
  };

  const buscarTransportadorasPorCidade = (cidade: string, estado: string) => {
    return transportadoras?.filter(t => 
      t.status === 'ativa' && 
      t.rotasAtendidas.some(r => 
        r.ativa && 
        (
          (r.cidadeDestino.toLowerCase() === cidade.toLowerCase() && r.estadoDestino === estado) ||
          (t.endereco.cidade.toLowerCase() === cidade.toLowerCase() && t.endereco.estado === estado)
        )
      )
    ) || [];
  };

  // Wrapper functions
  const criarTransportadora = (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    criarTransportadoraMutation.mutate(data);
  };

  const editarTransportadora = (id: string, data: Partial<Transportadora>) => {
    editarTransportadoraMutation.mutate({ id, data });
  };

  const excluirTransportadora = (id: string) => {
    excluirTransportadoraMutation.mutate(id);
  };

  const criarEnvio = (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    criarEnvioMutation.mutate(data);
  };

  const editarEnvio = (id: string, data: Partial<Envio>) => {
    editarEnvioMutation.mutate({ id, data });
  };

  const atualizarStatusEnvio = (id: string, status: Envio['status']) => {
    atualizarStatusEnvioMutation.mutate({ id, status });
  };

  const adicionarRota = (transportadoraId: string, rota: Omit<RotaAtendida, 'id'>) => {
    adicionarRotaMutation.mutate({ transportadoraId, rota });
  };

  const editarRota = (transportadoraId: string, rotaId: string, data: Partial<RotaAtendida>) => {
    editarRotaMutation.mutate({ rotaId, data });
  };

  const removerRota = (transportadoraId: string, rotaId: string) => {
    removerRotaMutation.mutate(rotaId);
  };

  const excluirEnvioMutation = useMutation({
    mutationFn: async (id: string) => {
      const envio = envios?.find(e => e.id === id);
      if (!envio) throw new Error('Envio não encontrado');
      
      if (envio.status === 'em_transito') {
        throw new Error('Não é possível excluir envios em trânsito');
      }

      const { error } = await supabase
        .from('envios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envios'] });
      toast({
        title: 'Envio excluído',
        description: 'Envio removido com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const excluirEnvio = (id: string) => {
    excluirEnvioMutation.mutate(id);
  };

  return (
    <TransportadorasContext.Provider
      value={{
        transportadoras,
        envios,
        loading,
        totalTransportadoras,
        totalEnvios,
        pageTransportadoras,
        pageEnvios,
        pageSizeTransportadoras,
        pageSizeEnvios,
        filtrosTransportadoras,
        filtrosEnvios,
        setPageTransportadoras,
        setPageEnvios,
        setFiltrosTransportadoras,
        setFiltrosEnvios,
        criarTransportadora,
        editarTransportadora,
        excluirTransportadora,
        criarEnvio,
        editarEnvio,
        excluirEnvio,
        atualizarStatusEnvio,
        buscarEnviosPorEvento,
        buscarEnviosPorTransportadora,
        buscarTransportadorasPorCidade,
        adicionarRota,
        editarRota,
        removerRota,
      }}
    >
      {children}
    </TransportadorasContext.Provider>
  );
}

export function useTransportadoras() {
  const context = useContext(TransportadorasContext);
  if (!context) {
    throw new Error('useTransportadoras must be used within TransportadorasProvider');
  }
  return context;
}
