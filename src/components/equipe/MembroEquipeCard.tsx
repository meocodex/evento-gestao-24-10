import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Star, Shield, Lock, Trash2 } from 'lucide-react';
import { MembroEquipeUnificado } from '@/types/equipe';
import { InfoGridCompact } from '@/components/shared/InfoGrid';
import { BadgeVariant } from '@/types/financeiro';

interface MembroEquipeCardProps {
  membro: MembroEquipeUnificado;
  onDetalhes: () => void;
  onEditar: () => void;
  onExcluir: () => void;
  onConcederAcesso?: () => void;
  onGerenciarPermissoes?: () => void;
  canDeleteSystemUsers?: boolean;
}

export const MembroEquipeCard = React.memo(function MembroEquipeCard({ 
  membro, 
  onDetalhes, 
  onEditar, 
  onExcluir,
  onConcederAcesso, 
  onGerenciarPermissoes,
  canDeleteSystemUsers = false
}: MembroEquipeCardProps) {
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

  const getRoleBadgeVariant = (role?: string): BadgeVariant => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'comercial':
        return 'default';
      case 'suporte':
        return 'secondary';
      case 'operacional':
        return 'outline';
      case 'financeiro':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role?: string) => {
    const labels: Record<string, { label: string; icon: string }> = {
      'admin': { label: 'Administrador', icon: '👑' },
      'comercial': { label: 'Comercial', icon: '🎯' },
      'suporte': { label: 'Suporte', icon: '🔧' },
      'operacional': { label: 'Operacional', icon: '👷' },
      'financeiro': { label: 'Financeiro', icon: '💰' },
    };
    return labels[role || ''] || null;
  };

  const isMainAdmin = membro.email === 'admin@admin.com';

  return (
    <Card className="hover:shadow-md transition-shadow rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
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
              
              {/* Badges de Tipo, Status e Role */}
              <div className="flex flex-col gap-1 items-end">
                <Badge variant={getTipoBadgeVariant(membro.tipo_membro)}>
                  {getTipoMembroLabel(membro.tipo_membro)}
                </Badge>
                
                {/* Badge de Acesso ao Sistema - só se tiver roles/permissions reais */}
                {membro.tipo_membro === 'ambos' && 
                 ((membro.roles?.length || 0) > 0 || (membro.permissions?.length || 0) > 0) && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                    <Lock className="h-3 w-3 mr-1" />
                    Com Acesso ao Sistema
                  </Badge>
                )}
                
                {/* Múltiplas Roles - só para membros com acesso ao sistema */}
                {(membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && membro.roles && membro.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {membro.roles.map((role: string) => {
                      const roleInfo = getRoleLabel(role);
                      if (!roleInfo) return null;
                      return (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                          <span className="mr-1">{roleInfo.icon}</span>
                          {roleInfo.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                
                {/* Fallback para role única (compatibilidade) */}
                {(membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && 
                 (!membro.roles || membro.roles.length === 0) && 
                 membro.role && (
                  <Badge variant={getRoleBadgeVariant(membro.role)}>
                    {(() => {
                      const roleInfo = getRoleLabel(membro.role);
                      return roleInfo ? (
                        <>
                          <span className="mr-1">{roleInfo.icon}</span>
                          {roleInfo.label}
                        </>
                      ) : null;
                    })()}
                  </Badge>
                )}
                
                {/* Contador de Permissões */}
                {(membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    {membro.permissions === undefined ? (
                      <span className="text-muted-foreground italic">Sincronizando...</span>
                    ) : membro.permissions === null ? (
                      <span className="text-red-500">Erro ao carregar</span>
                    ) : membro.permissions.length === 0 ? (
                      <span className="text-muted-foreground">Nenhuma permissão</span>
                    ) : (
                      <span>{membro.permissions.length} permissões</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Informações Secundárias */}
            <InfoGridCompact
              items={[
                ...(membro.tipo_vinculo ? [{
                  value: <Badge variant="outline" className="text-xs">{getTipoLabel(membro.tipo_vinculo)}</Badge>,
                }] : []),
                ...(membro.status ? [{
                  value: <Badge variant={getStatusVariant(membro.status)} className="text-xs">{getStatusLabel(membro.status)}</Badge>,
                }] : []),
                ...(membro.telefone ? [{
                  icon: Phone,
                  value: membro.telefone,
                }] : []),
                ...(membro.email ? [{
                  icon: Mail,
                  value: membro.email,
                  className: 'max-w-[200px]',
                  valueClassName: 'truncate',
                }] : []),
                ...(membro.avaliacao ? [{
                  icon: Star,
                  value: membro.avaliacao.toFixed(1),
                  iconClassName: 'fill-yellow-400 text-yellow-400',
                  valueClassName: 'font-medium',
                }] : []),
              ]}
              className="mt-2"
            />

            {/* Ações */}
            <div className="mt-3 flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={onDetalhes}>
                Ver Detalhes
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEditar}
                disabled={isMainAdmin && membro.id !== membro.profile_id}
              >
                Editar
              </Button>
              
              {/* Ações específicas por tipo de membro */}
              {membro.tipo_membro === 'operacional' && onConcederAcesso && (
                <Button variant="default" size="sm" onClick={onConcederAcesso}>
                  <Lock className="h-3 w-3 mr-1" />
                  Conceder Acesso
                </Button>
              )}
              
              {(membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && onGerenciarPermissoes && (
                <Button variant="secondary" size="sm" onClick={onGerenciarPermissoes}>
                  <Shield className="h-3 w-3 mr-1" />
                  Gerenciar Permissões
                </Button>
              )}

              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onExcluir}
                disabled={
                  isMainAdmin || 
                  ((membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && !canDeleteSystemUsers)
                }
                title={
                  isMainAdmin 
                    ? 'O administrador principal não pode ser excluído' 
                    : ((membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos') && !canDeleteSystemUsers)
                    ? 'Apenas administradores podem excluir usuários do sistema'
                    : 'Excluir membro'
                }
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
