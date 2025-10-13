import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SerialEstoque {
  numero: string;
  status: 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
  eventoId?: string;
  eventoNome?: string;
  ultimaManutencao?: string;
  dataAquisicao?: string;
  observacoes?: string;
}

export interface MaterialEstoque {
  id: string;
  nome: string;
  categoria: string;
  seriais: SerialEstoque[];
  quantidadeDisponivel: number;
  quantidadeTotal: number;
  unidade: string;
  descricao?: string;
  foto?: string;
  valorUnitario?: number;
}

interface FiltrosEstoque {
  busca: string;
  categoria: string;
  status: 'todos' | 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
}

interface EstoqueContextData {
  materiais: MaterialEstoque[];
  loading: boolean;
  filtros: FiltrosEstoque;
  setFiltros: (filtros: FiltrosEstoque) => void;
  adicionarMaterial: (material: Omit<MaterialEstoque, 'id' | 'seriais'>) => Promise<MaterialEstoque>;
  editarMaterial: (id: string, dados: Partial<MaterialEstoque>) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  adicionarSerial: (materialId: string, serial: SerialEstoque) => Promise<void>;
  editarSerial: (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => Promise<void>;
  excluirSerial: (materialId: string, numeroSerial: string) => Promise<void>;
  buscarMaterialPorId: (id: string) => MaterialEstoque | undefined;
  materiaisFiltrados: MaterialEstoque[];
  getEstatisticas: () => {
    totalItens: number;
    totalDisponiveis: number;
    totalEmUso: number;
    totalManutencao: number;
    categorias: number;
  };
}

const EstoqueContext = createContext<EstoqueContextData | undefined>(undefined);

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState<FiltrosEstoque>({
    busca: '',
    categoria: 'todas',
    status: 'todos',
    localizacao: '',
  });

  // Query para buscar materiais com seus seriais
  const { data: materiais = [], isLoading: loading } = useQuery({
    queryKey: ['materiais_estoque'],
    queryFn: async () => {
      const { data: materiaisDb, error: materiaisError } = await supabase
        .from('materiais_estoque')
        .select('*')
        .order('nome');

      if (materiaisError) throw materiaisError;

      const { data: seriaisDb, error: seriaisError } = await supabase
        .from('materiais_seriais')
        .select('*');

      if (seriaisError) throw seriaisError;

      return (materiaisDb || []).map(m => ({
        id: m.id,
        nome: m.nome,
        categoria: m.categoria,
        descricao: m.descricao || undefined,
        foto: m.foto || undefined,
        valorUnitario: m.valor_unitario ? Number(m.valor_unitario) : undefined,
        quantidadeTotal: m.quantidade_total,
        quantidadeDisponivel: m.quantidade_disponivel,
        unidade: 'un',
        seriais: (seriaisDb || [])
          .filter(s => s.material_id === m.id)
          .map(s => ({
            numero: s.numero,
            status: s.status as SerialEstoque['status'],
            localizacao: s.localizacao,
            ultimaManutencao: s.ultima_manutencao || undefined,
            dataAquisicao: s.data_aquisicao || undefined,
            observacoes: s.observacoes || undefined,
          })),
      }));
    },
  });

  const materiaisFiltrados = useMemo(() => {
    return materiais.filter((material) => {
      const matchBusca = filtros.busca === '' || 
        material.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        material.categoria.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        material.seriais.some(s => s.numero.toLowerCase().includes(filtros.busca.toLowerCase()));

      const matchCategoria = filtros.categoria === 'todas' || material.categoria === filtros.categoria;

      const matchStatus = filtros.status === 'todos' || 
        material.seriais.some(s => s.status === filtros.status);

      const matchLocalizacao = filtros.localizacao === '' || 
        material.seriais.some(s => s.localizacao.toLowerCase().includes(filtros.localizacao.toLowerCase()));

      return matchBusca && matchCategoria && matchStatus && matchLocalizacao;
    });
  }, [materiais, filtros]);

  const adicionarMaterialMutation = useMutation({
    mutationFn: async (dados: Omit<MaterialEstoque, 'id' | 'seriais'>) => {
      const { data, error } = await supabase
        .from('materiais_estoque')
        .insert({
          id: `MAT${Date.now()}`,
          nome: dados.nome,
          categoria: dados.categoria,
          descricao: dados.descricao,
          foto: dados.foto,
          valor_unitario: dados.valorUnitario,
          quantidade_total: 0,
          quantidade_disponivel: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material cadastrado',
        description: `${data.nome} foi adicionado ao estoque.`,
      });
    },
  });

  const adicionarMaterial = async (dados: Omit<MaterialEstoque, 'id' | 'seriais'>): Promise<MaterialEstoque> => {
    const result = await adicionarMaterialMutation.mutateAsync(dados);
    return {
      id: result.id,
      nome: result.nome,
      categoria: result.categoria,
      descricao: result.descricao || undefined,
      foto: result.foto || undefined,
      valorUnitario: result.valor_unitario ? Number(result.valor_unitario) : undefined,
      quantidadeTotal: result.quantidade_total,
      quantidadeDisponivel: result.quantidade_disponivel,
      unidade: 'un',
      seriais: [],
    };
  };

  const editarMaterialMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<MaterialEstoque> }) => {
      const { error } = await supabase
        .from('materiais_estoque')
        .update({
          nome: dados.nome,
          categoria: dados.categoria,
          descricao: dados.descricao,
          foto: dados.foto,
          valor_unitario: dados.valorUnitario,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
  });

  const editarMaterial = async (id: string, dados: Partial<MaterialEstoque>) => {
    await editarMaterialMutation.mutateAsync({ id, dados });
  };

  const excluirMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      const material = materiais.find(m => m.id === id);
      if (!material) throw new Error('Material não encontrado');

      const seriaisEmUso = material.seriais.filter(s => s.status === 'em-uso');
      if (seriaisEmUso.length > 0) {
        throw new Error(`Este material possui ${seriaisEmUso.length} unidade(s) em uso.`);
      }

      const { error } = await supabase
        .from('materiais_estoque')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return material;
    },
    onSuccess: (material) => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Material excluído',
        description: `${material.nome} foi removido do estoque.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const excluirMaterial = async (id: string) => {
    await excluirMaterialMutation.mutateAsync(id);
  };

  const adicionarSerialMutation = useMutation({
    mutationFn: async ({ materialId, dados }: { materialId: string; dados: SerialEstoque }) => {
      const material = materiais.find(m => m.id === materialId);
      if (!material) throw new Error('Material não encontrado');

      // Verificar se o número de serial já existe para este material
      const serialExistente = material.seriais.find(s => s.numero === dados.numero);
      if (serialExistente) {
        throw new Error('Este número de serial já está cadastrado para este material');
      }

      const { error } = await supabase
        .from('materiais_seriais')
        .insert({
          material_id: materialId,
          numero: dados.numero,
          status: dados.status,
          localizacao: dados.localizacao,
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        });

      if (error) throw error;

      // Atualizar contadores do material
      const novaQuantidadeTotal = material.quantidadeTotal + 1;
      const novaQuantidadeDisponivel = dados.status === 'disponivel' 
        ? material.quantidadeDisponivel + 1 
        : material.quantidadeDisponivel;

      const { error: updateError } = await supabase
        .from('materiais_estoque')
        .update({
          quantidade_total: novaQuantidadeTotal,
          quantidade_disponivel: novaQuantidadeDisponivel,
        })
        .eq('id', materialId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Serial adicionado',
        description: 'Novo item adicionado ao estoque.',
      });
    },
  });

  const adicionarSerial = async (materialId: string, dados: SerialEstoque) => {
    await adicionarSerialMutation.mutateAsync({ materialId, dados });
  };

  const editarSerialMutation = useMutation({
    mutationFn: async ({ materialId, numeroSerial, dados }: { materialId: string; numeroSerial: string; dados: Partial<SerialEstoque> }) => {
      const material = materiais.find(m => m.id === materialId);
      if (!material) throw new Error('Material não encontrado');

      const serialAtual = material.seriais.find(s => s.numero === numeroSerial);
      if (!serialAtual) throw new Error('Serial não encontrado');

      const { error } = await supabase
        .from('materiais_seriais')
        .update({
          status: dados.status,
          localizacao: dados.localizacao,
          data_aquisicao: dados.dataAquisicao,
          ultima_manutencao: dados.ultimaManutencao,
          observacoes: dados.observacoes,
        })
        .eq('material_id', materialId)
        .eq('numero', numeroSerial);

      if (error) throw error;

      // Atualizar quantidade disponível se mudou o status
      if (dados.status && serialAtual.status !== dados.status) {
        let novaQuantidadeDisponivel = material.quantidadeDisponivel;
        if (serialAtual.status !== 'disponivel' && dados.status === 'disponivel') {
          novaQuantidadeDisponivel++;
        } else if (serialAtual.status === 'disponivel' && dados.status !== 'disponivel') {
          novaQuantidadeDisponivel--;
        }

        const { error: updateError } = await supabase
          .from('materiais_estoque')
          .update({ quantidade_disponivel: novaQuantidadeDisponivel })
          .eq('id', materialId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Serial atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
  });

  const editarSerial = async (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => {
    await editarSerialMutation.mutateAsync({ materialId, numeroSerial, dados });
  };

  const excluirSerialMutation = useMutation({
    mutationFn: async ({ materialId, numeroSerial }: { materialId: string; numeroSerial: string }) => {
      const material = materiais.find(m => m.id === materialId);
      if (!material) throw new Error('Material não encontrado');

      const serial = material.seriais.find(s => s.numero === numeroSerial);
      if (!serial) throw new Error('Serial não encontrado');

      if (serial.status === 'em-uso') {
        throw new Error('Este serial está em uso.');
      }

      const { error } = await supabase
        .from('materiais_seriais')
        .delete()
        .eq('material_id', materialId)
        .eq('numero', numeroSerial);

      if (error) throw error;

      // Atualizar contadores
      const novaQuantidadeTotal = material.quantidadeTotal - 1;
      const novaQuantidadeDisponivel = serial.status === 'disponivel' 
        ? material.quantidadeDisponivel - 1 
        : material.quantidadeDisponivel;

      const { error: updateError } = await supabase
        .from('materiais_estoque')
        .update({
          quantidade_total: novaQuantidadeTotal,
          quantidade_disponivel: novaQuantidadeDisponivel,
        })
        .eq('id', materialId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais_estoque'] });
      toast({
        title: 'Serial excluído',
        description: 'Item removido do estoque.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Não é possível excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const excluirSerial = async (materialId: string, numeroSerial: string) => {
    await excluirSerialMutation.mutateAsync({ materialId, numeroSerial });
  };

  const buscarMaterialPorId = (id: string) => {
    return materiais.find(m => m.id === id);
  };

  const getEstatisticas = () => {
    const totalItens = materiais.reduce((acc, m) => acc + m.quantidadeTotal, 0);
    const totalDisponiveis = materiais.reduce((acc, m) => acc + m.quantidadeDisponivel, 0);
    
    let totalEmUso = 0;
    let totalManutencao = 0;
    materiais.forEach(m => {
      m.seriais.forEach(s => {
        if (s.status === 'em-uso') totalEmUso++;
        if (s.status === 'manutencao') totalManutencao++;
      });
    });

    const categorias = new Set(materiais.map(m => m.categoria)).size;

    return {
      totalItens,
      totalDisponiveis,
      totalEmUso,
      totalManutencao,
      categorias,
    };
  };

  return (
    <EstoqueContext.Provider
      value={{
        materiais,
        loading,
        filtros,
        setFiltros,
        adicionarMaterial,
        editarMaterial,
        excluirMaterial,
        adicionarSerial,
        editarSerial,
        excluirSerial,
        buscarMaterialPorId,
        materiaisFiltrados,
        getEstatisticas,
      }}
    >
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider');
  }
  return context;
}
