/**
 * Helpers temporários para facilitar migração
 * TODO: Remover após migração completa
 */
import { useClientesQueries, useClientesMutations } from './index';
import { buscarCEP, EnderecoViaCEP } from '@/lib/api/viacep';
import { validarCPF, validarCNPJ } from '@/lib/validations/cliente';
import { Cliente } from '@/types/eventos';

export function useClientes() {
  const [page] = React.useState(1);
  const [searchTerm] = React.useState('');
  const { clientes = [], totalCount = 0, loading } = useClientesQueries(page, 20, searchTerm);
  const mutations = useClientesMutations();

  return {
    clientes,
    clientesFiltrados: clientes,
    totalCount,
    loading,
    page: 1,
    pageSize: 20,
    setPage: () => {},
    criarCliente: mutations.criarCliente.mutateAsync,
    editarCliente: async (id: string, data: any) => mutations.editarCliente.mutateAsync({ id, data }),
    excluirCliente: mutations.excluirCliente.mutateAsync,
    buscarClientePorId: (id: string) => clientes.find((c: Cliente) => c.id === id),
    aplicarFiltros: () => {},
    validarDocumento: (doc: string, tipo: 'CPF' | 'CNPJ') => tipo === 'CPF' ? validarCPF(doc) : validarCNPJ(doc),
    buscarEnderecoPorCEP: (cep: string) => buscarCEP(cep),
    limparFiltros: () => {},
  };
}

import * as React from 'react';
