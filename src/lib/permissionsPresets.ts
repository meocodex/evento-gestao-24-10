/**
 * Presets de permissões por função/cargo
 * Facilita configuração rápida de novos usuários
 */

export const permissionsPresets = {
  comercial: {
    label: 'Comercial',
    icon: '🎯',
    permissions: [
      'eventos.visualizar',
      'eventos.criar',
      'eventos.editar_proprios',
      'clientes.visualizar',
      'clientes.criar',
      'clientes.editar',
      'contratos.visualizar',
      'contratos.editar',
      'propostas.criar',
      'propostas.editar',
      'financeiro.visualizar_proprios',
      'demandas.criar',
      'relatorios.visualizar',
      'relatorios.gerar',
    ]
  },
  suporte: {
    label: 'Suporte',
    icon: '🔧',
    permissions: [
      'eventos.visualizar',
      'eventos.editar_todos',
      'estoque.visualizar',
      'estoque.editar',
      'estoque.alocar',
      'transportadoras.visualizar',
      'transportadoras.editar',
      'equipe.visualizar',
      'equipe.editar',
      'demandas.visualizar',
      'demandas.criar',
      'demandas.editar',
      'operacao.coordenar',
      'operacao.executar',
      'operacao.registrar_retirada',
      'operacao.devolver_material',
      'operacao.gerenciar_documentos',
      'relatorios.visualizar',
    ]
  },
  operacional: {
    label: 'Operacional',
    icon: '👷',
    permissions: [
      'eventos.visualizar',
      'demandas.visualizar',
      'demandas.criar',
      'estoque.visualizar',
      'operacao.executar',
      'operacao.registrar_retirada',
      'operacao.devolver_material',
      'equipe.visualizar',
    ]
  },
  financeiro: {
    label: 'Financeiro',
    icon: '💰',
    permissions: [
      'eventos.visualizar',
      'clientes.visualizar',
      'financeiro.visualizar',
      'financeiro.editar',
      'contratos.visualizar',
      'demandas.visualizar',
      'relatorios.visualizar',
      'relatorios.gerar',
      'relatorios.exportar',
    ]
  }
} as const;

export type PresetType = keyof typeof permissionsPresets;
