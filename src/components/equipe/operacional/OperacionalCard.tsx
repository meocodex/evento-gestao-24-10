import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Star, Eye, Edit } from 'lucide-react';
import { OperacionalEquipe } from '@/types/equipe';

interface OperacionalCardProps {
  operacional: OperacionalEquipe;
  onDetalhes: () => void;
  onEditar: () => void;
}

export function OperacionalCard({ operacional, onDetalhes, onEditar }: OperacionalCardProps) {
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      clt: 'CLT',
      freelancer: 'Freelancer',
      pj: 'PJ'
    };
    return labels[tipo] || tipo;
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ativo: 'default',
      inativo: 'secondary',
      bloqueado: 'destructive'
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      bloqueado: 'Bloqueado'
    };
    return labels[status] || status;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={operacional.foto || undefined} />
            <AvatarFallback>
              {operacional.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{operacional.nome}</h3>
            <p className="text-sm text-muted-foreground">{operacional.funcao_principal}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{getTipoLabel(operacional.tipo_vinculo)}</Badge>
              <Badge variant={getStatusVariant(operacional.status)}>
                {getStatusLabel(operacional.status)}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {operacional.telefone}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {operacional.avaliacao.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button variant="outline" size="sm" className="flex-1" onClick={onDetalhes}>
          <Eye className="h-3 w-3 mr-1" />
          Ver Detalhes
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onEditar}>
          <Edit className="h-3 w-3 mr-1" />
          Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
