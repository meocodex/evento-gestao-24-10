import { TipoContratoEvento } from '@/types/evento-contratos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DadosParaContrato {
  evento: {
    nome: string;
    dataInicio?: string;
    dataFim?: string;
    local: string;
    cidade: string;
    estado: string;
  };
  cliente?: {
    nome: string;
    documento?: string;
    email?: string;
    telefone?: string;
  } | null;
  empresa?: {
    nome?: string | null;
  } | null;
}

const MODELOS: Record<TipoContratoEvento, string> = {
  bar: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BAR E BEBIDAS

Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços de Bar, mediante as seguintes cláusulas e condições:

CONTRATANTE:
Nome: {{CLIENTE_NOME}}
Documento: {{CLIENTE_DOCUMENTO}}
E-mail: {{CLIENTE_EMAIL}}
Telefone: {{CLIENTE_TELEFONE}}

CONTRATADA:
{{EMPRESA_NOME}}

OBJETO DO CONTRATO:
A CONTRATADA obriga-se a prestar serviços de bar e bebidas para o evento denominado "{{EVENTO_NOME}}", a realizar-se em:
Data: {{EVENTO_DATA_INICIO}} a {{EVENTO_DATA_FIM}}
Local: {{EVENTO_LOCAL}}
Cidade/Estado: {{EVENTO_CIDADE}} - {{EVENTO_ESTADO}}

CLÁUSULA 1ª - DOS SERVIÇOS
A CONTRATADA prestará os seguintes serviços:
- Montagem e operação de ponto de venda de bebidas
- Fornecimento de estrutura completa de bar
- Equipe qualificada para atendimento
- Controle de estoque e fluxo de caixa

CLÁUSULA 2ª - DAS OBRIGAÇÕES DAS PARTES
Compete à CONTRATANTE:
- Fornecer espaço adequado para instalação do bar
- Garantir segurança do local durante o evento
- Divulgar o evento conforme acordado

Compete à CONTRATADA:
- Cumprir todos os requisitos legais para comercialização de bebidas
- Manter qualidade nos produtos fornecidos
- Zelar pela segurança dos consumidores

CLÁUSULA 3ª - DAS DISPOSIÇÕES GERAIS
O presente contrato é celebrado em caráter irrevogável e irretratável, obrigando as partes e seus sucessores.

Local e Data: ______________________, {{DATA_HOJE}}

_________________________________
CONTRATANTE: {{CLIENTE_NOME}}

_________________________________
CONTRATADA: {{EMPRESA_NOME}}`,

  ingresso: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BILHETERIA E INGRESSOS

Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços de Ingresso, mediante as seguintes cláusulas e condições:

CONTRATANTE:
Nome: {{CLIENTE_NOME}}
Documento: {{CLIENTE_DOCUMENTO}}
E-mail: {{CLIENTE_EMAIL}}
Telefone: {{CLIENTE_TELEFONE}}

CONTRATADA:
{{EMPRESA_NOME}}

OBJETO DO CONTRATO:
A CONTRATADA obriga-se a prestar serviços de bilheteria e gestão de ingressos para o evento denominado "{{EVENTO_NOME}}", a realizar-se em:
Data: {{EVENTO_DATA_INICIO}} a {{EVENTO_DATA_FIM}}
Local: {{EVENTO_LOCAL}}
Cidade/Estado: {{EVENTO_CIDADE}} - {{EVENTO_ESTADO}}

CLÁUSULA 1ª - DOS SERVIÇOS
A CONTRATADA prestará os seguintes serviços:
- Configuração e gestão do sistema de ingressos
- Processamento de vendas online e presenciais
- Controle de acesso no dia do evento
- Relatório de vendas e repasse financeiro

CLÁUSULA 2ª - DA REMUNERAÇÃO
A CONTRATANTE pagará à CONTRATADA taxa de serviço conforme acordado separadamente entre as partes.

CLÁUSULA 3ª - DAS OBRIGAÇÕES DAS PARTES
Compete à CONTRATANTE:
- Fornecer informações precisas sobre o evento
- Realizar divulgação do evento
- Garantir estrutura adequada para controle de acesso

Compete à CONTRATADA:
- Disponibilizar plataforma confiável para venda de ingressos
- Realizar repasse dos valores conforme acordado
- Fornecer suporte técnico durante o evento

CLÁUSULA 4ª - DAS DISPOSIÇÕES GERAIS
O presente contrato é celebrado em caráter irrevogável e irretratável.

Local e Data: ______________________, {{DATA_HOJE}}

_________________________________
CONTRATANTE: {{CLIENTE_NOME}}

_________________________________
CONTRATADA: {{EMPRESA_NOME}}`,

  bar_ingresso: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE BAR, BEBIDAS E BILHETERIA

Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços de Bar e Ingresso, mediante as seguintes cláusulas e condições:

CONTRATANTE:
Nome: {{CLIENTE_NOME}}
Documento: {{CLIENTE_DOCUMENTO}}
E-mail: {{CLIENTE_EMAIL}}
Telefone: {{CLIENTE_TELEFONE}}

CONTRATADA:
{{EMPRESA_NOME}}

OBJETO DO CONTRATO:
A CONTRATADA obriga-se a prestar serviços integrados de bar, bebidas e bilheteria para o evento denominado "{{EVENTO_NOME}}", a realizar-se em:
Data: {{EVENTO_DATA_INICIO}} a {{EVENTO_DATA_FIM}}
Local: {{EVENTO_LOCAL}}
Cidade/Estado: {{EVENTO_CIDADE}} - {{EVENTO_ESTADO}}

CLÁUSULA 1ª - DOS SERVIÇOS
A CONTRATADA prestará os seguintes serviços integrados:

SERVIÇOS DE BAR:
- Montagem e operação de ponto de venda de bebidas
- Fornecimento de estrutura completa de bar
- Equipe qualificada para atendimento

SERVIÇOS DE INGRESSO:
- Configuração e gestão do sistema de ingressos
- Processamento de vendas online e presenciais
- Controle de acesso no dia do evento

CLÁUSULA 2ª - DA INTEGRAÇÃO DOS SERVIÇOS
Os serviços de bar e ingresso serão operados de forma integrada, com sistema de consumação unificado quando aplicável.

CLÁUSULA 3ª - DAS OBRIGAÇÕES DAS PARTES
Compete à CONTRATANTE:
- Fornecer espaço adequado para instalação
- Garantir segurança do local durante o evento
- Divulgar o evento conforme acordado

Compete à CONTRATADA:
- Cumprir todos os requisitos legais
- Manter qualidade nos produtos e serviços
- Zelar pela segurança dos consumidores

CLÁUSULA 4ª - DAS DISPOSIÇÕES GERAIS
O presente contrato é celebrado em caráter irrevogável e irretratável.

Local e Data: ______________________, {{DATA_HOJE}}

_________________________________
CONTRATANTE: {{CLIENTE_NOME}}

_________________________________
CONTRATADA: {{EMPRESA_NOME}}`,

  credenciamento: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CREDENCIAMENTO

Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato de Prestação de Serviços de Credenciamento, mediante as seguintes cláusulas e condições:

CONTRATANTE:
Nome: {{CLIENTE_NOME}}
Documento: {{CLIENTE_DOCUMENTO}}
E-mail: {{CLIENTE_EMAIL}}
Telefone: {{CLIENTE_TELEFONE}}

CONTRATADA:
{{EMPRESA_NOME}}

OBJETO DO CONTRATO:
A CONTRATADA obriga-se a prestar serviços de credenciamento para o evento denominado "{{EVENTO_NOME}}", a realizar-se em:
Data: {{EVENTO_DATA_INICIO}} a {{EVENTO_DATA_FIM}}
Local: {{EVENTO_LOCAL}}
Cidade/Estado: {{EVENTO_CIDADE}} - {{EVENTO_ESTADO}}

CLÁUSULA 1ª - DOS SERVIÇOS
A CONTRATADA prestará os seguintes serviços de credenciamento:
- Configuração de sistema de credencial eletrônica ou física
- Impressão e entrega de credenciais
- Controle de acesso por categoria (VIP, Staff, Imprensa, etc.)
- Relatório de credenciados e acessos

CLÁUSULA 2ª - DAS CATEGORIAS DE ACESSO
As categorias de acesso serão definidas conforme necessidade do evento e acordadas entre as partes antes do início do credenciamento.

CLÁUSULA 3ª - DAS OBRIGAÇÕES DAS PARTES
Compete à CONTRATANTE:
- Fornecer lista de credenciados com antecedência mínima de 48 horas
- Definir categorias e permissões de acesso
- Indicar responsável para resolução de pendências no dia do evento

Compete à CONTRATADA:
- Configurar sistema de credenciamento conforme especificações
- Disponibilizar equipe treinada para operação
- Garantir funcionamento do sistema durante todo o evento

CLÁUSULA 4ª - DAS DISPOSIÇÕES GERAIS
O presente contrato é celebrado em caráter irrevogável e irretratável.

Local e Data: ______________________, {{DATA_HOJE}}

_________________________________
CONTRATANTE: {{CLIENTE_NOME}}

_________________________________
CONTRATADA: {{EMPRESA_NOME}}`,
};

export function gerarContratoFromModelo(
  tipo: TipoContratoEvento,
  dados: DadosParaContrato
): string {
  const modelo = MODELOS[tipo];
  const hoje = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const formatarData = (data?: string) => {
    if (!data) return 'A definir';
    try {
      return format(new Date(data + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  return modelo
    .replace(/{{CLIENTE_NOME}}/g, dados.cliente?.nome || 'A definir')
    .replace(/{{CLIENTE_DOCUMENTO}}/g, dados.cliente?.documento || 'A definir')
    .replace(/{{CLIENTE_EMAIL}}/g, dados.cliente?.email || 'A definir')
    .replace(/{{CLIENTE_TELEFONE}}/g, dados.cliente?.telefone || 'A definir')
    .replace(/{{EVENTO_NOME}}/g, dados.evento.nome)
    .replace(/{{EVENTO_DATA_INICIO}}/g, formatarData(dados.evento.dataInicio))
    .replace(/{{EVENTO_DATA_FIM}}/g, formatarData(dados.evento.dataFim))
    .replace(/{{EVENTO_LOCAL}}/g, dados.evento.local)
    .replace(/{{EVENTO_CIDADE}}/g, dados.evento.cidade)
    .replace(/{{EVENTO_ESTADO}}/g, dados.evento.estado)
    .replace(/{{EMPRESA_NOME}}/g, dados.empresa?.nome || 'Empresa Contratada')
    .replace(/{{DATA_HOJE}}/g, hoje);
}
