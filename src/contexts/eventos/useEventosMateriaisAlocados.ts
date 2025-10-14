import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEstoqueValidation } from '@/hooks/useEstoqueValidation';

export function useEventosMateriaisAlocados() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { verificarDisponibilidade, verificarConflitos, reservarMaterial, liberarMaterial } = useEstoqueValidation();

  const alocarMaterial = useMutation({
    mutationFn: async ({ 
      eventoId, 
      tipo, 
      material 
    }: { 
      eventoId: string; 
      tipo: 'antecipado' | 'comTecnicos'; 
      material: any 
    }) => {
      // Buscar dados do evento
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('data_inicio, data_fim')
        .eq('id', eventoId)
        .single();

      if (eventoError) throw eventoError;

      // Verificar disponibilidade
      const { disponivel, detalhes } = await verificarDisponibilidade(
        material.itemId,
        1,
        eventoId
      );

      if (!disponivel) {
        throw new Error(`Material indisponível: ${detalhes?.nome || material.nome}`);
      }

      // Verificar conflitos de agenda
      const { temConflito, eventos } = await verificarConflitos(
        material.itemId,
        evento.data_inicio,
        evento.data_fim,
        eventoId
      );

      if (temConflito && eventos.length > 0) {
        const nomeEventos = eventos.map(e => e.nome).join(', ');
        throw new Error(`Material já alocado para: ${nomeEventos}`);
      }

      // Reservar material no estoque
      const reservado = await reservarMaterial(material.itemId, material.serial, eventoId);
      if (!reservado) {
        throw new Error('Falha ao reservar material');
      }

      // Buscar nome do evento para atualizar localização
      const { data: eventoData } = await supabase
        .from('eventos')
        .select('nome')
        .eq('id', eventoId)
        .single();

      // Atualizar localização do material para o nome do evento
      await supabase
        .from('materiais_seriais')
        .update({ 
          localizacao: eventoData?.nome || `Evento ${eventoId}`,
          status: 'em-uso'
        })
        .eq('numero', material.serial);

      // Registrar histórico de localização
      const { data: userData } = await supabase.auth.getUser();
      await supabase
        .from('materiais_historico_localizacao')
        .insert({
          serial_numero: material.serial,
          material_id: material.itemId,
          evento_id: eventoId,
          localizacao_anterior: 'Depósito',
          localizacao_nova: eventoData?.nome || `Evento ${eventoId}`,
          usuario_id: userData?.user?.id,
          observacoes: `Material alocado para o evento (${tipo === 'antecipado' ? 'Envio Antecipado' : 'Com Técnicos'})`
        });

      const tipoEnvio = tipo === 'antecipado' ? 'antecipado' : 'com_tecnicos';
      
      const { data, error } = await supabase
        .from('eventos_materiais_alocados')
        .insert([{
          evento_id: eventoId,
          item_id: material.itemId,
          nome: material.nome,
          serial: material.serial,
          tipo_envio: tipoEnvio,
          status: 'reservado',
          transportadora: material.transportadora,
          rastreamento: material.rastreamento,
          data_envio: material.dataEnvio,
          responsavel: material.responsavel
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar quantidade alocada no checklist manualmente
      // Buscar item atual
      const { data: checklistItem } = await supabase
        .from('eventos_checklist')
        .select('alocado')
        .eq('evento_id', eventoId)
        .eq('item_id', material.itemId)
        .single();

      if (checklistItem) {
        await supabase
          .from('eventos_checklist')
          .update({ alocado: checklistItem.alocado + 1 })
          .eq('evento_id', eventoId)
          .eq('item_id', material.itemId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material alocado!',
        description: 'Material alocado com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao alocar material',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removerMaterialAlocado = useMutation({
    mutationFn: async ({ 
      eventoId, 
      materialId 
    }: { 
      eventoId: string; 
      materialId: string 
    }) => {
      // Buscar dados do material antes de remover
      const { data: materialAlocado, error: fetchError } = await supabase
        .from('eventos_materiais_alocados')
        .select('item_id, serial')
        .eq('id', materialId)
        .single();

      if (fetchError) throw fetchError;

      // Remover alocação
      const { error } = await supabase
        .from('eventos_materiais_alocados')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      // Atualizar localização do material de volta para Depósito
      await supabase
        .from('materiais_seriais')
        .update({ 
          localizacao: 'Depósito',
          status: 'disponivel'
        })
        .eq('numero', materialAlocado.serial);

      // Registrar histórico de localização
      const { data: userData } = await supabase.auth.getUser();
      const { data: eventoData } = await supabase
        .from('eventos')
        .select('nome')
        .eq('id', eventoId)
        .single();

      await supabase
        .from('materiais_historico_localizacao')
        .insert({
          serial_numero: materialAlocado.serial,
          material_id: materialAlocado.item_id,
          evento_id: eventoId,
          localizacao_anterior: eventoData?.nome || `Evento ${eventoId}`,
          localizacao_nova: 'Depósito',
          usuario_id: userData?.user?.id,
          observacoes: 'Material devolvido ao depósito'
        });

      // Liberar material no estoque
      await liberarMaterial(materialAlocado.item_id, materialAlocado.serial);

      // Decrementar quantidade alocada no checklist
      const { data: checklistItem } = await supabase
        .from('eventos_checklist')
        .select('alocado')
        .eq('evento_id', eventoId)
        .eq('item_id', materialAlocado.item_id)
        .single();

      if (checklistItem) {
        await supabase
          .from('eventos_checklist')
          .update({ alocado: Math.max(0, checklistItem.alocado - 1) })
          .eq('evento_id', eventoId)
          .eq('item_id', materialAlocado.item_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      toast({
        title: 'Material removido!',
        description: 'Material removido da alocação.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover material',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    alocarMaterial,
    removerMaterialAlocado
  };
}
