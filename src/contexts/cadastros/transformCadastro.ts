import { CadastroPublico, TipoEvento } from '@/types/eventos';
import { CadastroPublicoDB } from '@/types/utils';

export function transformCadastro(data: CadastroPublicoDB): CadastroPublico {
  return {
    id: data.id,
    protocolo: data.protocolo,
    nome: data.nome,
    tipoEvento: data.tipo_evento as TipoEvento,
    dataInicio: data.data_inicio,
    dataFim: data.data_fim,
    horaInicio: data.hora_inicio,
    horaFim: data.hora_fim,
    local: data.local,
    cidade: data.cidade,
    estado: data.estado,
    endereco: data.endereco,
    produtor: data.produtor as unknown as CadastroPublico['produtor'],
    configuracaoIngresso: data.configuracao_ingresso as unknown as CadastroPublico['configuracaoIngresso'],
    configuracaoBar: data.configuracao_bar as unknown as CadastroPublico['configuracaoBar'],
    status: data.status as CadastroPublico['status'],
    dataCriacao: data.created_at,
    eventoId: data.evento_id,
    observacoesInternas: data.observacoes_internas,
  };
}
