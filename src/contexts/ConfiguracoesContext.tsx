import { createContext, useContext, ReactNode } from 'react';
import { ConfiguracoesNotificacao, TipoNotificacao, NotificacaoDestinatario, NotificacaoDados } from '@/types/notificacoes';
import { useToast } from '@/hooks/use-toast';
import { useConfiguracoesQueries } from './configuracoes/useConfiguracoesQueries';
import { useConfiguracoesMutations } from './configuracoes/useConfiguracoesMutations';

interface ConfiguracoesGlobais {
  notificacoes: ConfiguracoesNotificacao;
  empresa: {
    nome: string;
    cnpj: string;
    telefone: string;
    email: string;
    endereco: string;
    logo?: string;
  };
  sistema: {
    theme: 'light' | 'dark' | 'auto';
    idioma: 'pt-BR';
  };
}

interface ConfiguracoesContextType {
  configuracoes: ConfiguracoesGlobais;
  atualizarConfiguracoes: (config: Partial<ConfiguracoesGlobais>) => Promise<void>;
  testarWhatsApp: (numero: string, mensagem: string) => Promise<boolean>;
  testarEmail: (destinatario: string, assunto: string, corpo: string) => Promise<boolean>;
  enviarNotificacao: (tipo: TipoNotificacao, destinatario: NotificacaoDestinatario, dados: NotificacaoDados) => Promise<void>;
}

const ConfiguracoesContext = createContext<ConfiguracoesContextType | undefined>(undefined);

const configuracoesPadrao: ConfiguracoesGlobais = {
  notificacoes: {
    whatsapp: {
      enabled: false,
      mensagens: {
        envio_mercadoria: 'Olá {{produtor}}, os materiais do evento {{evento}} foram enviados via {{transportadora}}. Rastreamento: {{rastreamento}}',
        solicitacao_devolucao: 'Olá {{produtor}}, por favor devolver os materiais do evento {{evento}} até {{data_limite}}.',
        envio_proposta: 'Olá {{cliente}}, segue proposta comercial para {{evento}}. Link: {{link_proposta}}',
      },
    },
    email: {
      enabled: false,
      smtp: {},
      templates: {
        envio_mercadoria: 'Materiais enviados para o evento {{evento}}',
        solicitacao_devolucao: 'Solicitação de devolução de materiais',
        envio_proposta: 'Proposta comercial - {{evento}}',
      },
    },
  },
  empresa: {
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
  },
  sistema: {
    theme: 'auto',
    idioma: 'pt-BR',
  },
};

export function ConfiguracoesProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { configuracoes: dbConfig } = useConfiguracoesQueries();
  const { atualizarNotificacoes, atualizarEmpresa, atualizarSistema } = useConfiguracoesMutations();

  // Merge database config with defaults - use type guard for safe casting
  const configuracoes: ConfiguracoesGlobais = {
    notificacoes: dbConfig?.notificacoes 
      ? (dbConfig.notificacoes as unknown as ConfiguracoesNotificacao)
      : configuracoesPadrao.notificacoes,
    empresa: dbConfig?.empresa
      ? (dbConfig.empresa as unknown as ConfiguracoesGlobais['empresa'])
      : configuracoesPadrao.empresa,
    sistema: dbConfig?.sistema
      ? (dbConfig.sistema as unknown as ConfiguracoesGlobais['sistema'])
      : configuracoesPadrao.sistema,
  };

  const atualizarConfiguracoes = async (config: Partial<ConfiguracoesGlobais>) => {
    try {
      if (config.notificacoes) {
        await atualizarNotificacoes.mutateAsync(config.notificacoes);
      }
      if (config.empresa) {
        await atualizarEmpresa.mutateAsync(config.empresa);
      }
      if (config.sistema) {
        await atualizarSistema.mutateAsync(config.sistema);
      }
      toast({
        title: 'Configurações salvas!',
        description: 'As alterações foram aplicadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  const testarWhatsApp = async (numero: string, mensagem: string): Promise<boolean> => {
    try {
      // Simular envio de WhatsApp
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Teste enviado!',
        description: `Mensagem de teste enviada para ${numero}`,
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível enviar a mensagem de teste.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const testarEmail = async (destinatario: string, assunto: string, corpo: string): Promise<boolean> => {
    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'E-mail de teste enviado!',
        description: `Mensagem enviada para ${destinatario}`,
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível enviar o e-mail de teste.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const enviarNotificacao = async (
    tipo: TipoNotificacao,
    destinatario: NotificacaoDestinatario,
    dados: NotificacaoDados
  ) => {
    const { whatsapp, email } = configuracoes.notificacoes;

    // Substituir variáveis no template
    const substituirVariaveis = (template: string) => {
      let mensagem = template;
      Object.entries(dados).forEach(([key, value]) => {
        mensagem = mensagem.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      return mensagem;
    };

    try {
      if (whatsapp.enabled && destinatario.whatsapp) {
        const template = whatsapp.mensagens[tipo as keyof typeof whatsapp.mensagens];
        if (template) {
          const mensagem = substituirVariaveis(template);
          console.log('Enviando WhatsApp:', { destinatario: destinatario.whatsapp, mensagem });
        }
      }

      if (email.enabled && destinatario.email) {
        const template = email.templates[tipo as keyof typeof email.templates];
        if (template) {
          const assunto = substituirVariaveis(template);
          console.log('Enviando Email:', { destinatario: destinatario.email, assunto });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  return (
    <ConfiguracoesContext.Provider
      value={{
        configuracoes,
        atualizarConfiguracoes,
        testarWhatsApp,
        testarEmail,
        enviarNotificacao,
      }}
    >
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoes() {
  const context = useContext(ConfiguracoesContext);
  if (!context) {
    throw new Error('useConfiguracoes must be used within ConfiguracoesProvider');
  }
  return context;
}
