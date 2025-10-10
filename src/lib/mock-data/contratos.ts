import { ContratoTemplate, Contrato } from '@/types/contratos';

export const templatesMock: ContratoTemplate[] = [
  {
    id: '1',
    nome: 'Contrato de Prestação de Serviços - Evento',
    tipo: 'evento',
    descricao: 'Template padrão para contratos de eventos',
    conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Contratante: {{cliente_nome}}
CNPJ/CPF: {{cliente_documento}}

Contratada: {{empresa_nome}}
CNPJ: {{empresa_cnpj}}

Objeto: Prestação de serviços para o evento {{evento_nome}}
Data do Evento: {{evento_data}}
Local: {{evento_local}}

Valor Total: {{valor_total}}

Condições de Pagamento: {{condicoes_pagamento}}`,
    variaveis: ['cliente_nome', 'cliente_documento', 'empresa_nome', 'empresa_cnpj', 'evento_nome', 'evento_data', 'evento_local', 'valor_total', 'condicoes_pagamento'],
    status: 'ativo',
    versao: 1,
    criadoEm: '2024-01-10T10:00:00',
    atualizadoEm: '2024-01-10T10:00:00',
  },
  {
    id: '2',
    nome: 'Contrato de Fornecimento',
    tipo: 'fornecedor',
    descricao: 'Template para contratos com fornecedores',
    conteudo: `CONTRATO DE FORNECIMENTO

Contratante: {{empresa_nome}}
CNPJ: {{empresa_cnpj}}

Fornecedor: {{fornecedor_nome}}
CNPJ/CPF: {{fornecedor_documento}}

Objeto: {{objeto_contrato}}
Prazo: {{prazo_entrega}}

Valor: {{valor_total}}`,
    variaveis: ['empresa_nome', 'empresa_cnpj', 'fornecedor_nome', 'fornecedor_documento', 'objeto_contrato', 'prazo_entrega', 'valor_total'],
    status: 'ativo',
    versao: 1,
    criadoEm: '2024-01-15T14:00:00',
    atualizadoEm: '2024-01-15T14:00:00',
  },
];

export const contratosMock: Contrato[] = [
  {
    id: '1',
    templateId: '1',
    numero: 'CTR-2024-001',
    clienteId: '1',
    eventoId: '1',
    titulo: 'Contrato Tech Summit 2024',
    tipo: 'evento',
    status: 'assinado',
    conteudo: 'Conteúdo do contrato preenchido...',
    valor: 150000,
    dataInicio: '2024-03-01',
    dataFim: '2024-03-15',
    assinaturas: [
      {
        parte: 'Contratante',
        nome: 'Tech Corp',
        email: 'contrato@techcorp.com',
        dataAssinatura: '2024-02-20T10:00:00',
        assinado: true,
      },
      {
        parte: 'Contratada',
        nome: 'Nossa Empresa',
        email: 'contratos@nossaempresa.com',
        dataAssinatura: '2024-02-20T14:00:00',
        assinado: true,
      },
    ],
    anexos: [],
    criadoEm: '2024-02-15T10:00:00',
    atualizadoEm: '2024-02-20T14:30:00',
  },
  {
    id: '2',
    templateId: '1',
    numero: 'CTR-2024-002',
    clienteId: '2',
    eventoId: '2',
    titulo: 'Contrato Festival Inovação',
    tipo: 'evento',
    status: 'aguardando_assinatura',
    conteudo: 'Conteúdo do contrato preenchido...',
    valor: 85000,
    dataInicio: '2024-04-01',
    dataFim: '2024-04-03',
    assinaturas: [
      {
        parte: 'Contratante',
        nome: 'Inovação Ltda',
        email: 'juridico@inovacao.com',
        assinado: false,
      },
      {
        parte: 'Contratada',
        nome: 'Nossa Empresa',
        email: 'contratos@nossaempresa.com',
        dataAssinatura: '2024-03-05T16:00:00',
        assinado: true,
      },
    ],
    anexos: [],
    criadoEm: '2024-03-01T11:00:00',
    atualizadoEm: '2024-03-05T16:30:00',
  },
];
