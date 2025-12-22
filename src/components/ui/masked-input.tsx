import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

type MaskType = 'cpf' | 'cnpj' | 'telefone' | 'cep' | 'documento';

interface MaskedInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  mask: MaskType;
  documentType?: 'CPF' | 'CNPJ';
  value: string;
  onChange: (value: string) => void;
}

// Formatação progressiva de CPF
const formatarCPFProgressivo = (cpf: string): string => {
  const numeros = cpf.replace(/\D/g, '').slice(0, 11);
  
  if (numeros.length <= 3) return numeros;
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
};

// Formatação progressiva de CNPJ
const formatarCNPJProgressivo = (cnpj: string): string => {
  const numeros = cnpj.replace(/\D/g, '').slice(0, 14);
  
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
  if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
  return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
};

// Formatação progressiva de telefone
const formatarTelefoneProgressivo = (tel: string): string => {
  const numeros = tel.replace(/\D/g, '').slice(0, 11);
  
  if (numeros.length === 0) return '';
  if (numeros.length <= 2) return `(${numeros}`;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
};

// Formatação progressiva de CEP
const formatarCEPProgressivo = (cep: string): string => {
  const numeros = cep.replace(/\D/g, '').slice(0, 8);
  
  if (numeros.length <= 5) return numeros;
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
};

const formatters: Record<MaskType, (value: string, docType?: 'CPF' | 'CNPJ') => string> = {
  cpf: formatarCPFProgressivo,
  cnpj: formatarCNPJProgressivo,
  telefone: formatarTelefoneProgressivo,
  cep: formatarCEPProgressivo,
  documento: (v, docType) => docType === 'CNPJ' ? formatarCNPJProgressivo(v) : formatarCPFProgressivo(v),
};

const placeholders: Record<MaskType, string | ((docType?: 'CPF' | 'CNPJ') => string)> = {
  cpf: '000.000.000-00',
  cnpj: '00.000.000/0000-00',
  telefone: '(00) 00000-0000',
  cep: '00000-000',
  documento: (docType) => docType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00',
};

const maxLengths: Record<MaskType, number | ((docType?: 'CPF' | 'CNPJ') => number)> = {
  cpf: 14,
  cnpj: 18,
  telefone: 15,
  cep: 9,
  documento: (docType) => docType === 'CNPJ' ? 18 : 14,
};

const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, documentType = 'CPF', value, onChange, className, placeholder, maxLength, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatters[mask](e.target.value, documentType);
      onChange(formatted);
    }, [mask, documentType, onChange]);

    const getPlaceholder = () => {
      if (placeholder) return placeholder;
      const ph = placeholders[mask];
      return typeof ph === 'function' ? ph(documentType) : ph;
    };

    const getMaxLength = () => {
      if (maxLength) return maxLength;
      const ml = maxLengths[mask];
      return typeof ml === 'function' ? ml(documentType) : ml;
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={getPlaceholder()}
        maxLength={getMaxLength()}
        className={cn(className)}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = 'MaskedInput';

export { MaskedInput, formatarCPFProgressivo, formatarCNPJProgressivo, formatarTelefoneProgressivo, formatarCEPProgressivo };
export type { MaskedInputProps };
