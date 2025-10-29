import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Search, Plus, UserCheck, Briefcase, UserX } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { MembrosUnificadosVirtualList } from '@/components/equipe/MembrosUnificadosVirtualList';
import { NovoOperacionalDialog } from '@/components/equipe/operacional/NovoOperacionalDialog';
import { DetalhesOperacionalDialog } from '@/components/equipe/operacional/DetalhesOperacionalDialog';
import { EditarOperacionalDialog } from '@/components/equipe/operacional/EditarOperacionalDialog';
import { ConcederAcessoSistemaDialog } from '@/components/equipe/ConcederAcessoSistemaDialog';
import { GerenciarPermissoesMembroDialog } from '@/components/equipe/GerenciarPermissoesMembroDialog';
import { EquipeFiltersPopover, EquipeFiltersType } from '@/components/equipe/EquipeFiltersPopover';
import { StatCard } from '@/components/dashboard/StatCard';
import { MembroEquipeUnificado } from '@/types/equipe';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Equipe() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const { operacionais = [], data: profiles = [], isLoading: loadingMembros, excluirOperacional } = useEquipe(page, pageSize, {}, true);
  
  const membrosUnificados = useMemo(() => {
    const unificados: any[] = [...operacionais.map(op => ({ 
      ...op, 
      tipo_membro: 'operacional' as const,
      avatar_url: op.foto || null
    }))];
    profiles.forEach(p => {
      if (!operacionais.find(op => op.email === p.email)) {
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
          role: p.role,
          permissions: p.permissions
        });
      }
    });
    return unificados;
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

    try {
      if (membroParaExcluir.tipo_membro === 'sistema' || membroParaExcluir.tipo_membro === 'ambos') {
        const { error } = await supabase.functions.invoke('excluir-usuario', {
          body: { user_id: membroParaExcluir.id }
        });
        
        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
        queryClient.invalidateQueries({ queryKey: ['equipe-operacional'] });
      } else {
        await excluirOperacional.mutateAsync(membroParaExcluir.id);
      }

      toast({
        title: 'Membro excluído',
        description: `${membroParaExcluir.nome} foi removido com sucesso.`
      });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Membros da Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão unificada de equipe operacional e usuários do sistema
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Membros</CardTitle>
            <Button onClick={() => setNovoDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro Operacional
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca e Filtros */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NovoOperacionalDialog
        open={novoDialogOpen}
        onOpenChange={setNovoDialogOpen}
      />

      {membroSelecionado?.tipo_membro !== 'sistema' && membroSelecionado && (
        <DetalhesOperacionalDialog
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
        <EditarOperacionalDialog
          operacional={editarMembro as any}
          open={!!editarMembro}
          onOpenChange={(open) => !open && setEditarMembro(null)}
        />
      )}

      <ConcederAcessoSistemaDialog
        open={!!concederAcessoMembro}
        onOpenChange={(open) => !open && setConcederAcessoMembro(null)}
        membro={concederAcessoMembro}
      />

      <GerenciarPermissoesMembroDialog
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
