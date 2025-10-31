import { useState } from 'react';

interface UseAlocacaoQuantidadeProps {
  quantidadeRestante: number;
  quantidadeDisponivel: number;
}

export function useAlocacaoQuantidade({ 
  quantidadeRestante, 
  quantidadeDisponivel 
}: UseAlocacaoQuantidadeProps) {
  const [quantidadeAlocar, setQuantidadeAlocar] = useState(1);
  
  const maxAllowed = Math.min(quantidadeRestante, quantidadeDisponivel);
  
  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = Math.max(1, Math.min(maxAllowed, parseInt(e.target.value) || 1));
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
    maxAllowed
  };
}
