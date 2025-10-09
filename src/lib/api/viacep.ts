export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function buscarCEP(cep: string): Promise<EnderecoViaCEP> {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar CEP');
  }

  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado');
  }

  return data;
}
