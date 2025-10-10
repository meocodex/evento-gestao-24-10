import { createContext, useContext, useState, ReactNode } from 'react';
import { Transportadora, Envio, RotaAtendida } from '@/types/transportadoras';
import { transportadorasMock, enviosMock } from '@/lib/mock-data/transportadoras';
import { toast } from '@/hooks/use-toast';
import { useEventos } from './EventosContext';
import { Despesa } from '@/types/eventos';

interface TransportadorasContextData {
  transportadoras: Transportadora[];
  envios: Envio[];
  loading: boolean;
  criarTransportadora: (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarTransportadora: (id: string, data: Partial<Transportadora>) => void;
  excluirTransportadora: (id: string) => void;
  criarEnvio: (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarEnvio: (id: string, data: Partial<Envio>) => void;
  atualizarStatusEnvio: (id: string, status: Envio['status']) => void;
  buscarEnviosPorEvento: (eventoId: string) => Envio[];
  buscarEnviosPorTransportadora: (transportadoraId: string) => Envio[];
  buscarTransportadorasPorCidade: (cidade: string, estado: string) => Transportadora[];
  adicionarRota: (transportadoraId: string, rota: Omit<RotaAtendida, 'id'>) => void;
  editarRota: (transportadoraId: string, rotaId: string, data: Partial<RotaAtendida>) => void;
  removerRota: (transportadoraId: string, rotaId: string) => void;
}

const TransportadorasContext = createContext<TransportadorasContextData>({} as TransportadorasContextData);

export function TransportadorasProvider({ children }: { children: ReactNode }) {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>(transportadorasMock);
  const [envios, setEnvios] = useState<Envio[]>(enviosMock);
  const [loading] = useState(false);
  const eventosContext = useEventos();

  const criarTransportadora = (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const novaTransportadora: Transportadora = {
      ...data,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setTransportadoras([...transportadoras, novaTransportadora]);
    toast({
      title: 'Transportadora criada',
      description: 'Transportadora cadastrada com sucesso.',
    });
  };

  const editarTransportadora = (id: string, data: Partial<Transportadora>) => {
    setTransportadoras(
      transportadoras.map((t) =>
        t.id === id ? { ...t, ...data, atualizadoEm: new Date().toISOString() } : t
      )
    );
    toast({
      title: 'Transportadora atualizada',
      description: 'Dados atualizados com sucesso.',
    });
  };

  const excluirTransportadora = (id: string) => {
    setTransportadoras(transportadoras.filter((t) => t.id !== id));
    toast({
      title: 'Transportadora excluída',
      description: 'Transportadora removida do sistema.',
    });
  };

  const criarEnvio = (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const novoEnvio: Envio = {
      ...data,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    // Adicionar despesa ao evento se houver valor
    if (data.valor && data.eventoId) {
      const transportadora = transportadoras.find(t => t.id === data.transportadoraId);
      const statusDespesa = data.formaPagamento === 'antecipado' ? 'pago' : 'pendente';
      
      const novaDespesa: Despesa = {
        id: `desp-${Date.now()}`,
        descricao: `Frete ${data.tipo === 'ida' ? 'Ida' : 'Volta'} - ${transportadora?.nome || 'Transportadora'}`,
        categoria: 'transporte',
        quantidade: 1,
        valorUnitario: data.valor,
        valor: data.valor,
        data: new Date().toISOString(),
        dataPagamento: data.formaPagamento === 'antecipado' ? new Date().toISOString() : undefined,
        status: statusDespesa,
        comprovante: data.comprovantePagamento,
        observacoes: `Envio ID: ${novoEnvio.id} | ${data.origem} → ${data.destino} | Pagamento: ${data.formaPagamento}`,
      };

      eventosContext.adicionarDespesa(data.eventoId, novaDespesa);
      novoEnvio.despesaEventoId = novaDespesa.id;
    }

    setEnvios([...envios, novoEnvio]);
    toast({
      title: 'Envio criado',
      description: 'Envio registrado com sucesso e despesa adicionada ao evento.',
    });
  };

  const editarEnvio = (id: string, data: Partial<Envio>) => {
    const envioAtual = envios.find(e => e.id === id);
    
    if (!envioAtual) return;

    // Se mudou o valor ou forma de pagamento, atualizar despesa vinculada
    if (envioAtual.despesaEventoId && (data.valor || data.formaPagamento || data.comprovantePagamento)) {
      const novoValor = data.valor ?? envioAtual.valor;
      const novaFormaPagamento = data.formaPagamento ?? envioAtual.formaPagamento;
      const novoComprovante = data.comprovantePagamento ?? envioAtual.comprovantePagamento;

      eventosContext.editarDespesa(envioAtual.eventoId, envioAtual.despesaEventoId, {
        valor: novoValor,
        valorUnitario: novoValor,
        status: novaFormaPagamento === 'antecipado' ? 'pago' : 'pendente',
        dataPagamento: novaFormaPagamento === 'antecipado' ? new Date().toISOString() : undefined,
        comprovante: novoComprovante,
      });
    }

    setEnvios(envios.map(e => e.id === id ? { ...e, ...data, atualizadoEm: new Date().toISOString() } : e));
    toast({
      title: 'Envio atualizado',
      description: 'Dados atualizados com sucesso.',
    });
  };

  const atualizarStatusEnvio = (id: string, status: Envio['status']) => {
    setEnvios(
      envios.map((e) =>
        e.id === id ? { ...e, status, atualizadoEm: new Date().toISOString() } : e
      )
    );
    toast({
      title: 'Status atualizado',
      description: `Envio marcado como ${status}.`,
    });
  };

  const buscarEnviosPorEvento = (eventoId: string) => {
    return envios.filter((e) => e.eventoId === eventoId);
  };

  const buscarEnviosPorTransportadora = (transportadoraId: string) => {
    return envios.filter((e) => e.transportadoraId === transportadoraId);
  };

  const buscarTransportadorasPorCidade = (cidade: string, estado: string) => {
    return transportadoras.filter(t => 
      t.status === 'ativa' && 
      t.rotasAtendidas.some(r => 
        r.ativa && 
        (
          // Rota direta: transportadora atende essa cidade
          (r.cidadeDestino.toLowerCase() === cidade.toLowerCase() && r.estadoDestino === estado) ||
          // Rota reversa: transportadora está nessa cidade (pode buscar de lá)
          (t.endereco.cidade.toLowerCase() === cidade.toLowerCase() && t.endereco.estado === estado)
        )
      )
    );
  };

  const adicionarRota = (transportadoraId: string, rota: Omit<RotaAtendida, 'id'>) => {
    setTransportadoras(
      transportadoras.map((t) =>
        t.id === transportadoraId
          ? {
              ...t,
              rotasAtendidas: [
                ...t.rotasAtendidas,
                { ...rota, id: Date.now().toString() },
              ],
              atualizadoEm: new Date().toISOString(),
            }
          : t
      )
    );
    toast({
      title: 'Rota adicionada',
      description: 'Nova rota cadastrada com sucesso.',
    });
  };

  const editarRota = (transportadoraId: string, rotaId: string, data: Partial<RotaAtendida>) => {
    setTransportadoras(
      transportadoras.map((t) =>
        t.id === transportadoraId
          ? {
              ...t,
              rotasAtendidas: t.rotasAtendidas.map((r) =>
                r.id === rotaId ? { ...r, ...data } : r
              ),
              atualizadoEm: new Date().toISOString(),
            }
          : t
      )
    );
    toast({
      title: 'Rota atualizada',
      description: 'Rota atualizada com sucesso.',
    });
  };

  const removerRota = (transportadoraId: string, rotaId: string) => {
    setTransportadoras(
      transportadoras.map((t) =>
        t.id === transportadoraId
          ? {
              ...t,
              rotasAtendidas: t.rotasAtendidas.filter((r) => r.id !== rotaId),
              atualizadoEm: new Date().toISOString(),
            }
          : t
      )
    );
    toast({
      title: 'Rota removida',
      description: 'Rota removida com sucesso.',
    });
  };

  return (
    <TransportadorasContext.Provider
      value={{
        transportadoras,
        envios,
        loading,
        criarTransportadora,
        editarTransportadora,
        excluirTransportadora,
        criarEnvio,
        editarEnvio,
        atualizarStatusEnvio,
        buscarEnviosPorEvento,
        buscarEnviosPorTransportadora,
        buscarTransportadorasPorCidade,
        adicionarRota,
        editarRota,
        removerRota,
      }}
    >
      {children}
    </TransportadorasContext.Provider>
  );
}

export function useTransportadoras() {
  const context = useContext(TransportadorasContext);
  if (!context) {
    throw new Error('useTransportadoras must be used within TransportadorasProvider');
  }
  return context;
}
