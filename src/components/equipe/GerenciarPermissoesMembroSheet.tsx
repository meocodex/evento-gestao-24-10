import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissionsCache } from '@/hooks/usePermissionsCache';
import { permissionsPresets, PresetType } from '@/lib/permissionsPresets';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Search, CheckSquare, XCircle, HelpCircle, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormSheet } from '@/components/shared/sheets';
import { useSheetState } from '@/components/shared/sheets/useSheetState';

interface GerenciarPermissoesMembroSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro: any;
}

export function GerenciarPermissoesMembroSheet({
  open,
  onOpenChange,
  membro
}: GerenciarPermissoesMembroSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Ref para evitar loops no useEffect
  const previousPermsRef = useRef<string[]>([]);

  const { close } = useSheetState({
    onClose: () => {
      setSearchTerm('');
      setShowSuggestions(false);
      onOpenChange(false);
    },
  });

  // Cache global de permissões
  const { data: permissions = [], isLoading: loadingPermissions } = usePermissionsCache();

  // Buscar permissões atuais do membro
  const { data: membroPermsData = [], isLoading: loadingMemberPerms } = useQuery({
    queryKey: ['user-permissions', membro?.id],
    enabled: open && !!membro?.id,
    queryFn: async () => {
      const userId = membro!.profile_id || membro!.id;

      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_id')
        .eq('user_id', userId);

      if (error) throw error;
      
      return data?.map(p => p.permission_id) || [];
    }
  });

  // Buscar roles atuais do membro
  const { data: membroRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['user-roles', membro?.id],
    enabled: open && !!membro?.id,
    queryFn: async () => {
      const userId = membro!.profile_id || membro!.id;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    }
  });

  // Atualizar estado local quando carregar permissões do membro
  useEffect(() => {
    if (open && membroPermsData) {
      // Comparar com valor anterior usando ref (não causa re-render)
      const permsString = JSON.stringify([...membroPermsData].sort());
      const previousString = JSON.stringify([...previousPermsRef.current].sort());
      
      if (permsString !== previousString) {
        console.log('🔄 Atualizando permissões do membro:', membroPermsData.length);
        setPermissoesSelecionadas(membroPermsData);
        previousPermsRef.current = membroPermsData; // Salvar referência
      }
    }
  }, [open, membroPermsData]); // Não incluir permissoesSelecionadas!
  
  // Debug render
  useEffect(() => {
    console.log('🔍 GerenciarPermissoesMembroSheet render:', {
      open,
      membroId: membro?.id,
      permsCount: permissoesSelecionadas.length,
      membroPermsDataCount: membroPermsData?.length
    });
  }, [open, membro?.id, permissoesSelecionadas.length, membroPermsData?.length]);

  // Agrupar permissões por categoria com filtro de busca
  const permissionsGrouped = useMemo(() => {
    const filtered = permissions.filter(p =>
      debouncedSearch === '' ||
      p.descricao.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.modulo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.acao.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const categorias = Array.from(new Set(filtered.map(p => p.categoria)));
    
    return categorias.map(cat => ({
      categoria: cat,
      permissions: filtered.filter(p => p.categoria === cat),
      selectedCount: filtered.filter(p => p.categoria === cat && permissoesSelecionadas.includes(p.id)).length,
      totalCount: filtered.filter(p => p.categoria === cat).length
    })).filter(group => group.permissions.length > 0);
  }, [permissions, debouncedSearch, permissoesSelecionadas]);

  // Categorias visíveis baseadas nas permissões filtradas
  const visibleCategories = useMemo(() => {
    return Array.from(new Set(permissionsGrouped.map(g => g.categoria)));
  }, [permissionsGrouped]);

  // Inicializar categorias expandidas quando abrir a sheet
  useEffect(() => {
    if (open && expandedCategories.length === 0 && visibleCategories.length > 0) {
      setExpandedCategories(visibleCategories);
    }
  }, [open, visibleCategories, expandedCategories.length]);

  // Calcular progresso
  const progressPercentage = useMemo(() => {
    if (permissions.length === 0) return 0;
    return Math.round((permissoesSelecionadas.length / permissions.length) * 100);
  }, [permissoesSelecionadas.length, permissions.length]);

  // Toggle permissão individual
  // Memoizar função de toggle para evitar re-criação
  const togglePermission = useCallback((permissionId: string) => {
    setPermissoesSelecionadas(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  }, []);

  // Toggle categoria completa - memoizado
  const toggleCategoria = useCallback((categoria: string) => {
    const permsNaCategoria = permissions
      .filter(p => p.categoria === categoria)
      .map(p => p.id);
    
    setPermissoesSelecionadas(prev => {
      const todasSelecionadas = permsNaCategoria.every(id => prev.includes(id));
      
      if (todasSelecionadas) {
        return prev.filter(id => !permsNaCategoria.includes(id));
      } else {
        return Array.from(new Set([...prev, ...permsNaCategoria]));
      }
    });
  }, [permissions]);

  // Selecionar todas
  const selecionarTodas = () => {
    setPermissoesSelecionadas(permissions.map(p => p.id));
  };

  // Limpar todas
  const limparTodas = () => {
    setPermissoesSelecionadas([]);
  };

  // Aplicar preset
  const aplicarPreset = (tipo: PresetType) => {
    const preset = permissionsPresets[tipo];
    const validPermissions = preset.permissions.filter(pId => 
      permissions.some(p => p.id === pId)
    );
    
    setPermissoesSelecionadas(validPermissions);
    setShowSuggestions(false);
    
    toast({
      title: `Preset "${preset.label}" aplicado`,
      description: `${validPermissions.length} permissões selecionadas`
    });
  };

  // Mutation para salvar permissões
  const salvarMutation = useMutation({
    mutationFn: async () => {
      const userId = membro.profile_id || membro.id;

      // Deletar permissões antigas
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId);

      // Inserir novas permissões
      if (permissoesSelecionadas.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(
            permissoesSelecionadas.map(permId => ({
              user_id: userId,
              permission_id: permId
            }))
          );

        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidar apenas queries específicas deste usuário
      const userId = membro.profile_id || membro.id;
      queryClient.invalidateQueries({ queryKey: ['user-permissions', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
      
      // Delay na invalidação global para evitar re-fetch imediato
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['profiles-equipe'] });
      }, 500);
      
      toast({
        title: 'Permissões atualizadas!',
        description: `${permissoesSelecionadas.length} permissões configuradas com sucesso.`
      });
      close();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar permissões',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const isLoading = loadingPermissions || loadingMemberPerms || loadingRoles;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permissoesSelecionadas.length === 0) return;
    salvarMutation.mutate();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Permissões - ${membro?.nome || ''}`}
      description={`${permissoesSelecionadas.length}/${permissions.length} permissões ativas`}
      onSubmit={handleFormSubmit}
      submitText="Salvar"
      isLoading={salvarMutation.isPending}
      size="xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card de Funções Atribuídas */}
          {membroRoles.length > 0 && (
            <Alert>
              <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
                Funções Atribuídas
              </AlertTitle>
              <AlertDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  {membroRoles.map((role: string) => {
                    const roleInfo: Record<string, { label: string; icon: string }> = {
                      'admin': { label: 'Administrador', icon: '👑' },
                      'comercial': { label: 'Comercial', icon: '🎯' },
                      'suporte': { label: 'Suporte', icon: '🔧' },
                      'operacional': { label: 'Operacional', icon: '👷' },
                      'financeiro': { label: 'Financeiro', icon: '💰' },
                    };
                    const info = roleInfo[role];
                    return info ? (
                      <Badge key={role} variant="secondary" className="text-sm">
                        <span className="mr-1">{info.icon}</span>
                        {info.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  As funções são gerenciadas ao conceder acesso. Para alterar as funções, é necessário conceder acesso novamente.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <Progress value={progressPercentage} className="h-2" />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar permissões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button size="sm" variant="outline" onClick={selecionarTodas}>
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={limparTodas}>
              <XCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowSuggestions(!showSuggestions)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {showSuggestions && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Sugestões Rápidas</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                  {Object.entries(permissionsPresets).map(([key, preset]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      className="justify-start"
                      onClick={() => aplicarPreset(key as PresetType)}
                    >
                      <span className="mr-1">{preset.icon}</span>
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <ScrollArea className="h-[50vh]">
            <Accordion 
              type="multiple" 
              value={expandedCategories}
              onValueChange={setExpandedCategories}
              className="space-y-2"
            >
              {permissionsGrouped.map((group) => (
                <AccordionItem 
                  key={group.categoria} 
                  value={group.categoria}
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center gap-0">
                      {/* Checkbox separado do trigger */}
                      <div 
                        className="px-4 py-3 hover:bg-accent/50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoria(group.categoria);
                        }}
                      >
                        <Checkbox
                          checked={group.selectedCount === group.totalCount && group.totalCount > 0}
                          onCheckedChange={() => toggleCategoria(group.categoria)}
                        />
                      </div>
                      
                      {/* Trigger sem checkbox */}
                      <AccordionTrigger className="flex-1 px-4 hover:no-underline hover:bg-accent/50">
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium">{group.categoria}</span>
                          <Badge variant={group.selectedCount > 0 ? "default" : "secondary"}>
                            {group.selectedCount}/{group.totalCount}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                    </div>
                    
                    <AccordionContent className="px-4 pb-4">
                    <div className="space-y-1 mt-2">
                      {group.permissions.map((p) => (
                        <div
                          key={p.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors",
                            permissoesSelecionadas.includes(p.id) && "bg-primary/5 ring-1 ring-primary/10"
                          )}
                          onClick={() => togglePermission(p.id)}
                        >
                          <Checkbox checked={permissoesSelecionadas.includes(p.id)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.descricao}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.modulo} • {p.acao}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>

            {permissionsGrouped.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma permissão encontrada</p>
              </div>
            )}
          </ScrollArea>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {permissoesSelecionadas.length === 0 ? (
              <>
                <AlertCircle className="h-4 w-4 text-destructive" />
                Selecione ao menos 1 permissão
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {permissoesSelecionadas.length} selecionadas
              </>
            )}
          </div>
        </div>
      )}
    </FormSheet>
  );
}
