export type TipoContratoEvento = 'bar' | 'ingresso' | 'bar_ingresso' | 'credenciamento';
export type StatusContratoEvento = 'rascunho' | 'finalizado';

export interface ContratoEvento {
  id: string;
  eventoId: string;
  tipo: TipoContratoEvento;
  titulo: string;
  conteudo: string;
  status: StatusContratoEvento;
  arquivoAssinadoUrl: string | null;
  arquivoAssinadoNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export const TIPO_CONTRATO_LABELS: Record<TipoContratoEvento, string> = {
  bar: 'Contrato de Bar',
  ingresso: 'Contrato de Ingresso',
  bar_ingresso: 'Contrato de Bar e Ingresso',
  credenciamento: 'Credenciamento',
};
