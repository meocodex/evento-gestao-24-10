import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Star, Shield } from 'lucide-react';
import { MembroEquipeUnificado } from '@/types/equipe';

interface MembroEquipeCardProps {
  membro: MembroEquipeUnificado;
  onDetalhes: () => void;
  onEditar: () => void;
}

export function MembroEquipeCard({ membro, onDetalhes, onEditar }: MembroEquipeCardProps) {
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'clt': 'CLT',
      'freelancer': 'Freelancer',
      'pj': 'PJ',
    };
    return labels[tipo] || tipo;
  };

  const getTipoBadgeVariant = (tipo: 'sistema' | 'operacional' | 'ambos') => {
    switch (tipo) {
      case 'sistema':
        return 'default';
      case 'operacional':
        return 'secondary';
      case 'ambos':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTipoMembroLabel = (tipo: 'sistema' | 'operacional' | 'ambos') => {
    switch (tipo) {
      case 'sistema':
        return 'Sistema';
      case 'operacional':
        return 'Operacional';
      case 'ambos':
        return 'Sistema + Operacional';
      default:
        return tipo;
    }
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'ativo':
        return 'default';
      case 'inativo':
        return 'secondary';
      case 'bloqueado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'bloqueado': 'Bloqueado',
    };
    return labels[status || ''] || status || 'Ativo';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={membro.avatar_url || undefined} alt={membro.nome} />
            <AvatarFallback>{membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* Informações Principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{membro.nome}</h3>
                <p className="text-sm text-muted-foreground">{membro.funcao_principal}</p>
              </div>
              
              {/* Badges de Tipo */}
              <div className="flex flex-col gap-1 items-end">
                <Badge variant={getTipoBadgeVariant(membro.tipo_membro)}>
                  {getTipoMembroLabel(membro.tipo_membro)}
                </Badge>
                {membro.tipo_membro === 'sistema' && membro.permissions && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>{membro.permissions.length} permissões</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações Secundárias */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {/* Tipo de Vínculo (operacionais) */}
              {membro.tipo_vinculo && (
                <Badge variant="outline" className="text-xs">
                  {getTipoLabel(membro.tipo_vinculo)}
                </Badge>
              )}

              {/* Status */}
              {membro.status && (
                <Badge variant={getStatusVariant(membro.status)} className="text-xs">
                  {getStatusLabel(membro.status)}
                </Badge>
              )}

              {/* Telefone */}
              {membro.telefone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span className="text-xs">{membro.telefone}</span>
                </div>
              )}

              {/* Email */}
              {membro.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs truncate max-w-[200px]">{membro.email}</span>
                </div>
              )}

              {/* Avaliação (operacionais) */}
              {membro.avaliacao && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{membro.avaliacao.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={onDetalhes}>
                Ver Detalhes
              </Button>
              <Button variant="ghost" size="sm" onClick={onEditar}>
                Editar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
