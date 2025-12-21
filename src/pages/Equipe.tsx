import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Search, Plus, UserCheck, Briefcase, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { MembrosUnificadosVirtualList } from '@/components/equipe/MembrosUnificadosVirtualList';
import { NovoOperacionalSheet } from '@/components/equipe/operacional/NovoOperacionalSheet';
import { DetalhesOperacionalSheet } from '@/components/equipe/operacional/DetalhesOperacionalSheet';
import { EditarOperacionalSheet } from '@/components/equipe/operacional/EditarOperacionalSheet';
import { ConcederAcessoSistemaSheet } from '@/components/equipe/ConcederAcessoSistemaSheet';
import { GerenciarPermissoesMembroSheet } from '@/components/equipe/GerenciarPermissoesMembroSheet';
import { EquipeFiltersPopover, EquipeFiltersType } from '@/components/equipe/EquipeFiltersPopover';
import { StatCard } from '@/components/dashboard/StatCard';
import { MembroEquipeUnificado } from '@/types/equipe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function Equipe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { operacionais = [], data: profiles = [], isLoading: loadingMembros, excluirOperacional } = useEquipe(page, pageSize, {}, true);
  
  const canDeleteSystemUsers = hasPermission('admin.full_access');
  
  const membrosUnificados = useMemo((): MembroEquipeUnificado[] => {
    const unificados: MembroEquipeUnificado[] = [];
    
    operacionais.forEach(op => {
      const profileCorrespondente = profiles.find(p => p.email && op.email && p.email.toLowerCase() === op.email.toLowerCase());
      
      if (profileCorrespondente) {
        const hasRoles = (profileCorrespondente.roles?.length || 0) > 0;
        const hasPermissions = (profileCorrespondente.permissions?.length || 0) > 0;
        const hasRealAccess = hasRoles || hasPermissions;
        
        if (hasRealAccess) {
          unificados.push({
            ...op,
            id: profileCorrespondente.id,
            profile_id: profileCorrespondente.id,
            operacional_id: op.id,
            tipo_membro: 'ambos' as const,
            avatar_url: op.foto || profileCorrespondente.avatar_url,
            roles: profileCorrespondente.roles || [],
            role: profileCorrespondente.role,
            permissions: profileCorrespondente.permissions,
          });
        } else {
          unificados.push({
            ...op,
            tipo_membro: 'operacional' as const,
            avatar_url: op.foto || null
          });
        }
      } else {
        unificados.push({
          ...op,
          tipo_membro: 'operacional' as const,
          avatar_url: op.foto || null
        });
      }
    });
    
    profiles.forEach(p => {
      const jaAdicionado = unificados.some(u => 
        u.profile_id === p.id || 
        (p.email && u.email && p.email.toLowerCase() === u.email.toLowerCase())
      );
      
      if (!jaAdicionado) {
        unificados.push({
          id: p.id,
          tipo_membro: 'sistema' as const,
          nome: p.nome,
          email: p.email || '',
          telefone: p.telefone || null,
          cpf: p.cpf || null,
          avatar_url: p.avatar_url || null,
          funcao_principal: p.funcao_principal || 'Sistema',
          tipo_vinculo: 'CLT',
          status: 'ativo',
          roles: p.roles || [],
          role: p.role,
          permissions: p.permissions,
          created_at: p.created_at || '',
          updated_at: p.updated_at || '',
        });
      }
    });
    
    const membrosValidos = unificados.filter(membro => {
      if (membro.tipo_membro === 'sistema') {
        const hasRoles = membro.roles && membro.roles.length > 0;
        const hasPermissions = membro.permissions && membro.permissions.length > 0;
        const hasValidEmail = membro.email && membro.email.length > 0;
        return (hasRoles || hasPermissions) && hasValidEmail;
      }
      return true;
    });
    
    return membrosValidos;
  }, [operacionais, profiles]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState<EquipeFiltersType>({
    tipoMembro: 'todos',
    funcao: 'todas',
    status: 'todos',
  });
  
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<MembroEquipeUnificado | null>(null);
  const [editarMembro, setEditarMembro] = useState<MembroEquipeUnificado | null>(null);
  const [concederAcessoMembro, setConcederAcessoMembro] = useState<MembroEquipeUnificado | null>(null);
  const [gerenciarPermissoesMembro, setGerenciarPermissoesMembro] = useState<MembroEquipeUnificado | null>(null);
  const [membroParaExcluir, setMembroParaExcluir] = useState<MembroEquipeUnificado | null>(null);

  const handleConfirmarExclusao = async () => {
    if (!membroParaExcluir) return;

    if (membroParaExcluir.email === 'admin@admin.com') {
      toast({
        title: 'Ação bloqueada',
        description: 'O administrador principal não pode ser excluído.',
        variant: 'destructive'
      });
      setMembroParaExcluir(null);
      return;
    }

    try {
      if (membroParaExcluir.tipo_membro === 'ambos') {
        const { data, error } = await supabase.functions.invoke('excluir-usuario', {
          body: { user_id: membroParaExcluir.id }
        });
        
        if (error && !error.message?.includes('User not found')) {
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }

        if (membroParaExcluir.operacional_id) {
          await excluirOperacional.mutateAsync(membroParaExcluir.operacional_id);
        }

        await queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
        await queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });
        await queryClient.refetchQueries({ queryKey: ['profiles-equipe'] });
        await queryClient.refetchQueries({ queryKey: ['equipe-operacional'] });

        toast({
          title: 'Sucesso',
          description: 'Acesso revogado e cadastro operacional removido'
        });
      } else if (membroParaExcluir.tipo_membro === 'sistema') {
        const { data, error } = await supabase.functions.invoke('excluir-usuario', {
          body: { user_id: membroParaExcluir.id }
        });
        
        if (error && !error.message?.includes('User not found')) {
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }

        await queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
        await queryClient.refetchQueries({ queryKey: ['profiles-equipe'] });
        
        toast({
          title: 'Sucesso',
          description: 'Acesso ao sistema revogado'
        });
      } else {
        const targetId = membroParaExcluir.operacional_id ?? membroParaExcluir.id;
        if (!targetId) {
          throw new Error('Não foi possível determinar o registro operacional para exclusão.');
        }
        
        await excluirOperacional.mutateAsync(targetId);
        
        toast({
          title: 'Sucesso',
          description: 'Cadastro operacional removido'
        });
      }

      setMembroParaExcluir(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o membro.';
      toast({
        title: 'Erro ao excluir',
        description: message,
        variant: 'destructive'
      });
    }
  };

  const membrosFiltrados = useMemo(() => {
    return membrosUnificados.filter(membro => {
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        const matchNome = membro.nome.toLowerCase().includes(termLower);
        const matchEmail = membro.email?.toLowerCase().includes(termLower);
        const matchTelefone = membro.telefone?.includes(searchTerm);
        const matchCPF = membro.cpf?.includes(searchTerm);
        
        if (!matchNome && !matchEmail && !matchTelefone && !matchCPF) {
          return false;
        }
      }

      if (filtros.tipoMembro !== 'todos' && membro.tipo_membro !== filtros.tipoMembro) {
        return false;
      }

      if (filtros.funcao !== 'todas' && membro.funcao_principal !== filtros.funcao) {
        return false;
      }

      if (filtros.status !== 'todos' && membro.status !== filtros.status) {
        return false;
      }

      return true;
    });
  }, [membrosUnificados, searchTerm, filtros]);

  const funcoesUnicas = useMemo(() => {
    return Array.from(new Set(membrosUnificados.map(m => m.funcao_principal))).sort();
  }, [membrosUnificados]);

  const stats = useMemo(() => {
    return {
      total: membrosUnificados.length,
      sistema: membrosUnificados.filter((m: MembroEquipeUnificado) => m.tipo_membro === 'sistema').length,
      operacional: membrosUnificados.filter((m: MembroEquipeUnificado) => m.tipo_membro === 'operacional').length,
      ambos: membrosUnificados.filter((m: MembroEquipeUnificado) => m.tipo_membro === 'ambos').length,
    };
  }, [membrosUnificados]);

  return (
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total de Membros"
            value={stats.total.toString()}
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Apenas Sistema"
            value={stats.sistema.toString()}
            icon={UserCheck}
            variant="primary"
          />
          <StatCard
            title="Apenas Operacional"
            value={stats.operacional.toString()}
            icon={Briefcase}
            variant="success"
          />
          <StatCard
            title="Sistema + Operacional"
            value={stats.ambos.toString()}
            icon={UserX}
            variant="default"
          />
        </div>

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Search */}
          <div className="relative min-w-[100px] max-w-[200px] flex-shrink flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Filters */}
          <EquipeFiltersPopover
            filtros={filtros}
            onFiltrosChange={setFiltros}
            funcoes={funcoesUnicas}
          />

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Create */}
          <Button onClick={() => setNovoDialogOpen(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Novo Membro</span>
          </Button>

          {/* Counter - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{membrosFiltrados.length}</span>/<span>{stats.total}</span>
            </span>
          </div>
        </div>

        {/* Lista Virtualizada Unificada */}
        <MembrosUnificadosVirtualList
          membros={membrosFiltrados}
          loading={loadingMembros}
          onDetalhes={setMembroSelecionado}
          onEditar={setEditarMembro}
          onExcluir={setMembroParaExcluir}
          onConcederAcesso={setConcederAcessoMembro}
          onGerenciarPermissoes={setGerenciarPermissoesMembro}
          canDeleteSystemUsers={canDeleteSystemUsers}
        />
      </div>

      {/* Dialogs */}
      <NovoOperacionalSheet
        open={novoDialogOpen}
        onOpenChange={setNovoDialogOpen}
      />

      {membroSelecionado?.tipo_membro !== 'sistema' && membroSelecionado && (
        <DetalhesOperacionalSheet
          operacional={membroSelecionado as unknown as import('@/types/equipe').OperacionalEquipe}
          open={!!membroSelecionado}
          onOpenChange={(open) => !open && setMembroSelecionado(null)}
          onEditar={() => {
            setEditarMembro(membroSelecionado);
            setMembroSelecionado(null);
          }}
          onExcluir={() => {
            setMembroParaExcluir(membroSelecionado);
            setMembroSelecionado(null);
          }}
        />
      )}

      {editarMembro?.tipo_membro !== 'sistema' && editarMembro && (
        <EditarOperacionalSheet
          operacional={editarMembro as unknown as import('@/types/equipe').OperacionalEquipe}
          open={!!editarMembro}
          onOpenChange={(open) => !open && setEditarMembro(null)}
        />
      )}

      <ConcederAcessoSistemaSheet
        open={!!concederAcessoMembro}
        onOpenChange={(open) => !open && setConcederAcessoMembro(null)}
        membro={concederAcessoMembro}
      />

      <GerenciarPermissoesMembroSheet
        open={!!gerenciarPermissoesMembro}
        onOpenChange={(open) => !open && setGerenciarPermissoesMembro(null)}
        membro={gerenciarPermissoesMembro}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!membroParaExcluir} onOpenChange={(open) => !open && setMembroParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {membroParaExcluir?.tipo_membro === 'ambos' ? (
                <>
                  ⚠️ <strong>{membroParaExcluir?.nome}</strong> possui acesso ao sistema. 
                  <br /><br />
                  Ao excluir, este membro será:
                  <ul className="list-disc ml-5 mt-2">
                    <li>Removido da equipe operacional</li>
                    <li>Perderá acesso ao sistema (login)</li>
                    <li>Suas permissões serão revogadas</li>
                  </ul>
                </>
              ) : membroParaExcluir?.tipo_membro === 'sistema' ? (
                <>
                  Tem certeza que deseja revocar o acesso de <strong>{membroParaExcluir?.nome}</strong>?
                  <br /><br />
                  Este usuário perderá o acesso ao sistema e todas as suas permissões serão removidas.
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir <strong>{membroParaExcluir?.nome}</strong>?
                  <br /><br />
                  Esta ação não pode ser desfeita.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
