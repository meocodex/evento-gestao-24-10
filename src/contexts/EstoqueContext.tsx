import React, { createContext, useContext, useState, ReactNode } from 'react';
import { materiaisEstoque as mockMateriais } from '@/lib/mock-data/estoque';
import { MaterialEstoque, SerialEstoque } from '@/lib/mock-data/estoque';
import { toast } from '@/hooks/use-toast';

interface FiltrosEstoque {
  busca: string;
  categoria: string;
  status: 'todos' | 'disponivel' | 'em-uso' | 'manutencao';
  localizacao: string;
}

interface EstoqueContextData {
  materiais: MaterialEstoque[];
  loading: boolean;
  filtros: FiltrosEstoque;
  setFiltros: (filtros: FiltrosEstoque) => void;
  adicionarMaterial: (material: Omit<MaterialEstoque, 'id' | 'seriais'>) => Promise<MaterialEstoque>;
  editarMaterial: (id: string, dados: Partial<MaterialEstoque>) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  adicionarSerial: (materialId: string, serial: Omit<SerialEstoque, 'numero'>) => Promise<void>;
  editarSerial: (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => Promise<void>;
  excluirSerial: (materialId: string, numeroSerial: string) => Promise<void>;
  buscarMaterialPorId: (id: string) => MaterialEstoque | undefined;
  materiaisFiltrados: MaterialEstoque[];
  getEstatisticas: () => {
    totalItens: number;
    totalDisponiveis: number;
    totalEmUso: number;
    totalManutencao: number;
    categorias: number;
  };
}

const EstoqueContext = createContext<EstoqueContextData | undefined>(undefined);

export function EstoqueProvider({ children }: { children: ReactNode }) {
  const [materiais, setMateriais] = useState<MaterialEstoque[]>(mockMateriais);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosEstoque>({
    busca: '',
    categoria: 'todas',
    status: 'todos',
    localizacao: '',
  });

  const materiaisFiltrados = React.useMemo(() => {
    return materiais.filter((material) => {
      const matchBusca = filtros.busca === '' || 
        material.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        material.categoria.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        material.seriais.some(s => s.numero.toLowerCase().includes(filtros.busca.toLowerCase()));

      const matchCategoria = filtros.categoria === 'todas' || material.categoria === filtros.categoria;

      const matchStatus = filtros.status === 'todos' || 
        material.seriais.some(s => s.status === filtros.status);

      const matchLocalizacao = filtros.localizacao === '' || 
        material.seriais.some(s => s.localizacao.toLowerCase().includes(filtros.localizacao.toLowerCase()));

      return matchBusca && matchCategoria && matchStatus && matchLocalizacao;
    });
  }, [materiais, filtros]);

  const adicionarMaterial = async (dados: Omit<MaterialEstoque, 'id' | 'seriais'>): Promise<MaterialEstoque> => {
    setLoading(true);
    try {
      const novoMaterial: MaterialEstoque = {
        ...dados,
        id: `MAT${String(materiais.length + 1).padStart(3, '0')}`,
        seriais: [],
      };

      setMateriais(prev => [...prev, novoMaterial]);
      toast({
        title: 'Material cadastrado',
        description: `${novoMaterial.nome} foi adicionado ao estoque.`,
      });

      return novoMaterial;
    } finally {
      setLoading(false);
    }
  };

  const editarMaterial = async (id: string, dados: Partial<MaterialEstoque>) => {
    setLoading(true);
    try {
      setMateriais(prev => prev.map(m => m.id === id ? { ...m, ...dados } : m));
      toast({
        title: 'Material atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const excluirMaterial = async (id: string) => {
    const material = materiais.find(m => m.id === id);
    if (!material) {
      toast({
        title: 'Erro',
        description: 'Material não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    const seriaisEmUso = material.seriais.filter(s => s.status === 'em-uso');
    if (seriaisEmUso.length > 0) {
      toast({
        title: 'Não é possível excluir',
        description: `Este material possui ${seriaisEmUso.length} unidade(s) em uso.`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      setMateriais(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Material excluído',
        description: `${material.nome} foi removido do estoque.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarSerial = async (materialId: string, dados: Omit<SerialEstoque, 'numero'>) => {
    setLoading(true);
    try {
      setMateriais(prev => prev.map(m => {
        if (m.id === materialId) {
          const proximoNumero = m.seriais.length + 1;
          const novoSerial: SerialEstoque = {
            ...dados,
            numero: `${m.id}-${String(proximoNumero).padStart(3, '0')}`,
          };
          return {
            ...m,
            seriais: [...m.seriais, novoSerial],
            quantidadeTotal: m.quantidadeTotal + 1,
            quantidadeDisponivel: dados.status === 'disponivel' 
              ? m.quantidadeDisponivel + 1 
              : m.quantidadeDisponivel,
          };
        }
        return m;
      }));
      toast({
        title: 'Serial adicionado',
        description: 'Novo item adicionado ao estoque.',
      });
    } finally {
      setLoading(false);
    }
  };

  const editarSerial = async (materialId: string, numeroSerial: string, dados: Partial<SerialEstoque>) => {
    setLoading(true);
    try {
      setMateriais(prev => prev.map(m => {
        if (m.id === materialId) {
          const serialAtual = m.seriais.find(s => s.numero === numeroSerial);
          const novosSeriais = m.seriais.map(s => 
            s.numero === numeroSerial ? { ...s, ...dados } : s
          );
          
          let quantidadeDisponivel = m.quantidadeDisponivel;
          if (serialAtual && dados.status) {
            if (serialAtual.status !== 'disponivel' && dados.status === 'disponivel') {
              quantidadeDisponivel++;
            } else if (serialAtual.status === 'disponivel' && dados.status !== 'disponivel') {
              quantidadeDisponivel--;
            }
          }

          return {
            ...m,
            seriais: novosSeriais,
            quantidadeDisponivel,
          };
        }
        return m;
      }));
      toast({
        title: 'Serial atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    } finally {
      setLoading(false);
    }
  };

  const excluirSerial = async (materialId: string, numeroSerial: string) => {
    setLoading(true);
    try {
      setMateriais(prev => prev.map(m => {
        if (m.id === materialId) {
          const serial = m.seriais.find(s => s.numero === numeroSerial);
          if (serial?.status === 'em-uso') {
            toast({
              title: 'Não é possível excluir',
              description: 'Este serial está em uso.',
              variant: 'destructive',
            });
            return m;
          }

          return {
            ...m,
            seriais: m.seriais.filter(s => s.numero !== numeroSerial),
            quantidadeTotal: m.quantidadeTotal - 1,
            quantidadeDisponivel: serial?.status === 'disponivel' 
              ? m.quantidadeDisponivel - 1 
              : m.quantidadeDisponivel,
          };
        }
        return m;
      }));
      toast({
        title: 'Serial excluído',
        description: 'Item removido do estoque.',
      });
    } finally {
      setLoading(false);
    }
  };

  const buscarMaterialPorId = (id: string) => {
    return materiais.find(m => m.id === id);
  };

  const getEstatisticas = () => {
    const totalItens = materiais.reduce((acc, m) => acc + m.quantidadeTotal, 0);
    const totalDisponiveis = materiais.reduce((acc, m) => acc + m.quantidadeDisponivel, 0);
    
    let totalEmUso = 0;
    let totalManutencao = 0;
    materiais.forEach(m => {
      m.seriais.forEach(s => {
        if (s.status === 'em-uso') totalEmUso++;
        if (s.status === 'manutencao') totalManutencao++;
      });
    });

    const categorias = new Set(materiais.map(m => m.categoria)).size;

    return {
      totalItens,
      totalDisponiveis,
      totalEmUso,
      totalManutencao,
      categorias,
    };
  };

  return (
    <EstoqueContext.Provider
      value={{
        materiais,
        loading,
        filtros,
        setFiltros,
        adicionarMaterial,
        editarMaterial,
        excluirMaterial,
        adicionarSerial,
        editarSerial,
        excluirSerial,
        buscarMaterialPorId,
        materiaisFiltrados,
        getEstatisticas,
      }}
    >
      {children}
    </EstoqueContext.Provider>
  );
}

export function useEstoque() {
  const context = useContext(EstoqueContext);
  if (!context) {
    throw new Error('useEstoque deve ser usado dentro de EstoqueProvider');
  }
  return context;
}
