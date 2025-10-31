import { useState } from 'react';

interface UseAlocacaoQuantidadeProps {
  quantidadeRestante: number;
  quantidadeDisponivel: number;
}

export function useAlocacaoQuantidade({ 
  quantidadeRestante, 
  quantidadeDisponivel 
}: UseAlocacaoQuantidadeProps) {
  // Garantir valores válidos
  const safeQuantidadeRestante = Math.max(0, quantidadeRestante || 0);
  const safeQuantidadeDisponivel = Math.max(0, quantidadeDisponivel || 0);
  
  const [quantidadeAlocar, setQuantidadeAlocar] = useState(1);
  
  const maxAllowed = Math.min(safeQuantidadeRestante, safeQuantidadeDisponivel);
  
  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 1;
    const valor = Math.max(1, Math.min(maxAllowed, inputValue));
    setQuantidadeAlocar(valor);
  };

  const resetQuantidade = () => {
    setQuantidadeAlocar(1);
  };
  
  return { 
    quantidadeAlocar, 
    setQuantidadeAlocar, 
    handleQuantidadeChange,
    resetQuantidade,
    maxAllowed,
    isValid: maxAllowed > 0
  };
}
