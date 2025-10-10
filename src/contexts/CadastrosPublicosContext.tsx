import { createContext, useContext, useState, ReactNode } from 'react';
import { CadastroEventoPublico, CadastroPublico, Evento } from '@/types/eventos';
import { useToast } from '@/hooks/use-toast';

interface CadastrosPublicosContextType {
  cadastros: CadastroPublico[];
  criarCadastro: (data: CadastroEventoPublico) => Promise<string>;
  aprovarCadastro: (cadastroId: string, criarEvento: (data: any) => Promise<Evento>) => Promise<Evento>;
  recusarCadastro: (cadastroId: string, motivo: string) => Promise<void>;
  buscarCadastroPorProtocolo: (protocolo: string) => CadastroPublico | undefined;
  atualizarStatus: (cadastroId: string, status: CadastroPublico['status']) => void;
}

const CadastrosPublicosContext = createContext<CadastrosPublicosContextType | undefined>(undefined);

export function CadastrosPublicosProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [cadastros, setCadastros] = useState<CadastroPublico[]>([]);

  const gerarProtocolo = (): string => {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const numero = String(cadastros.length + 1).padStart(3, '0');
    return `CAD-${ano}${mes}${dia}-${numero}`;
  };

  const criarCadastro = async (data: CadastroEventoPublico): Promise<string> => {
    const protocolo = gerarProtocolo();
    const novoCadastro: CadastroPublico = {
      ...data,
      id: `cadastro-${Date.now()}`,
      protocolo,
      status: 'pendente',
      dataCriacao: new Date().toISOString(),
    };

    setCadastros([...cadastros, novoCadastro]);
    
    toast({
      title: 'Cadastro enviado!',
      description: `Seu protocolo: ${protocolo}. Use-o para acompanhar o status.`,
    });

    return protocolo;
  };

  const aprovarCadastro = async (
    cadastroId: string,
    criarEvento: (data: any) => Promise<Evento>
  ): Promise<Evento> => {
    const cadastro = cadastros.find(c => c.id === cadastroId);
    if (!cadastro) {
      throw new Error('Cadastro não encontrado');
    }

    // Criar evento a partir do cadastro
    const evento = await criarEvento({
      nome: cadastro.nome,
      dataInicio: cadastro.dataInicio,
      dataFim: cadastro.dataFim,
      horaInicio: cadastro.horaInicio,
      horaFim: cadastro.horaFim,
      local: cadastro.local,
      cidade: cadastro.cidade,
      estado: cadastro.estado,
      endereco: cadastro.endereco,
      tipoEvento: cadastro.tipoEvento,
      configuracaoIngresso: cadastro.configuracaoIngresso,
      configuracaoBar: cadastro.configuracaoBar,
      // Cliente será criado a partir dos dados do produtor
      clienteNome: cadastro.produtor.nome,
      clienteDocumento: cadastro.produtor.documento,
      clienteTelefone: cadastro.produtor.telefone,
      clienteWhatsapp: cadastro.produtor.whatsapp,
      clienteEmail: cadastro.produtor.email,
    });

    // Atualizar status do cadastro
    setCadastros(cadastros.map(c =>
      c.id === cadastroId
        ? { ...c, status: 'aprovado', eventoId: evento.id }
        : c
    ));

    toast({
      title: 'Cadastro aprovado!',
      description: `Evento "${evento.nome}" criado com sucesso.`,
    });

    return evento;
  };

  const recusarCadastro = async (cadastroId: string, motivo: string) => {
    setCadastros(cadastros.map(c =>
      c.id === cadastroId
        ? { ...c, status: 'recusado', observacoesInternas: motivo }
        : c
    ));

    toast({
      title: 'Cadastro recusado',
      description: 'O produtor será notificado sobre a recusa.',
    });
  };

  const buscarCadastroPorProtocolo = (protocolo: string): CadastroPublico | undefined => {
    return cadastros.find(c => c.protocolo === protocolo);
  };

  const atualizarStatus = (cadastroId: string, status: CadastroPublico['status']) => {
    setCadastros(cadastros.map(c =>
      c.id === cadastroId ? { ...c, status } : c
    ));
  };

  return (
    <CadastrosPublicosContext.Provider
      value={{
        cadastros,
        criarCadastro,
        aprovarCadastro,
        recusarCadastro,
        buscarCadastroPorProtocolo,
        atualizarStatus,
      }}
    >
      {children}
    </CadastrosPublicosContext.Provider>
  );
}

export function useCadastrosPublicos() {
  const context = useContext(CadastrosPublicosContext);
  if (!context) {
    throw new Error('useCadastrosPublicos must be used within CadastrosPublicosProvider');
  }
  return context;
}
