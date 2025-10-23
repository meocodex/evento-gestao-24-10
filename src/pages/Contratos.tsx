import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Edit, MoreVertical, FileSignature, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { useContratos } from '@/hooks/contratos';
import { gerarPDFContrato } from '@/utils/pdfGenerator';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContratosVirtualList } from '@/components/contratos/ContratosVirtualList';
import { TemplatesVirtualGrid } from '@/components/contratos/TemplatesVirtualGrid';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export default function Contratos() {
  const [pageContratos, setPageContratos] = useState(1);
  const [pageTemplates, setPageTemplates] = useState(1);
  const [pageSizeContratos] = useState(50);
  const [pageSizeTemplates] = useState(50);
  const [filtrosContratos, setFiltrosContratos] = useState<any>({});
  const [filtrosTemplates, setFiltrosTemplates] = useState<any>({});
  
  const {
    contratos,
    templates,
    loading,
    totalContratos,
    totalTemplates,
    excluirContrato,
    excluirTemplate,
  } = useContratos(
    pageContratos,
    pageSizeContratos,
    filtrosContratos,
    pageTemplates,
    pageSizeTemplates,
    filtrosTemplates
  );
  
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
  const [confirmExcluirContrato, setConfirmExcluirContrato] = useState(false);
  const [confirmExcluirTemplate, setConfirmExcluirTemplate] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [templateSelecionado, setTemplateSelecionado] = useState<ContratoTemplate | null>(null);

  // Debounce para filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosContratos({
        searchTerm: searchContratos,
        status: filtroStatus,
      });
      setPageContratos(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchContratos, filtroStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltrosTemplates({
        searchTerm: searchTemplates,
      });
      setPageTemplates(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTemplates]);

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
  const totalPagesContratos = Math.ceil(totalContratos / pageSizeContratos);
  const totalPagesTemplates = Math.ceil(totalTemplates / pageSizeTemplates);

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

            <ContratosVirtualList
              contratos={contratos}
              loading={loading}
              statusColors={statusColors}
              statusLabels={statusLabels}
              onDetalhes={(contrato) => {
                setContratoSelecionado(contrato);
                setMostrarDetalhesContrato(true);
              }}
              onEditar={(contrato) => {
                setContratoSelecionado(contrato);
                setMostrarEditarContrato(true);
              }}
              onConverter={(contrato) => {
                setContratoSelecionado(contrato);
                setMostrarConverterContrato(true);
              }}
              onExcluir={(contrato) => {
                setContratoSelecionado(contrato);
                setConfirmExcluirContrato(true);
              }}
            />

            {totalPagesContratos > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPageContratos(Math.max(1, pageContratos - 1))}
                      className={pageContratos === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPagesContratos) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPagesContratos > 5) {
                      if (pageContratos > 3) {
                        pageNum = pageContratos - 2 + i;
                      }
                      if (pageNum > totalPagesContratos - 2) {
                        pageNum = totalPagesContratos - 4 + i;
                      }
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPageContratos(pageNum)}
                          isActive={pageContratos === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPageContratos(Math.min(totalPagesContratos, pageContratos + 1))}
                      className={pageContratos === totalPagesContratos ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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
            <TemplatesVirtualGrid
              templates={templates}
              loading={loading}
              onDetalhes={(template) => {
                setTemplateSelecionado(template);
                setMostrarDetalhesTemplate(true);
              }}
              onEditar={(template) => {
                setTemplateSelecionado(template);
                setMostrarEditarTemplate(true);
              }}
              onExcluir={(template) => {
                setTemplateSelecionado(template);
                setConfirmExcluirTemplate(true);
              }}
            />

            {totalPagesTemplates > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPageTemplates(Math.max(1, pageTemplates - 1))}
                      className={pageTemplates === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPagesTemplates) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPagesTemplates > 5) {
                      if (pageTemplates > 3) {
                        pageNum = pageTemplates - 2 + i;
                      }
                      if (pageNum > totalPagesTemplates - 2) {
                        pageNum = totalPagesTemplates - 4 + i;
                      }
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPageTemplates(pageNum)}
                          isActive={pageTemplates === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPageTemplates(Math.min(totalPagesTemplates, pageTemplates + 1))}
                      className={pageTemplates === totalPagesTemplates ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
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

      <ConfirmDialog
        open={confirmExcluirContrato}
        onOpenChange={setConfirmExcluirContrato}
        onConfirm={() => {
          if (contratoSelecionado) {
            excluirContrato.mutate(contratoSelecionado.id);
            setConfirmExcluirContrato(false);
            setContratoSelecionado(null);
          }
        }}
        title="Excluir Contrato"
        description={`Tem certeza que deseja excluir o contrato "${contratoSelecionado?.titulo}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmText="Excluir"
      />

      <ConfirmDialog
        open={confirmExcluirTemplate}
        onOpenChange={setConfirmExcluirTemplate}
        onConfirm={() => {
          if (templateSelecionado) {
            excluirTemplate.mutate(templateSelecionado.id);
            setConfirmExcluirTemplate(false);
            setTemplateSelecionado(null);
          }
        }}
        title="Excluir Template"
        description={`Tem certeza que deseja excluir o template "${templateSelecionado?.nome}"? Esta ação não pode ser desfeita.`}
        variant="danger"
        confirmText="Excluir"
      />
    </div>
  );
}