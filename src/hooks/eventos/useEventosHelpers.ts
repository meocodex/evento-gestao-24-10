/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { 
  useEventosQueries, 
  useEventosMutations, 
  useEventosFinanceiro,
  useEventosEquipe,
  useEventosMateriaisAlocados,
  useEventosObservacoes,
  useEventosChecklist
} from './index';

export function useEventos() {
  const [page] = React.useState(1);
  const { eventos = [], totalCount = 0 } = useEventosQueries(page, 50);
  const mutations = useEventosMutations();
  const financeiro = useEventosFinanceiro();
  const equipe = useEventosEquipe();
  const materiais = useEventosMateriaisAlocados();
  const observacoes = useEventosObservacoes();
  const checklist = useEventosChecklist();

  return {
    eventos,
    totalCount,
    page: 1,
    pageSize: 50,
    setPage: () => {},
    criarEvento: mutations.criarEvento,
    editarEvento: mutations.editarEvento,
    excluirEvento: mutations.excluirEvento,
    deletarEvento: mutations.excluirEvento,
    alterarStatus: mutations.alterarStatus,
    adicionarReceita: (eventoId: string, receita: any) => financeiro.adicionarReceita.mutateAsync({ eventoId, receita }),
    removerReceita: (receitaId: string) => financeiro.removerReceita.mutateAsync({ receitaId }),
    adicionarDespesa: (eventoId: string, despesa: any) => financeiro.adicionarDespesa.mutateAsync({ eventoId, despesa }),
    removerDespesa: (despesaId: string) => financeiro.removerDespesa.mutateAsync({ despesaId }),
    editarDespesa: (despesaId: string, despesa: any) => financeiro.editarDespesa.mutateAsync({ despesaId, data: despesa }),
    adicionarMembroEquipe: (eventoId: string, membro: any) => equipe.adicionarMembro.mutateAsync({ eventoId, membro }),
    removerMembroEquipe: (membroId: string) => equipe.removerMembro.mutateAsync({ membroId }),
    adicionarObservacaoOperacional: (id: string, obs: any) => observacoes.adicionarObservacao.mutateAsync({ eventoId: id, observacao: obs }),
    adicionarMaterialChecklist: (eventoId: string, material: any) => checklist.adicionarMaterial.mutateAsync({ eventoId, material }),
    removerMaterialChecklist: (eventoId: string, materialId: string) => checklist.removerMaterial.mutateAsync({ eventoId, materialId }),
    removerMaterialAlocado: (eventoId: string, materialId: string) => materiais.removerMaterialAlocado.mutateAsync({ eventoId, materialId }),
    alocarMaterial: (eventoId: string, tipo: 'antecipado' | 'comTecnicos', material: any) => materiais.alocarMaterial.mutateAsync({ eventoId, tipo, material }),
    desalocarMaterial: (eventoId: string, materialId: string) => materiais.removerMaterialAlocado.mutateAsync({ eventoId, materialId }),
  };
}
