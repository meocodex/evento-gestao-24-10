import { createContext, useContext, useState, ReactNode } from 'react';
import { ContratoTemplate, Contrato } from '@/types/contratos';
import { toast } from '@/hooks/use-toast';
import { gerarPDFComTimbrado } from '@/utils/pdfGenerator';
import { useContratosQueries, FiltrosContrato, FiltrosTemplate } from './contratos/useContratosQueries';
import { useContratosMutations } from './contratos/useContratosMutations';
import { useTemplatesMutations } from './contratos/useTemplatesMutations';
import { useContratosWorkflow } from './contratos/useContratosWorkflow';

interface ContratosContextData {
  templates: ContratoTemplate[];
  contratos: Contrato[];
  loading: boolean;
  totalContratos: number;
  totalTemplates: number;
  pageContratos: number;
  pageTemplates: number;
  pageSizeContratos: number;
  pageSizeTemplates: number;
  filtrosContratos: FiltrosContrato;
  filtrosTemplates: FiltrosTemplate;
  setPageContratos: (page: number) => void;
  setPageTemplates: (page: number) => void;
  setFiltrosContratos: (filtros: FiltrosContrato) => void;
  setFiltrosTemplates: (filtros: FiltrosTemplate) => void;
  criarTemplate: (data: Omit<ContratoTemplate, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarTemplate: (id: string, data: Partial<ContratoTemplate>) => void;
  excluirTemplate: (id: string) => void;
  criarContrato: (data: Omit<Contrato, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarContrato: (id: string, data: Partial<Contrato>) => void;
  excluirContrato: (id: string) => void;
  assinarContrato: (contratoId: string, parte: string) => void;
  gerarPDF: (contratoId: string) => void;
  aprovarProposta: (contratoId: string, observacoes?: string) => void;
  converterPropostaEmContrato: (contratoId: string, opcao: 'vincular' | 'criar', eventoId?: string, dadosEvento?: any, adicionarReceitas?: boolean) => Promise<void>;
}

const ContratosContext = createContext<ContratosContextData>({} as ContratosContextData);

export function ContratosProvider({ children }: { children: ReactNode }) {
  const [pageContratos, setPageContratos] = useState(1);
  const [pageTemplates, setPageTemplates] = useState(1);
  const [pageSizeContratos] = useState(50);
  const [pageSizeTemplates] = useState(50);
  const [filtrosContratos, setFiltrosContratos] = useState<FiltrosContrato>({});
  const [filtrosTemplates, setFiltrosTemplates] = useState<FiltrosTemplate>({});

  const {
    templates,
    contratos,
    loading,
    totalContratos,
    totalTemplates,
  } = useContratosQueries(
    pageContratos,
    pageSizeContratos,
    filtrosContratos,
    pageTemplates,
    pageSizeTemplates,
    filtrosTemplates
  );

  const contratosMutations = useContratosMutations();
  const templatesMutations = useTemplatesMutations();
  const workflow = useContratosWorkflow();

  // Wrappers para manter a mesma interface
  const criarTemplate = (data: Omit<ContratoTemplate, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    templatesMutations.criarTemplate.mutate(data);
  };

  const editarTemplate = (id: string, data: Partial<ContratoTemplate>) => {
    templatesMutations.editarTemplate.mutate({ id, data });
  };

  const excluirTemplate = (id: string) => {
    templatesMutations.excluirTemplate.mutate(id);
  };

  const criarContrato = (data: Omit<Contrato, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    contratosMutations.criarContrato.mutate(data);
  };

  const editarContrato = (id: string, data: Partial<Contrato>) => {
    contratosMutations.editarContrato.mutate({ id, data });
  };

  const excluirContrato = (id: string) => {
    contratosMutations.excluirContrato.mutate(id);
  };

  const assinarContrato = (contratoId: string, parte: string) => {
    workflow.assinarContrato.mutate({ contratoId, parte });
  };

  const aprovarProposta = (contratoId: string, observacoes?: string) => {
    workflow.aprovarProposta.mutate({ contratoId, observacoes });
  };

  const gerarPDF = async (contratoId: string) => {
    const contrato = contratos.find((c) => c.id === contratoId);
    if (!contrato) return;

    try {
      const template = templates.find(t => t.id === contrato.templateId);
      await gerarPDFComTimbrado(contrato, {
        papelTimbrado: template?.papelTimbrado,
        margens: template?.margens,
      });

      toast({
        title: 'PDF gerado',
        description: `PDF do ${contrato.status === 'proposta' ? 'proposta' : 'contrato'} ${contrato.numero} baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Não foi possível gerar o arquivo PDF.',
        variant: 'destructive',
      });
    }
  };

  const converterPropostaEmContrato = async (
    contratoId: string,
    opcao: 'vincular' | 'criar',
    eventoId?: string,
    dadosEvento?: any,
    adicionarReceitas: boolean = true
  ) => {
    // Se criar novo evento, seria necessário integrar com EventosContext
    // Por enquanto, apenas vincular a evento existente
    if (opcao === 'vincular' && eventoId) {
      workflow.converterPropostaEmContrato.mutate({ contratoId, eventoId });
    } else {
      toast({
        title: 'Atenção',
        description: 'A criação de novo evento a partir de proposta requer integração adicional.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ContratosContext.Provider
      value={{
        templates,
        contratos,
        loading,
        totalContratos,
        totalTemplates,
        pageContratos,
        pageTemplates,
        pageSizeContratos,
        pageSizeTemplates,
        filtrosContratos,
        filtrosTemplates,
        setPageContratos,
        setPageTemplates,
        setFiltrosContratos,
        setFiltrosTemplates,
        criarTemplate,
        editarTemplate,
        excluirTemplate,
        criarContrato,
        editarContrato,
        excluirContrato,
        assinarContrato,
        gerarPDF,
        aprovarProposta,
        converterPropostaEmContrato,
      }}
    >
      {children}
    </ContratosContext.Provider>
  );
}

export function useContratos() {
  const context = useContext(ContratosContext);
  if (!context) {
    throw new Error('useContratos must be used within ContratosProvider');
  }
  return context;
}
