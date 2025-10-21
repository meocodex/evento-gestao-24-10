import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserCog, Calendar, Search, Plus } from 'lucide-react';
import { useEquipe } from '@/contexts/EquipeContext';
import { OperacionalCard } from '@/components/equipe/operacional/OperacionalCard';
import { NovoOperacionalDialog } from '@/components/equipe/operacional/NovoOperacionalDialog';
import { DetalhesOperacionalDialog } from '@/components/equipe/operacional/DetalhesOperacionalDialog';
import { EditarOperacionalDialog } from '@/components/equipe/operacional/EditarOperacionalDialog';
import { OperacionalEquipe } from '@/types/equipe';
import { GerenciarUsuarios } from '@/components/configuracoes/GerenciarUsuarios';

export default function Equipe() {
  const { operacionais, loading } = useEquipe();
  const [searchTerm, setSearchTerm] = useState('');
  const [funcaoFilter, setFuncaoFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('ativo');
  
  const [novoDialogOpen, setNovoDialogOpen] = useState(false);
  const [detalhesOperacional, setDetalhesOperacional] = useState<OperacionalEquipe | null>(null);
  const [editarOperacional, setEditarOperacional] = useState<OperacionalEquipe | null>(null);

  // Filtrar operacionais
  const operacionaisFiltrados = operacionais.filter((op) => {
    const matchSearch = op.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       op.telefone.includes(searchTerm) ||
                       (op.cpf && op.cpf.includes(searchTerm));
    const matchFuncao = funcaoFilter === 'todos' || op.funcao_principal === funcaoFilter;
    const matchTipo = tipoFilter === 'todos' || op.tipo_vinculo === tipoFilter;
    const matchStatus = statusFilter === 'todos' || op.status === statusFilter;

    return matchSearch && matchFuncao && matchTipo && matchStatus;
  });

  // Obter funções únicas para o filtro
  const funcoesUnicas = Array.from(new Set(operacionais.map(op => op.funcao_principal))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Equipe</h1>
      </div>
        <Tabs defaultValue="operacional" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="operacional" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Operacional
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Usuários do Sistema
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          {/* Aba Operacional */}
          <TabsContent value="operacional" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equipe Operacional</CardTitle>
                  <Button onClick={() => setNovoDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, telefone ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={funcaoFilter} onValueChange={setFuncaoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Funções</SelectItem>
                      {funcoesUnicas.map(funcao => (
                        <SelectItem key={funcao} value={funcao}>
                          {funcao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Tipos</SelectItem>
                      <SelectItem value="clt">CLT</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="pj">PJ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativos</SelectItem>
                      <SelectItem value="inativo">Inativos</SelectItem>
                      <SelectItem value="bloqueado">Bloqueados</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grid de Cards */}
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : operacionaisFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum membro encontrado
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {operacionaisFiltrados.map((operacional) => (
                      <OperacionalCard
                        key={operacional.id}
                        operacional={operacional}
                        onDetalhes={() => setDetalhesOperacional(operacional)}
                        onEditar={() => setEditarOperacional(operacional)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Usuários do Sistema */}
          <TabsContent value="usuarios">
            <GerenciarUsuarios />
          </TabsContent>

          {/* Aba Calendário */}
          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Alocações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Em desenvolvimento...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <NovoOperacionalDialog
          open={novoDialogOpen}
          onOpenChange={setNovoDialogOpen}
        />

        {detalhesOperacional && (
          <DetalhesOperacionalDialog
            operacional={detalhesOperacional}
            open={!!detalhesOperacional}
            onOpenChange={(open) => !open && setDetalhesOperacional(null)}
            onEditar={() => {
              setEditarOperacional(detalhesOperacional);
              setDetalhesOperacional(null);
            }}
          />
        )}

        {editarOperacional && (
          <EditarOperacionalDialog
            operacional={editarOperacional}
            open={!!editarOperacional}
            onOpenChange={(open) => !open && setEditarOperacional(null)}
          />
        )}
    </div>
  );
}
