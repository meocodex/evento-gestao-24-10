export type TipoNotificacao = 
  | 'envio_mercadoria'
  | 'solicitacao_devolucao'
  | 'envio_proposta'
  | 'status_evento'
  | 'reembolso_aprovado'
  | 'material_alocado';

export interface TemplatesMensagens {
  envio_mercadoria: string;
  solicitacao_devolucao: string;
  envio_proposta: string;
}

export interface ConfiguracaoWhatsApp {
  enabled: boolean;
  apiKey?: string;
  phoneNumber?: string;
  mensagens: TemplatesMensagens;
}

export interface ConfiguracaoEmail {
  enabled: boolean;
  smtp: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
  };
  remetente?: string;
  templates: TemplatesMensagens;
}

export interface ConfiguracoesNotificacao {
  whatsapp: ConfiguracaoWhatsApp;
  email: ConfiguracaoEmail;
}

export interface NotificacaoDestinatario {
  whatsapp?: string;
  email?: string;
}

export interface NotificacaoDados {
  [key: string]: string;
}
