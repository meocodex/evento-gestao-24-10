import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Search, Plus, UserCheck, Briefcase, UserX } from 'lucide-react';
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
  
  // ⭐ Verificar se usuário tem permissão admin para excluir usuários de sistema
  const canDeleteSystemUsers = hasPermission('admin.full_access');
  
  const membrosUnificados = useMemo(() => {
    const unificados: any[] = [];
    
    // Processar operacionais e verificar se têm acesso ao sistema
    operacionais.forEach(op => {
      const profileCorrespondente = profiles.find(p => p.email && op.email && p.email.toLowerCase() === op.email.toLowerCase());
      
      if (profileCorrespondente) {
        // ⭐ Verificar se há acesso real (roles ou permissions)
        const hasRoles = (profileCorrespondente.roles?.length || 0) > 0;
        const hasPermissions = (profileCorrespondente.permissions?.length || 0) > 0;
        const hasRealAccess = hasRoles || hasPermissions;
        
        if (hasRealAccess) {
          // Membro com acesso real ao sistema
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
          // Profile sem acesso real - tratar como operacional
          unificados.push({
            ...op,
            tipo_membro: 'operacional' as const,
            avatar_url: op.foto || null
          });
        }
      } else {
        // Membro é apenas operacional
        unificados.push({
          ...op,
          tipo_membro: 'operacional' as const,
          avatar_url: op.foto || null
        });
      }
    });
    
    // Adicionar profiles que não têm correspondente operacional
    profiles.forEach(p => {
      const jaAdicionado = unificados.some(u => 
        u.profile_id === p.id || 
        (p.email && u.email && p.email.toLowerCase() === u.email.toLowerCase())
      );
      
      if (!jaAdicionado) {
        unificados.push({
          ...p,
          tipo_membro: 'sistema' as const,
          funcao_principal: p.funcao_principal || 'Sistema',
          funcoes_secundarias: [],
          tipo_vinculo: 'CLT' as any,
          cnpj_pj: '',
          foto: p.avatar_url,
          telefone: p.telefone || '',
          cpf: p.cpf || '',
          whatsapp: null,
          documentos: [],
          status: 'ativo' as any,
          avaliacao: undefined,
          observacoes: '',
          roles: p.roles || [],
          role: p.role,
          permissions: p.permissions
        });
      }
    });
    
    // Filtrar perfis fantasma (sistema sem roles, permissions E email válido)
    const membrosValidos = unificados.filter(membro => {
      if (membro.tipo_membro === 'sistema') {
        const hasRoles = membro.roles && membro.roles.length > 0;
        const hasPermissions = membro.permissions && membro.permissions.length > 0;
        const hasValidEmail = membro.email && membro.email.length > 0;
        
        // ⭐ NOVO: Perfil deve ter pelo menos UMA role OU permission E email válido
        // Profiles órfãos sem nenhum dos dois são removidos da lista
        return (hasRoles || hasPermissions) && hasValidEmail;
      }
      return true;
    });
    
    console.log('📊 Membros Unificados:', {
      total: membrosValidos.length,
      operacional: membrosValidos.filter(m => m.tipo_membro === 'operacional').length,
      sistema: membrosValidos.filter(m => m.tipo_membro === 'sistema').length,
      ambos: membrosValidos.filter(m => m.tipo_membro === 'ambos').length,
      filtrados: unificados.length - membrosValidos.length
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

  // Handler de exclusão
  const handleConfirmarExclusao = async () => {
    if (!membroParaExcluir) return;

    // 🔒 PROTEÇÃO: Bloquear exclusão do admin principal
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
        // Revogar acesso ao sistema
        const { data, error } = await supabase.functions.invoke('excluir-usuario', {
          body: { user_id: membroParaExcluir.id }
        });
        
        // ⭐ CORREÇÃO: Verificar tanto error quanto data?.error
        if (error && !error.message?.includes('User not found')) {
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }

        // Remover cadastro operacional
        if (membroParaExcluir.operacional_id) {
          await excluirOperacional.mutateAsync(membroParaExcluir.operacional_id);
        }

        // ⭐ Forçar invalidação e refetch imediato
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
        
        // ⭐ CORREÇÃO: Verificar tanto error quanto data?.error
        if (error && !error.message?.includes('User not found')) {
          throw error;
        }
        
        if (data?.error) {
          throw new Error(data.error);
        }

        // ⭐ Forçar invalidação e refetch imediato
        await queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
        await queryClient.refetchQueries({ queryKey: ['profiles-equipe'] });
        
        toast({
          title: 'Sucesso',
          description: 'Acesso ao sistema revogado'
        });
      } else {
        // Para membros "operacional" (apenas operacional, sem sistema)
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
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Ocorreu um erro ao excluir o membro.',
        variant: 'destructive'
      });
    }
  };

  // Filtrar membros localmente
  const membrosFiltrados = useMemo(() => {
    return membrosUnificados.filter(membro => {
      // Filtro de busca
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

      // Filtro de tipo de membro
      if (filtros.tipoMembro !== 'todos' && membro.tipo_membro !== filtros.tipoMembro) {
        return false;
      }

      // Filtro de função
      if (filtros.funcao !== 'todas' && membro.funcao_principal !== filtros.funcao) {
        return false;
      }

      // Filtro de status
      if (filtros.status !== 'todos' && membro.status !== filtros.status) {
        return false;
      }

      return true;
    });
  }, [membrosUnificados, searchTerm, filtros]);

  // Obter funções únicas para o filtro
  const funcoesUnicas = useMemo(() => {
    return Array.from(new Set(membrosUnificados.map(m => m.funcao_principal))).sort();
  }, [membrosUnificados]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: membrosUnificados.length,
      sistema: membrosUnificados.filter((m: any) => m.tipo_membro === 'sistema').length,
      operacional: membrosUnificados.filter((m: any) => m.tipo_membro === 'operacional').length,
      ambos: membrosUnificados.filter((m: any) => m.tipo_membro === 'ambos').length,
    };
  }, [membrosUnificados]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            Membros da Equipe
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestão unificada de equipe operacional e usuários do sistema
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Card Principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">Todos os Membros</CardTitle>
            <Button onClick={() => setNovoDialogOpen(true)} className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden xs:inline">Novo Membro Operacional</span>
              <span className="xs:hidden">Novo</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca e Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 sm:h-10 text-sm"
              />
            </div>
            <EquipeFiltersPopover
              filtros={filtros}
              onFiltrosChange={setFiltros}
              funcoes={funcoesUnicas}
            />
          </div>

          {/* Contagem de Resultados */}
          <div className="flex items-center justify-between py-2 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{membrosFiltrados.length}</span> de{' '}
              <span className="font-medium">{stats.total}</span> membros
            </p>
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NovoOperacionalSheet
        open={novoDialogOpen}
        onOpenChange={setNovoDialogOpen}
      />

      {membroSelecionado?.tipo_membro !== 'sistema' && membroSelecionado && (
        <DetalhesOperacionalSheet
          operacional={membroSelecionado as any}
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
          operacional={editarMembro as any}
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
