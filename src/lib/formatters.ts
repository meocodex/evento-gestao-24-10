// Re-exportar funções existentes
export { formatarDocumento, formatarTelefone, formatarCEP, validarCPF, validarCNPJ } from './validations/cliente';

/**
 * Formata CPF com máscara
 * @param cpf - String com números do CPF
 * @returns CPF formatado (000.000.000-00)
 */
export const formatarCPF = (cpf: string): string => {
  const numeros = cpf.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})/, '$1-$2');
};

/**
 * Formata CNPJ com máscara
 * @param cnpj - String com números do CNPJ
 * @returns CNPJ formatado (00.000.000/0000-00)
 */
export const formatarCNPJ = (cnpj: string): string => {
  const numeros = cnpj.replace(/\D/g, '').slice(0, 14);
  return numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};
