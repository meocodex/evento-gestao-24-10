import { useConfiguracoesEmpresaQueries } from '@/contexts/configuracoes/useConfiguracoesEmpresaQueries';
import { EnderecoEmpresa } from '@/types/eventos';

export function useEnderecoEmpresa() {
  const { configuracoes } = useConfiguracoesEmpresaQueries();
  
  const endereco = configuracoes?.endereco;
  
  if (!endereco || typeof endereco !== 'object') {
    return {
      endereco: '',
      enderecoFormatado: 'Endereço não configurado',
    };
  }
  
  const enderecoObj = endereco as EnderecoEmpresa;
  const enderecoFormatado = `${enderecoObj.logradouro || ''}, ${enderecoObj.numero || ''} - ${enderecoObj.bairro || ''}, ${enderecoObj.cidade || ''}/${enderecoObj.estado || ''} - CEP ${enderecoObj.cep || ''}`.trim();
  
  return {
    endereco: enderecoObj,
    enderecoFormatado,
  };
}
