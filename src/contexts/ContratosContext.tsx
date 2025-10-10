import { createContext, useContext, useState, ReactNode } from 'react';
import { ContratoTemplate, Contrato } from '@/types/contratos';
import { templatesMock, contratosMock } from '@/lib/mock-data/contratos';
import { toast } from '@/hooks/use-toast';

interface ContratosContextData {
  templates: ContratoTemplate[];
  contratos: Contrato[];
  loading: boolean;
  criarTemplate: (data: Omit<ContratoTemplate, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarTemplate: (id: string, data: Partial<ContratoTemplate>) => void;
  excluirTemplate: (id: string) => void;
  criarContrato: (data: Omit<Contrato, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarContrato: (id: string, data: Partial<Contrato>) => void;
  excluirContrato: (id: string) => void;
  assinarContrato: (contratoId: string, parte: string) => void;
  gerarPDF: (contratoId: string) => void;
}

const ContratosContext = createContext<ContratosContextData>({} as ContratosContextData);

export function ContratosProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<ContratoTemplate[]>(templatesMock);
  const [contratos, setContratos] = useState<Contrato[]>(contratosMock);
  const [loading] = useState(false);

  const criarTemplate = (data: Omit<ContratoTemplate, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const novoTemplate: ContratoTemplate = {
      ...data,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setTemplates([...templates, novoTemplate]);
    toast({
      title: 'Template criado',
      description: 'Template de contrato criado com sucesso.',
    });
  };

  const editarTemplate = (id: string, data: Partial<ContratoTemplate>) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, ...data, atualizadoEm: new Date().toISOString() } : t
      )
    );
    toast({
      title: 'Template atualizado',
      description: 'Template atualizado com sucesso.',
    });
  };

  const excluirTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    toast({
      title: 'Template excluído',
      description: 'Template removido do sistema.',
    });
  };

  const criarContrato = (data: Omit<Contrato, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const novoContrato: Contrato = {
      ...data,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setContratos([...contratos, novoContrato]);
    toast({
      title: 'Contrato criado',
      description: 'Contrato criado com sucesso.',
    });
  };

  const editarContrato = (id: string, data: Partial<Contrato>) => {
    setContratos(
      contratos.map((c) =>
        c.id === id ? { ...c, ...data, atualizadoEm: new Date().toISOString() } : c
      )
    );
    toast({
      title: 'Contrato atualizado',
      description: 'Contrato atualizado com sucesso.',
    });
  };

  const excluirContrato = (id: string) => {
    setContratos(contratos.filter((c) => c.id !== id));
    toast({
      title: 'Contrato excluído',
      description: 'Contrato removido do sistema.',
    });
  };

  const assinarContrato = (contratoId: string, parte: string) => {
    setContratos(
      contratos.map((c) => {
        if (c.id !== contratoId) return c;
        
        const assinaturasAtualizadas = c.assinaturas.map((a) =>
          a.parte === parte
            ? { ...a, assinado: true, dataAssinatura: new Date().toISOString() }
            : a
        );

        const todasAssinadas = assinaturasAtualizadas.every((a) => a.assinado);
        
        return {
          ...c,
          assinaturas: assinaturasAtualizadas,
          status: todasAssinadas ? 'assinado' : c.status,
          atualizadoEm: new Date().toISOString(),
        };
      })
    );
    toast({
      title: 'Contrato assinado',
      description: 'Assinatura registrada com sucesso.',
    });
  };

  const gerarPDF = (contratoId: string) => {
    const contrato = contratos.find((c) => c.id === contratoId);
    if (!contrato) return;

    toast({
      title: 'PDF gerado',
      description: `PDF do contrato ${contrato.numero} gerado com sucesso.`,
    });
  };

  return (
    <ContratosContext.Provider
      value={{
        templates,
        contratos,
        loading,
        criarTemplate,
        editarTemplate,
        excluirTemplate,
        criarContrato,
        editarContrato,
        excluirContrato,
        assinarContrato,
        gerarPDF,
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
