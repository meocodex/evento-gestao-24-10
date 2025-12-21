import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Eye, Edit, MoreVertical, FileSignature, CheckCircle2, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';
import { useContratos } from '@/hooks/contratos';
import { gerarPDFContrato } from '@/utils/pdfGenerator';
import { NovoContratoSheet } from '@/components/contratos/NovoContratoSheet';
import { EditarContratoSheet } from '@/components/contratos/EditarContratoSheet';
import { DetalhesContratoSheet } from '@/components/contratos/DetalhesContratoSheet';
import { NovoTemplateSheet } from '@/components/contratos/NovoTemplateSheet';
import { EditarTemplateSheet } from '@/components/contratos/EditarTemplateSheet';
import { DetalhesTemplateSheet } from '@/components/contratos/DetalhesTemplateSheet';
import { SimularAssinaturaSheet } from '@/components/contratos/SimularAssinaturaSheet';
import { NovaPropostaSheet } from '@/components/propostas/NovaPropostaSheet';
import { ConverterContratoSheet } from '@/components/propostas/ConverterContratoSheet';
import { Contrato, ContratoTemplate, StatusContrato } from '@/types/contratos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContratosVirtualList } from '@/components/contratos/ContratosVirtualList';
import { TemplatesVirtualGrid } from '@/components/contratos/TemplatesVirtualGrid';

export default function Contratos() {
  const [pageContratos, setPageContratos] = useState(1);
  const [pageTemplates, setPageTemplates] = useState(1);
  const [pageSizeContratos] = useState(50);
  const [pageSizeTemplates] = useState(50);
  const [filtrosContratos, setFiltrosContratos] = useState<any>({});
  const [filtrosTemplates, setFiltrosTemplates] = useState<any>({});
  const [activeTab, setActiveTab] = useState('contratos');
  
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
    <div className="min-h-full overflow-x-hidden">
      <div className="w-full px-3 sm:px-6 py-4 sm:py-6 space-y-4 animate-fade-in bg-background">
        {/* Stats Cards - Desktop only */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Single Unified Toolbar */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3 p-2 sm:p-3 rounded-2xl glass-card">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-shrink-0">
            <TabsList className="h-8 p-0.5 bg-muted/50">
              <TabsTrigger value="contratos" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Contratos</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Templates</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Search */}
          <div className="relative min-w-[100px] max-w-[140px] flex-shrink">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-8 text-xs bg-background/60"
              value={activeTab === 'contratos' ? searchContratos : searchTemplates}
              onChange={(e) => activeTab === 'contratos' ? setSearchContratos(e.target.value) : setSearchTemplates(e.target.value)}
            />
          </div>

          {activeTab === 'contratos' && (
            <>
              <div className="hidden xl:block h-6 w-px bg-border/50" />

              {/* Status Filter */}
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
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
            </>
          )}

          <div className="hidden xl:block h-6 w-px bg-border/50" />

          {/* Create Buttons */}
          <Button onClick={() => setMostrarNovaProposta(true)} size="sm" className="gap-1 h-8 text-xs px-2.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Proposta</span>
          </Button>
          <Button onClick={() => setMostrarNovoContrato(true)} variant="outline" size="sm" className="gap-1 h-8 text-xs px-2.5">
            <FileSignature className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Contrato</span>
          </Button>
          {activeTab === 'templates' && (
            <Button onClick={() => setMostrarNovoTemplate(true)} variant="outline" size="sm" className="gap-1 h-8 text-xs px-2.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Template</span>
            </Button>
          )}

          {/* Counter + Pagination - pushed right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            <span className="hidden xl:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">
                {activeTab === 'contratos' ? contratos.length : templates.length}
              </span>/<span>{activeTab === 'contratos' ? totalContratos : totalTemplates}</span>
            </span>

            {(activeTab === 'contratos' ? totalPagesContratos : totalPagesTemplates) > 1 && (
              <>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => activeTab === 'contratos' 
                      ? setPageContratos(Math.max(1, pageContratos - 1))
                      : setPageTemplates(Math.max(1, pageTemplates - 1))
                    }
                    disabled={activeTab === 'contratos' ? pageContratos === 1 : pageTemplates === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {activeTab === 'contratos' ? pageContratos : pageTemplates}/
                    {activeTab === 'contratos' ? totalPagesContratos : totalPagesTemplates}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => activeTab === 'contratos'
                      ? setPageContratos(Math.min(totalPagesContratos, pageContratos + 1))
                      : setPageTemplates(Math.min(totalPagesTemplates, pageTemplates + 1))
                    }
                    disabled={activeTab === 'contratos' 
                      ? pageContratos >= totalPagesContratos 
                      : pageTemplates >= totalPagesTemplates}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'contratos' && (
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
        )}

        {activeTab === 'templates' && (
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
        )}
      </div>

      {/* Dialogs */}
      <NovoContratoSheet open={mostrarNovoContrato} onOpenChange={setMostrarNovoContrato} />
      <NovaPropostaSheet open={mostrarNovaProposta} onOpenChange={setMostrarNovaProposta} />
      <DetalhesContratoSheet
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
      <EditarContratoSheet
        open={mostrarEditarContrato}
        onOpenChange={setMostrarEditarContrato}
        contrato={contratoSelecionado}
      />
      <NovoTemplateSheet open={mostrarNovoTemplate} onOpenChange={setMostrarNovoTemplate} />
      <DetalhesTemplateSheet
        open={mostrarDetalhesTemplate}
        onOpenChange={setMostrarDetalhesTemplate}
        template={templateSelecionado}
        onEdit={() => {
          setMostrarDetalhesTemplate(false);
          setMostrarEditarTemplate(true);
        }}
      />
      <EditarTemplateSheet
        open={mostrarEditarTemplate}
        onOpenChange={setMostrarEditarTemplate}
        template={templateSelecionado}
      />
      <SimularAssinaturaSheet
        open={mostrarSimularAssinatura}
        onOpenChange={setMostrarSimularAssinatura}
        contrato={contratoSelecionado}
      />
      <ConverterContratoSheet
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
