import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Cliente, ClienteFormData } from '@/types/eventos';
import { mockClientes } from '@/lib/mock-data/clientes';
import { buscarCEP, EnderecoViaCEP } from '@/lib/api/viacep';
import { validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { toast } from '@/hooks/use-toast';

interface FiltrosClientes {
  busca: string;
  tipo: 'CPF' | 'CNPJ' | 'todos';
  estado: string;
  cidade: string;
  status: 'ativo' | 'inativo' | 'todos';
}

interface ClientesContextData {
  clientes: Cliente[];
  clientesFiltrados: Cliente[];
  loading: boolean;
  filtros: FiltrosClientes;
  criarCliente: (data: ClienteFormData) => Promise<Cliente>;
  editarCliente: (id: string, data: Partial<ClienteFormData>) => Promise<void>;
  excluirCliente: (id: string) => Promise<void>;
  buscarClientePorId: (id: string) => Cliente | undefined;
  aplicarFiltros: (filtros: Partial<FiltrosClientes>) => void;
  validarDocumento: (documento: string, tipo: 'CPF' | 'CNPJ') => boolean;
  buscarEnderecoPorCEP: (cep: string) => Promise<EnderecoViaCEP>;
  limparFiltros: () => void;
}

const ClientesContext = createContext<ClientesContextData>({} as ClientesContextData);

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosClientes>({
    busca: '',
    tipo: 'todos',
    estado: '',
    cidade: '',
    status: 'todos',
  });

  const criarCliente = useCallback(async (data: ClienteFormData): Promise<Cliente> => {
    setLoading(true);
    try {
      // Validar documento duplicado
      const documentoExiste = clientes.some(
        (c) => c.documento.replace(/\D/g, '') === data.documento.replace(/\D/g, '')
      );

      if (documentoExiste) {
        throw new Error('Documento já cadastrado');
      }

      const novoCliente: Cliente = {
        id: Date.now().toString(),
        nome: data.nome,
        tipo: data.tipo,
        documento: data.documento,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        email: data.email,
        endereco: data.endereco,
      };

      setClientes((prev) => [...prev, novoCliente]);
      
      toast({
        title: 'Cliente criado com sucesso!',
        description: `${novoCliente.nome} foi adicionado ao sistema.`,
      });

      return novoCliente;
    } catch (error) {
      toast({
        title: 'Erro ao criar cliente',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientes]);

  const editarCliente = useCallback(async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
    setLoading(true);
    try {
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === id
            ? {
                ...cliente,
                ...data,
                endereco: data.endereco ? { ...cliente.endereco, ...data.endereco } : cliente.endereco,
              }
            : cliente
        )
      );

      toast({
        title: 'Cliente atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao editar cliente',
        description: 'Tente novamente',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluirCliente = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const cliente = clientes.find((c) => c.id === id);
      
      setClientes((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: 'Cliente excluído',
        description: `${cliente?.nome} foi removido do sistema.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir cliente',
        description: 'Tente novamente',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [clientes]);

  const buscarClientePorId = useCallback(
    (id: string): Cliente | undefined => {
      return clientes.find((c) => c.id === id);
    },
    [clientes]
  );

  const aplicarFiltros = useCallback((novosFiltros: Partial<FiltrosClientes>) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFiltros({
      busca: '',
      tipo: 'todos',
      estado: '',
      cidade: '',
      status: 'todos',
    });
  }, []);

  const validarDocumento = useCallback((documento: string, tipo: 'CPF' | 'CNPJ'): boolean => {
    const docLimpo = documento.replace(/\D/g, '');
    return tipo === 'CPF' ? validarCPF(docLimpo) : validarCNPJ(docLimpo);
  }, []);

  const buscarEnderecoPorCEP = useCallback(async (cep: string): Promise<EnderecoViaCEP> => {
    try {
      return await buscarCEP(cep);
    } catch (error) {
      toast({
        title: 'Erro ao buscar CEP',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
      throw error;
    }
  }, []);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    // Filtro de busca
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      const matchNome = cliente.nome.toLowerCase().includes(busca);
      const matchDocumento = cliente.documento.replace(/\D/g, '').includes(busca.replace(/\D/g, ''));
      const matchEmail = cliente.email?.toLowerCase().includes(busca);
      const matchTelefone = cliente.telefone.replace(/\D/g, '').includes(busca.replace(/\D/g, ''));
      
      if (!matchNome && !matchDocumento && !matchEmail && !matchTelefone) {
        return false;
      }
    }

    // Filtro de tipo
    if (filtros.tipo !== 'todos' && cliente.tipo !== filtros.tipo) {
      return false;
    }

    // Filtro de estado
    if (filtros.estado && cliente.endereco.estado !== filtros.estado) {
      return false;
    }

    // Filtro de cidade
    if (filtros.cidade && cliente.endereco.cidade !== filtros.cidade) {
      return false;
    }

    return true;
  });

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        clientesFiltrados,
        loading,
        filtros,
        criarCliente,
        editarCliente,
        excluirCliente,
        buscarClientePorId,
        aplicarFiltros,
        validarDocumento,
        buscarEnderecoPorCEP,
        limparFiltros,
      }}
    >
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes must be used within ClientesProvider');
  }
  return context;
}
