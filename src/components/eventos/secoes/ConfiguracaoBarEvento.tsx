import { Beer, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Evento } from '@/types/eventos';

interface ConfiguracaoBarEventoProps {
  evento: Evento;
}

export function ConfiguracaoBarEvento({ evento }: ConfiguracaoBarEventoProps) {
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
