import { useEstoqueHistorico } from '@/contexts/estoque/useEstoqueHistorico';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { 
  PackagePlus, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Trash, 
  History,
  Truck,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface HistoricoMaterialTimelineProps {
  materialId: string;
  serialNumero?: string;
}

export function HistoricoMaterialTimeline({ materialId, serialNumero }: HistoricoMaterialTimelineProps) {
  const { data: historico, isLoading } = useEstoqueHistorico(materialId, serialNumero);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!historico || historico.length === 0) {
    return (
      <EmptyState 
        icon={History}
        title="Sem movimentações registradas"
        description="Este material ainda não possui histórico"
      />
    );
  }

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case 'alocacao': return <PackagePlus className="text-blue-500" />;
      case 'devolucao_ok': return <CheckCircle className="text-green-500" />;
      case 'devolucao_danificado': return <AlertTriangle className="text-yellow-500" />;
      case 'perda': return <XCircle className="text-red-500" />;
      case 'consumo': return <Trash className="text-gray-500" />;
      default: return <History className="text-muted-foreground" />;
    }
  };

  const getTituloByTipo = (tipo: string) => {
    switch (tipo) {
      case 'alocacao': return 'Alocado para Evento';
      case 'devolucao_ok': return 'Devolvido em Perfeito Estado';
      case 'devolucao_danificado': return 'Devolvido Danificado';
      case 'perda': return 'Perdido no Evento';
      case 'consumo': return 'Consumido';
      case 'entrada_estoque': return 'Entrada no Estoque';
      case 'ajuste_inventario': return 'Ajuste de Inventário';
      case 'manutencao_iniciada': return 'Enviado para Manutenção';
      case 'manutencao_concluida': return 'Retornou da Manutenção';
      default: return tipo;
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'devolucao_ok': return 'default';
      case 'devolucao_danificado': return 'warning';
      case 'perda': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {historico.map((item) => (
        <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="flex-shrink-0 mt-1">
            {getIconByTipo(item.tipoOperacao)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-semibold">
                {getTituloByTipo(item.tipoOperacao)}
              </h4>
              {item.eventoNome && (
                <Badge variant={getBadgeVariant(item.tipoOperacao)}>
                  {item.eventoNome}
                </Badge>
              )}
            </div>

            {item.serialNumero && (
              <div className="mt-2">
                <Badge variant="outline" className="font-mono">
                  🔖 {item.serialNumero}
                </Badge>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {format(new Date(item.dataMovimentacao), "dd/MM/yyyy 'às' HH:mm")}
            </p>

            {item.tipoEnvio && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                {item.tipoEnvio === 'antecipado' ? (
                  <Truck className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span>
                  {item.tipoEnvio === 'antecipado' 
                    ? `Envio Antecipado${item.transportadora ? ` via ${item.transportadora}` : ''}`
                    : `Com Técnicos${item.responsavel ? ` - ${item.responsavel}` : ''}`
                  }
                </span>
              </div>
            )}

            {item.quantidade && (
              <p className="text-sm mt-2">
                🔢 Quantidade: {item.quantidade} {item.quantidade === 1 ? 'unidade' : 'unidades'}
              </p>
            )}

            {item.observacoes && (
              <p className="text-sm mt-2 text-muted-foreground bg-muted p-2 rounded">
                💬 {item.observacoes}
              </p>
            )}

            {item.fotosComprovantes && item.fotosComprovantes.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {item.fotosComprovantes.map((foto, idx) => (
                  <a 
                    key={idx} 
                    href={foto} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={foto} 
                      alt={`Comprovante ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
