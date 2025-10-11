import { CadastroPublico } from '@/types/eventos';

export function transformCadastro(data: any): CadastroPublico {
  return {
    id: data.id,
    protocolo: data.protocolo,
    nome: data.nome,
    tipoEvento: data.tipo_evento,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    horaInicio: data.hora_inicio,
    horaFim: data.hora_fim,
    local: data.local,
    cidade: data.cidade,
    estado: data.estado,
    endereco: data.endereco,
    produtor: data.produtor,
    configuracaoIngresso: data.configuracao_ingresso,
    configuracaoBar: data.configuracao_bar,
    status: data.status,
    dataCriacao: data.created_at,
    eventoId: data.evento_id,
    observacoesInternas: data.observacoes_internas,
  };
}
