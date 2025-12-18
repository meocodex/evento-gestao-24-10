import { useState } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ReceitaFormData, ReceitaComTaxasData } from '@/types/eventos';

interface AdicionarReceitaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdicionar: (data: ReceitaFormData) => void;
  onAdicionarComTaxas?: (data: ReceitaComTaxasData) => void;
}

interface FormaPagamento {
  forma: string;
  valor: string;
  taxa_percentual: string;
}

export function AdicionarReceitaSheet({ open, onOpenChange, onAdicionar, onAdicionarComTaxas }: AdicionarReceitaSheetProps) {
  const { toast } = useToast();
  const [descricao, setDescricao] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState('');
  const [tipo, setTipo] = useState<'venda' | 'locacao' | 'servico' | 'outros' | ''>('');
  const [temTaxas, setTemTaxas] = useState(false);
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([
    { forma: 'pix', valor: '', taxa_percentual: '1.0' }
  ]);
  const [loading, setLoading] = useState(false);

  // Cálculo simples
  const valorTotal = quantidade * (parseFloat(valorUnitario) || 0);

  // Cálculo com taxas
  const valorTotalComTaxas = formasPagamento.reduce((sum, fp) => sum + (parseFloat(fp.valor) || 0), 0);
  const taxaTotal = formasPagamento.reduce((sum, fp) => {
    const valor = parseFloat(fp.valor) || 0;
    const taxa = parseFloat(fp.taxa_percentual) || 0;
    return sum + (valor * taxa / 100);
  }, 0);
  const valorLiquido = valorTotalComTaxas - taxaTotal;

  const handleAdicionarFormaPagamento = () => {
    setFormasPagamento([...formasPagamento, { forma: 'pix', valor: '', taxa_percentual: '1.0' }]);
  };

  const handleRemoverFormaPagamento = (index: number) => {
    if (formasPagamento.length > 1) {
      setFormasPagamento(formasPagamento.filter((_, i) => i !== index));
    }
  };

  const normalizarTaxa = (valor: string): string => {
    // Substitui vírgula por ponto
    let normalizado = valor.replace(',', '.');
    
    // Remove caracteres não numéricos exceto ponto
    normalizado = normalizado.replace(/[^\d.]/g, '');
    
    // Garante apenas um ponto decimal
    const partes = normalizado.split('.');
    if (partes.length > 2) {
      normalizado = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Limita a 2 casas decimais
    if (partes.length === 2 && partes[1].length > 2) {
      normalizado = partes[0] + '.' + partes[1].substring(0, 2);
    }
    
    // Valida que está entre 0 e 100
    const numero = parseFloat(normalizado);
    if (!isNaN(numero) && numero > 100) {
      return '100';
    }
    
    return normalizado;
  };

  const handleFormaPagamentoChange = (index: number, field: keyof FormaPagamento, value: string) => {
    const updated = [...formasPagamento];
    
    // Normaliza taxa se for o campo de taxa_percentual
    if (field === 'taxa_percentual') {
      updated[index][field] = normalizarTaxa(value);
    } else {
      updated[index][field] = value;
    }
    
    setFormasPagamento(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (temTaxas) {
      // Validação para receita com taxas
      if (!tipoServico.trim() || !tipo) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha tipo de serviço e categoria.',
          variant: 'destructive',
        });
        return;
      }

      const formasValidas = formasPagamento.filter(fp => parseFloat(fp.valor) > 0);
      if (formasValidas.length === 0) {
        toast({
          title: 'Formas de pagamento inválidas',
          description: 'Adicione pelo menos uma forma de pagamento com valor.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setLoading(true);
        await onAdicionarComTaxas?.({
          receita: {
            descricao: descricao.trim() || tipoServico,
            tipo_servico: tipoServico,
            tipo: tipo as 'venda' | 'locacao' | 'servico' | 'outros',
            status: 'pendente',
            data: new Date().toISOString().split('T')[0],
            quantidade: 1,
            valor_unitario: valorTotalComTaxas,
            valor: valorTotalComTaxas,
          },
          formasPagamento: formasValidas.map(fp => ({
            forma: fp.forma,
            valor: parseFloat(fp.valor),
            taxa_percentual: parseFloat(fp.taxa_percentual),
          })),
        });
        
        resetForm();
        onOpenChange(false);
      } catch (error) {
        // Erro já tratado pelo hook
      } finally {
        setLoading(false);
      }
    } else {
      // Validação para receita simples
      if (!descricao.trim() || !valorUnitario || !tipo) {
        toast({
          title: 'Campos obrigatórios',
          description: 'Por favor, preencha todos os campos.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setLoading(true);
        await onAdicionar({ 
          descricao, 
          quantidade,
          valor_unitario: parseFloat(valorUnitario),
          valor: valorTotal,
          tipo: tipo as 'venda' | 'locacao' | 'servico' | 'outros',
          status: 'pendente',
          data: new Date().toISOString().split('T')[0]
        });
        
        resetForm();
        onOpenChange(false);
      } catch (error) {
        // Erro já tratado pelo hook
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setDescricao('');
    setTipoServico('');
    setQuantidade(1);
    setValorUnitario('');
    setTipo('');
    setTemTaxas(false);
    setFormasPagamento([{ forma: 'pix', valor: '', taxa_percentual: '1.0' }]);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Receita"
      onSubmit={handleSubmit}
      isLoading={loading}
      submitText="Adicionar"
      size="md"
    >
      <div className="space-y-4">
        {/* Switch de taxas */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="tem-taxas" className="text-base">Esta receita possui taxas?</Label>
            <p className="text-sm text-muted-foreground">Ative para informar formas de pagamento e taxas</p>
          </div>
          <Switch
            id="tem-taxas"
            checked={temTaxas}
            onCheckedChange={setTemTaxas}
          />
        </div>

        {!temTaxas ? (
          /* Receita Simples */
          <>
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input 
                id="descricao"
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                placeholder="Ex: Pagamento do cliente"
                required
              />
            </div>

            <div>
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input 
                id="quantidade"
                type="number"
                min="1"
                value={quantidade} 
                onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)} 
                required
              />
            </div>

            <div>
              <Label htmlFor="valorUnitario">Valor Unitário (R$) *</Label>
              <Input 
                id="valorUnitario"
                type="number"
                step="0.01"
                min="0"
                value={valorUnitario} 
                onChange={(e) => setValorUnitario(e.target.value)} 
                placeholder="0,00"
                required
              />
            </div>

            <div className="p-3 bg-accent rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor Total:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as 'venda' | 'locacao' | 'servico' | 'outros')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="locacao">Locação</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          /* Receita com Taxas */
          <>
            <div>
              <Label htmlFor="tipo-servico">Tipo de Serviço *</Label>
              <Input 
                id="tipo-servico"
                value={tipoServico} 
                onChange={(e) => setTipoServico(e.target.value)} 
                placeholder="Ex: Show, Evento Corporativo, Casamento"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao-opcional">Descrição (opcional)</Label>
              <Input 
                id="descricao-opcional"
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                placeholder="Detalhes adicionais"
              />
            </div>

            <div>
              <Label>Categoria *</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as 'venda' | 'locacao' | 'servico' | 'outros')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="locacao">Locação</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Formas de Pagamento</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAdicionarFormaPagamento}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {formasPagamento.map((fp, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="col-span-4">
                    <Label className="text-xs">Forma</Label>
                    <Select 
                      value={fp.forma} 
                      onValueChange={(value) => handleFormaPagamentoChange(index, 'forma', value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debito">Débito</SelectItem>
                        <SelectItem value="credito">Crédito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Valor (R$)</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      min="0"
                      className="h-9"
                      value={fp.valor}
                      onChange={(e) => handleFormaPagamentoChange(index, 'valor', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">Taxa (%) - Use ponto</Label>
                    <Input 
                      type="text"
                      className="h-9 font-mono"
                      value={fp.taxa_percentual}
                      onChange={(e) => handleFormaPagamentoChange(index, 'taxa_percentual', e.target.value)}
                      placeholder="3.23"
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Ex: 3.23 ou 3.30
                    </p>
                  </div>
                  <div className="col-span-2 flex items-end">
                    {formasPagamento.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9"
                        onClick={() => handleRemoverFormaPagamento(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  {parseFloat(fp.valor) > 0 && parseFloat(fp.taxa_percentual) > 0 && (
                    <div className="col-span-12 text-xs text-muted-foreground">
                      Taxa: R$ {((parseFloat(fp.valor) * parseFloat(fp.taxa_percentual)) / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-accent rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor Total Bruto:</span>
                <span className="font-semibold">R$ {valorTotalComTaxas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de Taxas:</span>
                <span className="font-semibold text-red-600">- R$ {taxaTotal.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Valor Líquido:</span>
                <span className="text-lg font-bold text-green-600">
                  R$ {valorLiquido.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </FormSheet>
  );
}
