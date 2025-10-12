import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Eye, Edit, MoreVertical, FileSignature, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { useContratos } from '@/contexts/ContratosContext';
import { NovoContratoSheet } from '@/components/contratos/NovoContratoSheet';
import { EditarContratoDialog } from '@/components/contratos/EditarContratoDialog';
import { DetalhesContratoDialog } from '@/components/contratos/DetalhesContratoDialog';
import { NovoTemplateDialog } from '@/components/contratos/NovoTemplateDialog';
import { EditarTemplateDialog } from '@/components/contratos/EditarTemplateDialog';
import { DetalhesTemplateDialog } from '@/components/contratos/DetalhesTemplateDialog';
import { SimularAssinaturaDialog } from '@/components/contratos/SimularAssinaturaDialog';
import { NovaPropostaDialog } from '@/components/propostas/NovaPropostaDialog';
import { ConverterContratoDialog } from '@/components/propostas/ConverterContratoDialog';
import { Contrato, ContratoTemplate, StatusContrato } from '@/types/contratos';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Contratos() {
  const { contratos, templates } = useContratos();
  
  const [searchContratos, setSearchContratos] = useState('');
  const [searchTemplates, setSearchTemplates] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  
  const [mostrarNovoContrato, setMostrarNovoContrato] = useState(false);
  const [mostrarNovaProposta, setMostrarNovaProposta] = useState(false);
  const [mostrarNovoTemplate, setMostrarNovoTemplate] = useState(false);
  const [mostrarDetalhesContrato, setMostrarDetalhesContrato] = useState(false);
  const [mostrarDetalhesTemplate, setMostrarDetalhesTemplate] = useState(false);
  const [mostrarEditarContrato, setMostrarEditarContrato] = useState(false);
  const [mostrarEditarTemplate, setMostrarEditarTemplate] = useState(false);
  const [mostrarSimularAssinatura, setMostrarSimularAssinatura] = useState(false);
  const [mostrarConverterContrato, setMostrarConverterContrato] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [templateSelecionado, setTemplateSelecionado] = useState<ContratoTemplate | null>(null);

  const contratosFiltrados = useMemo(() => {
    let filtered = contratos.filter(c => 
      c.titulo.toLowerCase().includes(searchContratos.toLowerCase()) ||
      c.numero.toLowerCase().includes(searchContratos.toLowerCase())
    );

    if (filtroStatus === 'propostas') {
      filtered = filtered.filter(c => ['proposta', 'em_negociacao', 'aprovada'].includes(c.status));
    } else if (filtroStatus === 'contratos') {
      filtered = filtered.filter(c => ['rascunho', 'em_revisao', 'aguardando_assinatura', 'assinado'].includes(c.status));
    } else if (filtroStatus !== 'todos') {
      filtered = filtered.filter(c => c.status === filtroStatus);
    }

    return filtered;
  }, [contratos, searchContratos, filtroStatus]);

  const templatesFiltrados = useMemo(() => {
    return templates.filter(t => 
      t.nome.toLowerCase().includes(searchTemplates.toLowerCase()) ||
      t.descricao.toLowerCase().includes(searchTemplates.toLowerCase())
    );
  }, [templates, searchTemplates]);

  const statusColors: Record<StatusContrato, string> = {
    proposta: 'bg-blue-500',
    em_negociacao: 'bg-purple-500',
    aprovada: 'bg-green-500',
    rascunho: 'bg-gray-500',
    em_revisao: 'bg-blue-500',
    aguardando_assinatura: 'bg-yellow-500',
    assinado: 'bg-green-500',
    cancelado: 'bg-red-500',
    expirado: 'bg-gray-400',
  };

  const statusLabels: Record<StatusContrato, string> = {
    proposta: 'Proposta',
    em_negociacao: 'Em Negociação',
    aprovada: 'Aprovada',
    rascunho: 'Rascunho',
    em_revisao: 'Em Revisão',
    aguardando_assinatura: 'Aguardando Assinatura',
    assinado: 'Assinado',
    cancelado: 'Cancelado',
    expirado: 'Expirado',
  };

  const totalPropostas = contratos.filter(c => ['proposta', 'em_negociacao', 'aprovada'].includes(c.status)).length;

  return (
    <div className="min-h-screen p-6 bg-navy-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 dark:text-navy-50">Contratos & Propostas</h1>
            <p className="text-navy-600 dark:text-navy-400 mt-1">Gestão de propostas comerciais, contratos e templates</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setMostrarNovaProposta(true)}>
              <FileText className="h-4 w-4" />
              Nova Proposta
            </Button>
            <Button onClick={() => setMostrarNovoContrato(true)} variant="outline">
              <FileSignature className="h-4 w-4" />
              Novo Contrato
            </Button>
            <Button onClick={() => setMostrarNovoTemplate(true)} variant="outline">
              <FileSignature className="h-4 w-4" />
              Novo Template
            </Button>
          </div>
        </div>

        {/* Stats Cards Navy */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Propostas"
            value={totalPropostas}
            icon={FileText}
            variant="primary"
          />
          <StatCard
            title="Assinados"
            value={contratos.filter(c => c.status === 'assinado').length}
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Aguardando"
            value={contratos.filter(c => c.status === 'aguardando_assinatura').length}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Templates"
            value={templates.length}
            icon={FileSignature}
            variant="default"
          />
        </div>

        {/* Tabs Navy-themed */}
        <Tabs defaultValue="contratos" className="space-y-4">
          <TabsList className="bg-navy-100 dark:bg-navy-900">
            <TabsTrigger value="contratos" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              Contratos & Propostas
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contratos" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contratos e propostas..."
                  value={searchContratos}
                  onChange={(e) => setSearchContratos(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="propostas">📄 Propostas</SelectItem>
                  <SelectItem value="contratos">📜 Contratos</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="assinado">Assinado</SelectItem>
                  <SelectItem value="aguardando_assinatura">Aguardando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {contratosFiltrados.map((contrato) => {
                const isProposta = ['proposta', 'em_negociacao', 'aprovada'].includes(contrato.status);
                const Icon = isProposta ? FileText : FileSignature;
                
                return (
                  <Card key={contrato.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{contrato.titulo}</CardTitle>
                            <p className="text-sm text-muted-foreground">{contrato.numero}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[contrato.status]}>
                            {statusLabels[contrato.status]}
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
                                setMostrarDetalhesContrato(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {(contrato.status === 'rascunho' || contrato.status === 'em_revisao' || contrato.status === 'proposta') && (
                                <DropdownMenuItem onClick={() => {
                                  setContratoSelecionado(contrato);
                                  setMostrarEditarContrato(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {contrato.status === 'aprovada' && (
                                <DropdownMenuItem onClick={() => {
                                  setContratoSelecionado(contrato);
                                  setMostrarConverterContrato(true);
                                }}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Converter em Contrato
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
                          <span className="text-muted-foreground">Tipo:</span>{' '}
                          <span className="capitalize">{contrato.tipo}</span>
                        </div>
                        {contrato.valor && (
                          <div>
                            <span className="text-muted-foreground">Valor:</span>{' '}
                            {contrato.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        )}
                        {isProposta && contrato.itens && (
                          <div>
                            <span className="text-muted-foreground">Itens:</span> {contrato.itens.length}
                          </div>
                        )}
                        {!isProposta && (
                          <div>
                            <span className="text-muted-foreground">Assinaturas:</span>{' '}
                            {contrato.assinaturas.filter(a => a.assinado).length}/{contrato.assinaturas.length}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {contratosFiltrados.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contrato ou proposta encontrado</p>
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
                            setMostrarDetalhesTemplate(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setTemplateSelecionado(template);
                            setMostrarEditarTemplate(true);
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
                      {template.papelTimbrado && (
                        <Badge variant="outline">
                          📄 Com Timbrado
                        </Badge>
                      )}
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
      <NovoContratoSheet open={mostrarNovoContrato} onOpenChange={setMostrarNovoContrato} />
      <NovaPropostaDialog open={mostrarNovaProposta} onOpenChange={setMostrarNovaProposta} />
      <DetalhesContratoDialog
        open={mostrarDetalhesContrato}
        onOpenChange={setMostrarDetalhesContrato}
        contrato={contratoSelecionado}
        onEdit={() => {
          setMostrarDetalhesContrato(false);
          setMostrarEditarContrato(true);
        }}
        onConverter={() => {
          setMostrarDetalhesContrato(false);
          setMostrarConverterContrato(true);
        }}
      />
      <EditarContratoDialog
        open={mostrarEditarContrato}
        onOpenChange={setMostrarEditarContrato}
        contrato={contratoSelecionado}
      />
      <NovoTemplateDialog open={mostrarNovoTemplate} onOpenChange={setMostrarNovoTemplate} />
      <DetalhesTemplateDialog
        open={mostrarDetalhesTemplate}
        onOpenChange={setMostrarDetalhesTemplate}
        template={templateSelecionado}
        onEdit={() => {
          setMostrarDetalhesTemplate(false);
          setMostrarEditarTemplate(true);
        }}
      />
      <EditarTemplateDialog
        open={mostrarEditarTemplate}
        onOpenChange={setMostrarEditarTemplate}
        template={templateSelecionado}
      />
      <SimularAssinaturaDialog
        open={mostrarSimularAssinatura}
        onOpenChange={setMostrarSimularAssinatura}
        contrato={contratoSelecionado}
      />
      <ConverterContratoDialog
        open={mostrarConverterContrato}
        onOpenChange={setMostrarConverterContrato}
        contrato={contratoSelecionado}
      />
    </div>
  );
}