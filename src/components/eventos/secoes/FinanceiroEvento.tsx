import { useState } from 'react';
import { useEventosFinanceiro } from '@/hooks/eventos';
import { useDemandas } from '@/hooks/demandas';
import { Evento } from '@/types/eventos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, FileText, Receipt, Paperclip } from 'lucide-react';
import { FileViewer } from '@/components/shared/FileViewer';
import { AdicionarReceitaSheet } from '../modals/AdicionarReceitaSheet';
import { AdicionarDespesaSheet } from '../modals/AdicionarDespesaSheet';
import { RelatorioFechamentoDialog } from '../modals/RelatorioFechamentoDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

interface FinanceiroEventoProps {
  evento: Evento;
  permissions: any;
}

export function FinanceiroEvento({ evento, permissions }: FinanceiroEventoProps) {
  const { toast } = useToast();
  const financeiro = useEventosFinanceiro(evento.id);
  const { demandas } = useDemandas(1, 1000);
  const getDemandasReembolsoPorEvento = (id: string) => demandas.filter((d: any) => d.eventoRelacionado === id && d.categoria === 'reembolso');
  const [showAddReceita, setShowAddReceita] = useState(false);
  const [showAddDespesa, setShowAddDespesa] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; tipo: 'receita' | 'despesa' } | null>(null);
  const [despesasSelecionadas, setDespesasSelecionadas] = useState<Set<string>>(new Set());
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; nome: string; tipo: string } | null>(null);

  const reembolsosEvento = getDemandasReembolsoPorEvento(evento.id);
  const reembolsosPagos = reembolsosEvento.filter(d => d.dadosReembolso?.statusPagamento === 'pago');
  const totalReembolsosPendentes = reembolsosEvento
    .filter(d => d.dadosReembolso?.statusPagamento === 'pendente' || d.dadosReembolso?.statusPagamento === 'aprovado')
    .reduce((sum, d) => sum + (d.dadosReembolso?.valorTotal || 0), 0);

  const totalReceitas = evento.financeiro.receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalDespesas = evento.financeiro.despesas.reduce((sum, d) => sum + d.valor, 0);
  const totalCobrancas = evento.financeiro.cobrancas.reduce((sum, c) => sum + c.valor, 0);
  const lucro = totalReceitas - totalDespesas - totalCobrancas;

  const handleDeleteClick = (id: string, tipo: 'receita' | 'despesa') => {
    setItemToDelete({ id, tipo });
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        if (itemToDelete.tipo === 'receita') {
          await financeiro.removerReceita(itemToDelete.id);
        } else {
          await financeiro.removerDespesa(itemToDelete.id);
        }
      } catch (error) {
        // Erro já tratado pelo hook
      } finally {
        setItemToDelete(null);
        setShowDeleteDialog(false);
      }
    }
  };

  const toggleDespesaSelecionada = (despesaId: string) => {
    const newSet = new Set(despesasSelecionadas);
    if (newSet.has(despesaId)) {
      newSet.delete(despesaId);
    } else {
      newSet.add(despesaId);
    }
    setDespesasSelecionadas(newSet);
  };

  const [showRelatorioDialog, setShowRelatorioDialog] = useState(false);

  const handleGerarRelatorio = () => {
    if (despesasSelecionadas.size === 0) {
      toast({
        title: 'Nenhuma despesa selecionada',
        description: 'Selecione ao menos uma despesa para gerar o relatório.',
        variant: 'destructive',
      });
      return;
    }

    setShowRelatorioDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              R$ {totalCobrancas.toLocaleString('pt-BR')}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {lucro.toLocaleString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Receitas</CardTitle>
          {permissions.canEditFinancial && (
            <Button size="sm" onClick={() => setShowAddReceita(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Receita
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {evento.financeiro.receitas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma receita cadastrada
            </p>
          ) : (
            <div className="space-y-2">
              {evento.financeiro.receitas.map((receita) => (
                <div key={receita.id} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{receita.descricao}</p>
                    <p className="text-sm text-muted-foreground">{receita.tipo}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {receita.quantidade} x R$ {receita.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {receita.comprovante && (
                      <button
                        onClick={() => {
                          setSelectedFile({ 
                            url: receita.comprovante!, 
                            nome: `Comprovante-${receita.descricao}`, 
                            tipo: receita.comprovante!.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' 
                          });
                          setFileViewerOpen(true);
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        Ver comprovante
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">R$ {receita.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    {permissions.canEditFinancial && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteClick(receita.id, 'receita')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Reembolsos Pendentes */}
      {totalReembolsosPendentes > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
              <Receipt className="h-5 w-5" />
              Reembolsos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Há {reembolsosEvento.length - reembolsosPagos.length} solicitações de reembolso aguardando aprovação/pagamento.
            </p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">
              R$ {totalReembolsosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Despesas</CardTitle>
          <div className="flex gap-2">
            {permissions.canEditFinancial && despesasSelecionadas.size > 0 && (
              <Button size="sm" variant="outline" onClick={handleGerarRelatorio}>
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório ({despesasSelecionadas.size})
              </Button>
            )}
            {permissions.canEditFinancial && (
              <Button size="sm" onClick={() => setShowAddDespesa(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Despesa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {evento.financeiro.despesas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma despesa cadastrada
            </p>
          ) : (
            <div className="space-y-2">
              {evento.financeiro.despesas.map((despesa) => (
                <div key={despesa.id} className="flex justify-between items-center p-3 border rounded">
                  {permissions.canEditFinancial && (
                    <Checkbox 
                      checked={despesasSelecionadas.has(despesa.id)}
                      onCheckedChange={() => toggleDespesaSelecionada(despesa.id)}
                      className="mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{despesa.descricao}</p>
                    <p className="text-sm text-muted-foreground">{despesa.categoria}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {despesa.quantidade} x R$ {despesa.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {despesa.comprovante && (
                      <button
                        onClick={() => {
                          setSelectedFile({ 
                            url: despesa.comprovante!, 
                            nome: `Comprovante-${despesa.descricao}`, 
                            tipo: despesa.comprovante!.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' 
                          });
                          setFileViewerOpen(true);
                        }}
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Paperclip className="h-3 w-3" />
                        Ver comprovante
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600">R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    {permissions.canEditFinancial && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteClick(despesa.id, 'despesa')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdicionarReceitaSheet
        open={showAddReceita}
        onOpenChange={setShowAddReceita}
        onAdicionar={async (data) => {
          await financeiro.adicionarReceita(data);
          setShowAddReceita(false);
        }}
      />

      <AdicionarDespesaSheet
        open={showAddDespesa}
        onOpenChange={setShowAddDespesa}
        onAdicionar={async (data) => {
          await financeiro.adicionarDespesa(data);
          setShowAddDespesa(false);
        }}
      />

      <RelatorioFechamentoDialog
        open={showRelatorioDialog}
        onOpenChange={setShowRelatorioDialog}
        evento={evento}
        despesasSelecionadas={Array.from(despesasSelecionadas)}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        description="Tem certeza que deseja remover este item?"
      />

      {selectedFile && (
        <FileViewer
          isOpen={fileViewerOpen}
          onClose={() => {
            setFileViewerOpen(false);
            setSelectedFile(null);
          }}
          fileUrl={selectedFile.url}
          fileName={selectedFile.nome}
          fileType={selectedFile.tipo}
        />
      )}
    </div>
  );
}
