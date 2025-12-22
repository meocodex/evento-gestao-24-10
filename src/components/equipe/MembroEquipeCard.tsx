import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Star, Shield, Lock, Trash2, MoreHorizontal, Eye, Pencil } from 'lucide-react';
import { MembroEquipeUnificado } from '@/types/equipe';
import { BadgeVariant } from '@/types/financeiro';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        return 'Sis + Op';
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
      'admin': { label: 'Admin', icon: '👑' },
      'comercial': { label: 'Comercial', icon: '🎯' },
      'suporte': { label: 'Suporte', icon: '🔧' },
      'operacional': { label: 'Operacional', icon: '👷' },
      'financeiro': { label: 'Financeiro', icon: '💰' },
    };
    return labels[role || ''] || null;
  };

  const isMainAdmin = membro.email === 'admin@admin.com';
  const hasSystemAccess = membro.tipo_membro === 'sistema' || membro.tipo_membro === 'ambos';
  const permissionsCount = membro.permissions?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow rounded-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Avatar compacto */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={membro.avatar_url || undefined} alt={membro.nome} />
            <AvatarFallback className="text-sm">{membro.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* Informações Principais - Layout Horizontal */}
          <div className="flex-1 min-w-0">
            {/* Linha 1: Nome + Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate max-w-[180px]">{membro.nome}</h3>
              
              {/* Badges em linha */}
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant={getTipoBadgeVariant(membro.tipo_membro)} className="text-[10px] px-1.5 py-0">
                  {getTipoMembroLabel(membro.tipo_membro)}
                </Badge>
                
                {membro.status && (
                  <Badge variant={getStatusVariant(membro.status)} className="text-[10px] px-1.5 py-0">
                    {getStatusLabel(membro.status)}
                  </Badge>
                )}
                
                {membro.tipo_vinculo && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {getTipoLabel(membro.tipo_vinculo)}
                  </Badge>
                )}

                {/* Roles inline */}
                {hasSystemAccess && membro.roles && membro.roles.length > 0 && (
                  <>
                    {membro.roles.slice(0, 2).map((role: string) => {
                      const roleInfo = getRoleLabel(role);
                      if (!roleInfo) return null;
                      return (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-[10px] px-1.5 py-0">
                          <span className="mr-0.5">{roleInfo.icon}</span>
                          {roleInfo.label}
                        </Badge>
                      );
                    })}
                    {membro.roles.length > 2 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{membro.roles.length - 2}
                      </Badge>
                    )}
                  </>
                )}

                {/* Fallback role */}
                {hasSystemAccess && (!membro.roles || membro.roles.length === 0) && membro.role && (
                  <Badge variant={getRoleBadgeVariant(membro.role)} className="text-[10px] px-1.5 py-0">
                    {(() => {
                      const roleInfo = getRoleLabel(membro.role);
                      return roleInfo ? (
                        <>
                          <span className="mr-0.5">{roleInfo.icon}</span>
                          {roleInfo.label}
                        </>
                      ) : null;
                    })()}
                  </Badge>
                )}

                {/* Contador de permissões inline */}
                {hasSystemAccess && permissionsCount > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Shield className="h-3 w-3" />
                    {permissionsCount}
                  </span>
                )}
              </div>
            </div>
            
            {/* Linha 2: Função + Contatos */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="truncate max-w-[120px]">{membro.funcao_principal}</span>
              
              {membro.telefone && (
                <span className="flex items-center gap-0.5 shrink-0">
                  <Phone className="h-3 w-3" />
                  <span className="hidden sm:inline">{membro.telefone}</span>
                </span>
              )}
              
              {membro.email && (
                <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate hidden md:inline">{membro.email}</span>
                </span>
              )}
              
              {membro.avaliacao && (
                <span className="flex items-center gap-0.5 shrink-0">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {membro.avaliacao.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Ações Compactas */}
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDetalhes} title="Ver Detalhes">
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onEditar}
              disabled={isMainAdmin && membro.id !== membro.profile_id}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {membro.tipo_membro === 'operacional' && onConcederAcesso && (
                  <DropdownMenuItem onClick={onConcederAcesso}>
                    <Lock className="h-4 w-4 mr-2" />
                    Conceder Acesso
                  </DropdownMenuItem>
                )}
                
                {hasSystemAccess && onGerenciarPermissoes && (
                  <DropdownMenuItem onClick={onGerenciarPermissoes}>
                    <Shield className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem 
                  onClick={onExcluir}
                  disabled={
                    isMainAdmin || 
                    (hasSystemAccess && !canDeleteSystemUsers)
                  }
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
