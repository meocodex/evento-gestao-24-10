/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import * as React from 'react';
import { useClientesQueries, useClientesMutations } from './index';
import { buscarCEP, EnderecoViaCEP } from '@/lib/api/viacep';
import { validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { Cliente } from '@/types/eventos';

export function useClientes() {
  const [page] = React.useState(1);
  const [searchTerm] = React.useState('');
  const [filtros, setFiltros] = React.useState<any>({});
  const { clientes = [], totalCount = 0, loading } = useClientesQueries(page, 20, searchTerm);
  const mutations = useClientesMutations();

  const excluirClienteFn = React.useCallback(async (id: string) => {
    return await mutations.excluirCliente.mutateAsync(id);
  }, [mutations.excluirCliente]);

  return {
    clientes,
    clientesFiltrados: clientes,
    totalCount,
    loading,
    page: 1,
    pageSize: 20,
    setPage: () => {},
    filtros,
    setFiltros,
    criarCliente: mutations.criarCliente.mutateAsync,
    editarCliente: async (id: string, data: any) => mutations.editarCliente.mutateAsync({ id, data }),
    excluirCliente: excluirClienteFn,
    buscarClientePorId: (id: string) => clientes.find((c: Cliente) => c.id === id),
    aplicarFiltros: (novosFiltros: any) => setFiltros(novosFiltros),
    validarDocumento: (doc: string, tipo: 'CPF' | 'CNPJ') => tipo === 'CPF' ? validarCPF(doc) : validarCNPJ(doc),
    buscarEnderecoPorCEP: (cep: string) => buscarCEP(cep),
    limparFiltros: () => setFiltros({}),
  };
}
