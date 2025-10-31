import { useConfiguracoes } from '@/hooks/configuracoes/useConfiguracoes';

export function useEnderecoEmpresa() {
  const { configuracoes } = useConfiguracoes();
  
  const endereco = configuracoes?.empresa?.endereco;
  
  if (!endereco || typeof endereco !== 'object') {
    return {
      endereco: '',
      enderecoFormatado: 'Endereço não configurado',
    };
  }
  
  const enderecoObj = endereco as any;
  const enderecoFormatado = `${enderecoObj.logradouro || ''}, ${enderecoObj.numero || ''} - ${enderecoObj.bairro || ''}, ${enderecoObj.cidade || ''}/${enderecoObj.estado || ''} - CEP ${enderecoObj.cep || ''}`.trim();
  
  return {
    endereco: enderecoObj,
    enderecoFormatado,
  };
}
