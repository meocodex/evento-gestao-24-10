import { useEffect, useState } from 'react';
import { Beer, ExternalLink, FileText, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Evento } from '@/types/eventos';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfiguracaoBarEventoProps {
  evento: Evento;
}

interface HistoricoAlteracao {
  id: string;
  campo_alterado: string;
  valor_anterior: string;
  valor_novo: string;
  motivo: string;
  data_alteracao: string;
  usuario?: { nome: string };
}

export function ConfiguracaoBarEvento({ evento }: ConfiguracaoBarEventoProps) {
  const [historico, setHistorico] = useState<HistoricoAlteracao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarHistorico();
  }, [evento.id]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos_configuracao_historico')
        .select(`
          *,
          usuario:profiles(nome)
        `)
        .eq('evento_id', evento.id)
        .order('data_alteracao', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!evento.configuracaoBar) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Nenhuma configuração de bar encontrada
      </div>
    );
  }

  const { quantidadeMaquinas, quantidadeBares, temCardapio, cardapioUrl } = evento.configuracaoBar;

  return (
    <div className="p-6 space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Máquinas de Bar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Beer className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{quantidadeMaquinas}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pontos de Bar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Beer className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{quantidadeBares}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cardápio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {temCardapio ? (
              <Badge className="bg-green-500">Definido</Badge>
            ) : (
              <Badge variant="secondary">Não definido</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {temCardapio && cardapioUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cardápio do Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href={cardapioUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Cardápio
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {historico.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Alterações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {historico.map((item) => (
                  <div key={item.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{item.campo_alterado}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.data_alteracao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <span className="text-destructive font-medium">{item.valor_anterior}</span>
                      {' → '}
                      <span className="text-primary font-medium">{item.valor_novo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      <strong>Motivo:</strong> {item.motivo}
                    </p>
                    {item.usuario && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Por: {item.usuario.nome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Materiais Alocados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Os materiais de bar alocados aparecem na aba "Materiais"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
