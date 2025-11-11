import { Evento } from '@/types/eventos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContratos } from '@/hooks/contratos';
import { FileText, Download, Eye, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { DetalhesContratoSheet } from '@/components/contratos/DetalhesContratoSheet';

interface ContratosEventoProps {
  evento: Evento;
}

export function ContratosEvento({ evento }: ContratosEventoProps) {
  const { contratos } = useContratos();
  const [contratoSelecionado, setContratoSelecionado] = useState<string | null>(null);
  
  // Filtrar contratos relacionados ao evento
  const contratosEvento = contratos.filter(c => c.eventoId === evento.id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      proposta: 'bg-blue-500',
      em_negociacao: 'bg-yellow-500',
      aprovada: 'bg-green-500',
      rascunho: 'bg-gray-500',
      em_revisao: 'bg-orange-500',
      aguardando_assinatura: 'bg-purple-500',
      assinado: 'bg-emerald-600',
      cancelado: 'bg-red-500',
      expirado: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      proposta: 'Proposta',
      em_negociacao: 'Em Negociação',
      aprovada: 'Aprovada',
      rascunho: 'Rascunho',
      em_revisao: 'Em Revisão',
      aguardando_assinatura: 'Aguardando Assinatura',
      assinado: 'Assinado',
      cancelado: 'Cancelado',
      expirado: 'Expirado',
    };
    return labels[status] || status;
  };

  const contrato = contratoSelecionado 
    ? contratos.find(c => c.id === contratoSelecionado) 
    : null;

  if (contratosEvento.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum contrato vinculado a este evento</p>
        <p className="text-sm text-muted-foreground mt-2">
          Crie uma proposta comercial e vincule ao evento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {contratosEvento.map((contrato) => (
          <Card key={contrato.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {contrato.titulo}
                  </CardTitle>
                  <CardDescription>Nº {contrato.numero}</CardDescription>
                </div>
                <Badge className={getStatusColor(contrato.status)}>
                  {getStatusLabel(contrato.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {contrato.valor && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {contrato.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Criado em{' '}
                    {format(new Date(contrato.criadoEm), "dd 'de' MMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              {contrato.assinaturas && contrato.assinaturas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assinaturas:</p>
                  <div className="space-y-1">
                    {contrato.assinaturas.map((assinatura, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {assinatura.parte} - {assinatura.nome}
                        </span>
                        {assinatura.assinado ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Assinado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Pendente
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContratoSelecionado(contrato.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contrato && (
        <DetalhesContratoSheet
          contrato={contrato}
          open={!!contratoSelecionado}
          onOpenChange={(open) => {
            if (!open) setContratoSelecionado(null);
          }}
        />
      )}
    </div>
  );
}
