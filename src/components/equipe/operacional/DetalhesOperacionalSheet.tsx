import { DetailsSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Phone, Star, Edit, FileText, Calendar, Trash2 } from 'lucide-react';
import { OperacionalEquipe } from '@/types/equipe';

interface DetalhesOperacionalSheetProps {
  operacional: OperacionalEquipe;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditar: () => void;
  onExcluir: () => void;
}

export function DetalhesOperacionalSheet({ operacional, open, onOpenChange, onEditar, onExcluir }: DetalhesOperacionalSheetProps) {
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
    <DetailsSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhes do Membro"
      size="xl"
    >
      <div className="space-y-6">
        {/* Cabeçalho com Avatar */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={operacional.foto || undefined} />
            <AvatarFallback className="text-xl">
              {operacional.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-2xl font-bold">{operacional.nome}</h3>
            <p className="text-lg text-muted-foreground">{operacional.funcao_principal}</p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{operacional.avaliacao.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">/5.0</span>
              </div>
              <Badge variant="outline">{getTipoLabel(operacional.tipo_vinculo)}</Badge>
              <Badge variant={getStatusVariant(operacional.status)}>
                {getStatusLabel(operacional.status)}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onExcluir} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button onClick={onEditar} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Informações de Contato */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Informações de Contato
          </h4>
          <div className="space-y-2 text-sm">
            {operacional.cpf && (
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">CPF:</span>
                <span className="col-span-2">{operacional.cpf}</span>
              </div>
            )}
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground">Telefone:</span>
              <span className="col-span-2">{operacional.telefone}</span>
            </div>
            {operacional.whatsapp && (
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">WhatsApp:</span>
                <span className="col-span-2">{operacional.whatsapp}</span>
              </div>
            )}
            {operacional.email && (
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Email:</span>
                <span className="col-span-2">{operacional.email}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Funções */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Funções
          </h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Principal:</span>
              <Badge className="ml-2">{operacional.funcao_principal}</Badge>
            </div>
            {operacional.funcoes_secundarias && operacional.funcoes_secundarias.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Secundárias:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {operacional.funcoes_secundarias.map((funcao, index) => (
                    <Badge key={index} variant="outline">{funcao}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {operacional.observacoes && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">Observações</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {operacional.observacoes}
              </p>
            </div>
          </>
        )}

        <Separator />

        {/* Datas */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Informações Administrativas
          </h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground">Cadastrado em:</span>
              <span className="col-span-2">
                {new Date(operacional.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="col-span-2">
                {new Date(operacional.updated_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DetailsSheet>
  );
}
