import { Cliente, ResponsavelLegal, DadosBancarios } from '@/types/eventos';
import { Json } from '@/integrations/supabase/types';

interface RawClienteFromDB {
  id: string;
  nome: string;
  tipo: 'CPF' | 'CNPJ';
  documento: string;
  telefone: string;
  email: string;
  whatsapp?: string | null;
  endereco?: Json | null;
  responsavel_legal?: Json | null;
  dados_bancarios?: Json | null;
  created_at: string | null;
  updated_at: string | null;
  created_by?: string | null;
  search_vector?: unknown;
}

const defaultEndereco = {
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
};

export function transformCliente(data: RawClienteFromDB): Cliente {
  const endereco = data.endereco as Record<string, string> | null;
  
  return {
    id: data.id,
    nome: data.nome,
    tipo: data.tipo,
    documento: data.documento,
    telefone: data.telefone,
    email: data.email,
    whatsapp: data.whatsapp || '',
    endereco: endereco ? {
      cep: endereco.cep || '',
      logradouro: endereco.logradouro || '',
      numero: endereco.numero || '',
      complemento: endereco.complemento,
      bairro: endereco.bairro || '',
      cidade: endereco.cidade || '',
      estado: endereco.estado || '',
    } : defaultEndereco,
    responsavelLegal: data.responsavel_legal as unknown as ResponsavelLegal | undefined,
    dadosBancarios: data.dados_bancarios as unknown as DadosBancarios | undefined,
  };
}
