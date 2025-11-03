import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissionsCache } from '@/hooks/usePermissionsCache';
import { permissionsPresets, PresetType } from '@/lib/permissionsPresets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface GerenciarPermissoesMembroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membro: any;
}

export function GerenciarPermissoesMembroDialog({
  open,
  onOpenChange,
  membro
}: GerenciarPermissoesMembroDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Cache global de permissões
  const { data: permissions = [], isLoading: loadingPermissions } = usePermissionsCache();

  // Buscar permissões atuais do membro
  const { data: membroPermsData = [], isLoading: loadingMemberPerms } = useQuery({
    queryKey: ['user-permissions', membro?.id],
    enabled: open && !!membro?.id,
    queryFn: async () => {
      // ⭐ USAR O ID CORRETO baseado no tipo de membro
      const userId = membro!.profile_id || membro!.id;
      
      console.log('🔍 Buscando permissões para:', {
        nome: membro!.nome,
        tipo: membro!.tipo_membro,
        userId: userId,
        profile_id: membro!.profile_id,
        id: membro!.id
      });

      const { data, error } = await supabase
        .from('user_permissions')
        .select('permission_id')
        .eq('user_id', userId);

      if (error) throw error;
      
      console.log('✅ Permissões encontradas:', data?.length || 0);
      return data?.map(p => p.permission_id) || [];
    }
  });

  // Atualizar estado local quando carregar permissões do membro
  useEffect(() => {
    if (open && membroPermsData) {
      setPermissoesSelecionadas(membroPermsData);
    }
  }, [open, membroPermsData]);

  // Resetar busca ao fechar
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setShowSuggestions(false);
    }
  }, [open]);

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

  // Calcular progresso
  const progressPercentage = useMemo(() => {
    if (permissions.length === 0) return 0;
    return Math.round((permissoesSelecionadas.length / permissions.length) * 100);
  }, [permissoesSelecionadas.length, permissions.length]);

  // Toggle permissão individual
  const togglePermission = (permissionId: string) => {
    setPermissoesSelecionadas(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Toggle categoria completa
  const toggleCategoria = (categoria: string) => {
    const permsNaCategoria = permissions
      .filter(p => p.categoria === categoria)
      .map(p => p.id);
    
    const todasSelecionadas = permsNaCategoria.every(id => 
      permissoesSelecionadas.includes(id)
    );

    if (todasSelecionadas) {
      setPermissoesSelecionadas(prev => 
        prev.filter(id => !permsNaCategoria.includes(id))
      );
    } else {
      setPermissoesSelecionadas(prev => 
        Array.from(new Set([...prev, ...permsNaCategoria]))
      );
    }
  };

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
      // ⭐ USAR O ID CORRETO baseado no tipo de membro
      const userId = membro.profile_id || membro.id;
      
      console.log('💾 Salvando permissões:', {
        nome: membro.nome,
        tipo: membro.tipo_membro,
        userId: userId,
        total: permissoesSelecionadas.length
      });

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
              user_id: userId, // ✅ ID correto
              permission_id: permId
            }))
          );

        if (error) throw error;
      }
      
      console.log('✅ Permissões salvas com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: 'Permissões atualizadas!',
        description: `${permissoesSelecionadas.length} permissões configuradas com sucesso.`
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao salvar permissões',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const isLoading = loadingPermissions || loadingMemberPerms;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-3 p-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">Permissões - {membro?.nome}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="font-mono">
                      {permissoesSelecionadas.length}/{permissions.length}
                    </Badge>
                    <span className="text-xs">permissões ativas</span>
                  </DialogDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>

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
              </div>
            </DialogHeader>

            {showSuggestions && (
              <div className="px-6 pb-4">
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
              </div>
            )}

            <ScrollArea className="h-[50vh] px-6">
              <Accordion 
                type="multiple" 
                defaultValue={permissionsGrouped.map(g => g.categoria)}
                className="space-y-2 pb-4"
              >
                {permissionsGrouped.map((group) => (
                  <AccordionItem 
                    key={group.categoria} 
                    value={group.categoria}
                    className="border rounded-lg"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-accent/50 rounded-t-lg">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={group.selectedCount === group.totalCount && group.totalCount > 0}
                            onCheckedChange={() => toggleCategoria(group.categoria)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-medium">{group.categoria}</span>
                        </div>
                        <Badge variant={group.selectedCount > 0 ? "default" : "secondary"}>
                          {group.selectedCount}/{group.totalCount}
                        </Badge>
                      </div>
                    </AccordionTrigger>
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

            <DialogFooter className="flex items-center justify-between p-6 pt-4 border-t">
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => salvarMutation.mutate()}
                  disabled={salvarMutation.isPending || permissoesSelecionadas.length === 0}
                >
                  {salvarMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Salvar
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
