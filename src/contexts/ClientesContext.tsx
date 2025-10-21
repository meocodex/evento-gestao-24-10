import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Cliente, ClienteFormData } from '@/types/eventos';
import { buscarCEP, EnderecoViaCEP } from '@/lib/api/viacep';
import { validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { toast } from '@/hooks/use-toast';
import { useClientesQueries } from './clientes/useClientesQueries';
import { useClientesMutations } from './clientes/useClientesMutations';

interface FiltrosClientes {
  busca: string;
  tipo: 'CPF' | 'CNPJ' | 'todos';
  estado: string;
  cidade: string;
  status: 'ativo' | 'inativo' | 'todos';
}

interface ClientesContextData {
  clientes: Cliente[];
  totalCount: number;
  clientesFiltrados: Cliente[];
  loading: boolean;
  filtros: FiltrosClientes;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
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
  const [filtros, setFiltros] = useState<FiltrosClientes>({
    busca: '',
    tipo: 'todos',
    estado: '',
    cidade: '',
    status: 'todos',
  });
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { clientes, totalCount, loading } = useClientesQueries(page, pageSize);
  const { criarCliente: criarClienteMutation, editarCliente: editarClienteMutation, excluirCliente: excluirClienteMutation } = useClientesMutations();

  const criarCliente = useCallback(async (data: ClienteFormData): Promise<Cliente> => {
    return await criarClienteMutation.mutateAsync(data);
  }, [criarClienteMutation]);

  const editarCliente = useCallback(async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
    await editarClienteMutation.mutateAsync({ id, data });
  }, [editarClienteMutation]);

  const excluirCliente = useCallback(async (id: string): Promise<void> => {
    await excluirClienteMutation.mutateAsync(id);
  }, [excluirClienteMutation]);

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

  // Filtrar clientes (memoizado)
  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
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
  }, [clientes, filtros]);

  return (
    <ClientesContext.Provider
      value={{
        clientes,
        totalCount,
        clientesFiltrados,
        loading,
        filtros,
        page,
        pageSize,
        setPage,
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
