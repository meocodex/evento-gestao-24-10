import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Eye, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContratos } from '@/contexts/ContratosContext';
import { NovoContratoDialog } from '@/components/contratos/NovoContratoDialog';
import { DetalhesContratoDialog } from '@/components/contratos/DetalhesContratoDialog';
import { EditarContratoDialog } from '@/components/contratos/EditarContratoDialog';
import { NovoTemplateDialog } from '@/components/contratos/NovoTemplateDialog';
import { DetalhesTemplateDialog } from '@/components/contratos/DetalhesTemplateDialog';
import { EditarTemplateDialog } from '@/components/contratos/EditarTemplateDialog';
import { SimularAssinaturaDialog } from '@/components/contratos/SimularAssinaturaDialog';
import { Contrato, ContratoTemplate } from '@/types/contratos';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Contratos() {
  const { contratos, templates } = useContratos();
  
  const [searchContratos, setSearchContratos] = useState('');
  const [searchTemplates, setSearchTemplates] = useState('');
  
  const [novoContratoOpen, setNovoContratoOpen] = useState(false);
  const [detalhesContratoOpen, setDetalhesContratoOpen] = useState(false);
  const [editarContratoOpen, setEditarContratoOpen] = useState(false);
  const [novoTemplateOpen, setNovoTemplateOpen] = useState(false);
  const [detalhesTemplateOpen, setDetalhesTemplateOpen] = useState(false);
  const [editarTemplateOpen, setEditarTemplateOpen] = useState(false);
  const [simularAssinaturaOpen, setSimularAssinaturaOpen] = useState(false);
  
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [templateSelecionado, setTemplateSelecionado] = useState<ContratoTemplate | null>(null);

  const contratosFiltrados = useMemo(() => {
    return contratos.filter(c => 
      c.titulo.toLowerCase().includes(searchContratos.toLowerCase()) ||
      c.numero.toLowerCase().includes(searchContratos.toLowerCase())
    );
  }, [contratos, searchContratos]);

  const templatesFiltrados = useMemo(() => {
    return templates.filter(t => 
      t.nome.toLowerCase().includes(searchTemplates.toLowerCase()) ||
      t.descricao.toLowerCase().includes(searchTemplates.toLowerCase())
    );
  }, [templates, searchTemplates]);

  const statusColors = {
    rascunho: 'bg-gray-500',
    em_revisao: 'bg-blue-500',
    aguardando_assinatura: 'bg-yellow-500',
    assinado: 'bg-green-500',
    cancelado: 'bg-red-500',
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">Gestão de contratos e templates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setNovoTemplateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
            <Button onClick={() => setNovoContratoOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contratos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Assinados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {contratos.filter(c => c.status === 'assinado').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {contratos.filter(c => c.status === 'aguardando_assinatura').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="contratos">
          <TabsList>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="contratos" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contratos..."
                  value={searchContratos}
                  onChange={(e) => setSearchContratos(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-4">
              {contratosFiltrados.map((contrato) => (
                <Card key={contrato.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{contrato.titulo}</CardTitle>
                          <p className="text-sm text-muted-foreground">{contrato.numero}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[contrato.status]}>
                          {contrato.status.replace('_', ' ')}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setContratoSelecionado(contrato);
                              setDetalhesContratoOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {(contrato.status === 'rascunho' || contrato.status === 'em_revisao') && (
                              <DropdownMenuItem onClick={() => {
                                setContratoSelecionado(contrato);
                                setEditarContratoOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span> {contrato.tipo}
                      </div>
                      {contrato.valor && (
                        <div>
                          <span className="text-muted-foreground">Valor:</span> R$ {contrato.valor.toLocaleString()}
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Assinaturas:</span>{' '}
                        {contrato.assinaturas.filter(a => a.assinado).length}/{contrato.assinaturas.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {contratosFiltrados.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contrato encontrado</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTemplates}
                  onChange={(e) => setSearchTemplates(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templatesFiltrados.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{template.descricao}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setTemplateSelecionado(template);
                            setDetalhesTemplateOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setTemplateSelecionado(template);
                            setEditarTemplateOpen(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">{template.tipo}</Badge>
                      <Badge variant={template.status === 'ativo' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        v{template.versao}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templatesFiltrados.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum template encontrado</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <NovoContratoDialog open={novoContratoOpen} onOpenChange={setNovoContratoOpen} />
      <DetalhesContratoDialog
        open={detalhesContratoOpen}
        onOpenChange={setDetalhesContratoOpen}
        contrato={contratoSelecionado}
        onEdit={() => {
          setDetalhesContratoOpen(false);
          setEditarContratoOpen(true);
        }}
      />
      <EditarContratoDialog
        open={editarContratoOpen}
        onOpenChange={setEditarContratoOpen}
        contrato={contratoSelecionado}
      />
      <NovoTemplateDialog open={novoTemplateOpen} onOpenChange={setNovoTemplateOpen} />
      <DetalhesTemplateDialog
        open={detalhesTemplateOpen}
        onOpenChange={setDetalhesTemplateOpen}
        template={templateSelecionado}
        onEdit={() => {
          setDetalhesTemplateOpen(false);
          setEditarTemplateOpen(true);
        }}
      />
      <EditarTemplateDialog
        open={editarTemplateOpen}
        onOpenChange={setEditarTemplateOpen}
        template={templateSelecionado}
      />
      <SimularAssinaturaDialog
        open={simularAssinaturaOpen}
        onOpenChange={setSimularAssinaturaOpen}
        contrato={contratoSelecionado}
      />
    </div>
  );
}
