import { createContext, useContext, useState, ReactNode } from 'react';
import { Transportadora, Envio } from '@/types/transportadoras';
import { transportadorasMock, enviosMock } from '@/lib/mock-data/transportadoras';
import { toast } from '@/hooks/use-toast';

interface TransportadorasContextData {
  transportadoras: Transportadora[];
  envios: Envio[];
  loading: boolean;
  criarTransportadora: (data: Omit<Transportadora, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  editarTransportadora: (id: string, data: Partial<Transportadora>) => void;
  excluirTransportadora: (id: string) => void;
  criarEnvio: (data: Omit<Envio, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarStatusEnvio: (id: string, status: Envio['status']) => void;
  buscarEnviosPorEvento: (eventoId: string) => Envio[];
  buscarEnviosPorTransportadora: (transportadoraId: string) => Envio[];
}

const TransportadorasContext = createContext<TransportadorasContextData>({} as TransportadorasContextData);

export function TransportadorasProvider({ children }: { children: ReactNode }) {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>(transportadorasMock);
  const [envios, setEnvios] = useState<Envio[]>(enviosMock);
  const [loading] = useState(false);

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
    setEnvios([...envios, novoEnvio]);
    toast({
      title: 'Envio criado',
      description: 'Envio registrado com sucesso.',
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
        atualizarStatusEnvio,
        buscarEnviosPorEvento,
        buscarEnviosPorTransportadora,
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
