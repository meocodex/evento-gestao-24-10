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
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState<FiltrosClientes>({
    busca: '',
    tipo: 'todos',
    estado: '',
    cidade: '',
    status: 'todos',
  });

  // Query para buscar clientes
  const { data: clientes = [], isLoading: loading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        nome: c.nome,
        tipo: c.tipo as 'CPF' | 'CNPJ',
        documento: c.documento,
        telefone: c.telefone,
        whatsapp: c.whatsapp || undefined,
        email: c.email,
        endereco: c.endereco as Cliente['endereco'],
      }));
    },
  });

  // Mutation para criar cliente
  const criarClienteMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      // Validar documento duplicado
      const documentoLimpo = data.documento.replace(/\D/g, '');
      const { data: existente } = await supabase
        .from('clientes')
        .select('id')
        .ilike('documento', `%${documentoLimpo}%`)
        .maybeSingle();

      if (existente) {
        throw new Error('Documento já cadastrado');
      }

      const { data: novoCliente, error } = await supabase
        .from('clientes')
        .insert({
          nome: data.nome,
          tipo: data.tipo,
          documento: data.documento,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          endereco: data.endereco,
        })
        .select()
        .single();

      if (error) throw error;
      return novoCliente;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente criado com sucesso!',
        description: `${data.nome} foi adicionado ao sistema.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    },
  });

  const criarCliente = useCallback(async (data: ClienteFormData): Promise<Cliente> => {
    const result = await criarClienteMutation.mutateAsync(data);
    return {
      id: result.id,
      nome: result.nome,
      tipo: result.tipo as 'CPF' | 'CNPJ',
      documento: result.documento,
      telefone: result.telefone,
      whatsapp: result.whatsapp || undefined,
      email: result.email,
      endereco: result.endereco as Cliente['endereco'],
    };
  }, [criarClienteMutation]);

  // Mutation para editar cliente
  const editarClienteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClienteFormData> }) => {
      const cliente = clientes.find(c => c.id === id);
      if (!cliente) throw new Error('Cliente não encontrado');

      const { error } = await supabase
        .from('clientes')
        .update({
          ...data,
          endereco: data.endereco ? { ...cliente.endereco, ...data.endereco } : undefined,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao editar cliente',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    },
  });

  const editarCliente = useCallback(async (id: string, data: Partial<ClienteFormData>): Promise<void> => {
    await editarClienteMutation.mutateAsync({ id, data });
  }, [editarClienteMutation]);

  // Mutation para excluir cliente
  const excluirClienteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      const cliente = clientes.find((c) => c.id === id);
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente excluído',
        description: `${cliente?.nome} foi removido do sistema.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao excluir cliente',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    },
  });

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
