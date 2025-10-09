import { z } from 'zod';

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) {
    return false;
  }

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

  return true;
}

export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14 || /^(\d)\1+$/.test(cnpjLimpo)) {
    return false;
  }

  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  const digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

export function formatarDocumento(doc: string, tipo: 'CPF' | 'CNPJ'): string {
  const docLimpo = doc.replace(/\D/g, '');
  
  if (tipo === 'CPF') {
    return docLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    return docLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}

export function formatarTelefone(tel: string): string {
  const telLimpo = tel.replace(/\D/g, '');
  
  if (telLimpo.length === 11) {
    return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telLimpo.length === 10) {
    return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return tel;
}

export function formatarCEP(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export const clienteSchema = z.object({
  nome: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome deve ter no máximo 100 caracteres'),
  tipo: z.enum(['CPF', 'CNPJ']),
  documento: z.string().refine((val) => {
    const limpo = val.replace(/\D/g, '');
    return limpo.length === 11 || limpo.length === 14;
  }, 'Documento inválido'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().optional(),
  endereco: z.object({
    cep: z.string().min(8, 'CEP inválido'),
    logradouro: z.string().min(3, 'Logradouro deve ter no mínimo 3 caracteres'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(2, 'Bairro deve ter no mínimo 2 caracteres'),
    cidade: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
    estado: z.string().length(2, 'Estado deve ter 2 letras'),
  }),
}).superRefine((data, ctx) => {
  const docLimpo = data.documento.replace(/\D/g, '');
  
  if (data.tipo === 'CPF' && !validarCPF(docLimpo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CPF inválido',
      path: ['documento'],
    });
  }
  
  if (data.tipo === 'CNPJ' && !validarCNPJ(docLimpo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'CNPJ inválido',
      path: ['documento'],
    });
  }
});
