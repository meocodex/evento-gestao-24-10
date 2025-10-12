import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaterialDisponibilidade {
  itemId: string;
  nome: string;
  disponiveis: number;
  alocados: number;
  total: number;
}

export function useEstoqueValidation() {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);

  const verificarDisponibilidade = useCallback(async (
    itemId: string,
    quantidadeNecessaria: number,
    eventoId?: string
  ): Promise<{ disponivel: boolean; detalhes: MaterialDisponibilidade | null }> => {
    try {
      setIsValidating(true);

      // Buscar informações do material
      const { data: material, error: materialError } = await supabase
        .from('materiais_estoque')
        .select('id, nome, quantidade_total, quantidade_disponivel')
        .eq('id', itemId)
        .single();

      if (materialError || !material) {
        throw new Error('Material não encontrado no estoque');
      }

      // Buscar seriais disponíveis
      const { data: seriais, error: seriaisError } = await supabase
        .from('materiais_seriais')
        .select('numero, status')
        .eq('material_id', itemId)
        .eq('status', 'disponivel');

      if (seriaisError) throw seriaisError;

      const seriaisDisponiveis = seriais?.length || 0;

      // Buscar materiais já alocados para outros eventos
      const { data: alocados, error: alocadosError } = await supabase
        .from('eventos_materiais_alocados')
        .select('item_id, evento_id')
        .eq('item_id', itemId)
        .in('status', ['reservado', 'separado', 'em_transito', 'entregue']);

      if (alocadosError) throw alocadosError;

      // Se estamos editando um evento, não contar os materiais já alocados para ele
      const alocadosOutrosEventos = eventoId
        ? alocados?.filter(a => a.evento_id !== eventoId).length || 0
        : alocados?.length || 0;

      const disponiveisReal = Math.min(
        material.quantidade_disponivel,
        seriaisDisponiveis - alocadosOutrosEventos
      );

      const detalhes: MaterialDisponibilidade = {
        itemId: material.id,
        nome: material.nome,
        disponiveis: disponiveisReal,
        alocados: alocadosOutrosEventos,
        total: material.quantidade_total
      };

      const disponivel = disponiveisReal >= quantidadeNecessaria;

      if (!disponivel) {
        toast({
          title: 'Material indisponível',
          description: `${material.nome}: apenas ${disponiveisReal} disponível(is) de ${quantidadeNecessaria} solicitado(s)`,
          variant: 'destructive'
        });
      }

      return { disponivel, detalhes };
    } catch (error: any) {
      toast({
        title: 'Erro ao verificar disponibilidade',
        description: error.message,
        variant: 'destructive'
      });
      return { disponivel: false, detalhes: null };
    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const verificarConflitos = useCallback(async (
    itemId: string,
    dataInicio: string,
    dataFim: string,
    eventoId?: string
  ): Promise<{ temConflito: boolean; eventos: any[] }> => {
    try {
      // Buscar eventos que se sobrepõem no período
      const { data: eventosConflito, error } = await supabase
        .from('eventos')
        .select(`
          id,
          nome,
          data_inicio,
          data_fim,
          materiais_alocados:eventos_materiais_alocados!inner(item_id, status)
        `)
        .eq('materiais_alocados.item_id', itemId)
        .or(`data_inicio.lte.${dataFim},data_fim.gte.${dataInicio}`)
        .in('materiais_alocados.status', ['reservado', 'separado', 'em_transito', 'entregue']);

      if (error) throw error;

      // Filtrar o evento atual se estamos editando
      const conflitos = eventoId
        ? eventosConflito?.filter(e => e.id !== eventoId) || []
        : eventosConflito || [];

      if (conflitos.length > 0) {
        toast({
          title: 'Conflito de agenda',
          description: `Este material já está alocado para ${conflitos.length} evento(s) no mesmo período`,
          variant: 'destructive'
        });
      }

      return {
        temConflito: conflitos.length > 0,
        eventos: conflitos
      };
    } catch (error: any) {
      toast({
        title: 'Erro ao verificar conflitos',
        description: error.message,
        variant: 'destructive'
      });
      return { temConflito: false, eventos: [] };
    }
  }, [toast]);

  const reservarMaterial = useCallback(async (
    itemId: string,
    serial: string,
    eventoId: string
  ): Promise<boolean> => {
    try {
      // Atualizar status do serial para em-uso
      const { error: serialError } = await supabase
        .from('materiais_seriais')
        .update({ status: 'em-uso' })
        .eq('numero', serial)
        .eq('status', 'disponivel');

      if (serialError) throw serialError;

      // Decrementar quantidade disponível diretamente
      const { data: material } = await supabase
        .from('materiais_estoque')
        .select('quantidade_disponivel')
        .eq('id', itemId)
        .single();

      if (material && material.quantidade_disponivel > 0) {
        await supabase
          .from('materiais_estoque')
          .update({ quantidade_disponivel: material.quantidade_disponivel - 1 })
          .eq('id', itemId);
      }

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao reservar material',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const liberarMaterial = useCallback(async (
    itemId: string,
    serial: string
  ): Promise<boolean> => {
    try {
      // Atualizar status do serial para disponível
      const { error: serialError } = await supabase
        .from('materiais_seriais')
        .update({ status: 'disponivel' })
        .eq('numero', serial);

      if (serialError) throw serialError;

      // Incrementar quantidade disponível diretamente
      const { data: material } = await supabase
        .from('materiais_estoque')
        .select('quantidade_disponivel, quantidade_total')
        .eq('id', itemId)
        .single();

      if (material && material.quantidade_disponivel < material.quantidade_total) {
        await supabase
          .from('materiais_estoque')
          .update({ quantidade_disponivel: material.quantidade_disponivel + 1 })
          .eq('id', itemId);
      }

      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao liberar material',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  return {
    isValidating,
    verificarDisponibilidade,
    verificarConflitos,
    reservarMaterial,
    liberarMaterial
  };
}
