import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnexosUpload } from './AnexosUpload';
import { CategoriaSelect } from './CategoriaSelect';
import { FornecedorCombobox } from './FornecedorCombobox';
import { ResponsavelSelect } from './ResponsavelSelect';
import { useContasPagar } from '@/hooks/financeiro';
import { contaPagarSchema } from '@/lib/validations/financeiro';
import { toast } from 'sonner';
import type { AnexoFinanceiro, RecorrenciaFinanceiro, StatusContaPagar } from '@/types/financeiro';

type ContaPagarFormData = z.infer<typeof contaPagarSchema>;

interface NovaContaPagarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaContaPagarSheet({ open, onOpenChange }: NovaContaPagarSheetProps) {
  const { criar } = useContasPagar();
  const [anexos, setAnexos] = useState<AnexoFinanceiro[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ContaPagarFormData>({
    resolver: zodResolver(contaPagarSchema),
    defaultValues: {
      quantidade: 1,
      recorrencia: 'unico',
      status: 'pendente',
    }
  });

  const status = watch('status');
  const recorrencia = watch('recorrencia');
  const categoria = watch('categoria');
  const fornecedor = watch('fornecedor');
  const responsavel = watch('responsavel');

  const valorTotal = quantidade * valorUnitario;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(async (data: ContaPagarFormData) => {
      try {
        await criar.mutateAsync({
          ...data,
          valor: valorTotal,
          anexos,
        } as Parameters<typeof criar.mutateAsync>[0]);
        reset();
        setAnexos([]);
        onOpenChange(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error('Erro ao criar conta: ' + message);
      }
    })();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Conta a Pagar"
      onSubmit={onSubmit}
      isLoading={criar.isPending}
      submitText="Criar Conta"
      size="xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Input id="descricao" {...register('descricao')} />
          {errors.descricao && <p className="text-sm text-destructive">{errors.descricao.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Categoria *</Label>
            <CategoriaSelect 
              value={categoria || ''} 
              onChange={(value) => setValue('categoria', value)} 
            />
            {errors.categoria && <p className="text-sm text-destructive">{errors.categoria.message}</p>}
          </div>

          <div>
            <Label>Fornecedor</Label>
            <FornecedorCombobox 
              value={fornecedor || ''} 
              onChange={(value) => setValue('fornecedor', value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              {...register('quantidade', { valueAsNumber: true })}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
            {errors.quantidade && <p className="text-sm text-destructive">{errors.quantidade.message}</p>}
          </div>

          <div>
            <Label htmlFor="valor_unitario">Valor Unitário *</Label>
            <Input
              id="valor_unitario"
              type="number"
              step="0.01"
              {...register('valor_unitario', { valueAsNumber: true })}
              onChange={(e) => setValorUnitario(Number(e.target.value))}
            />
            {errors.valor_unitario && <p className="text-sm text-destructive">{errors.valor_unitario.message}</p>}
          </div>

          <div>
            <Label>Valor Total</Label>
            <Input value={`R$ ${valorTotal.toFixed(2)}`} disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recorrencia">Recorrência *</Label>
            <Select value={recorrencia} onValueChange={(value) => setValue('recorrencia', value as RecorrenciaFinanceiro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unico">Único</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
            <Input id="data_vencimento" type="date" {...register('data_vencimento')} />
            {errors.data_vencimento && <p className="text-sm text-destructive">{errors.data_vencimento.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value) => setValue('status', value as StatusContaPagar)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'pago' && (
            <div>
              <Label htmlFor="data_pagamento">Data de Pagamento *</Label>
              <Input id="data_pagamento" type="date" {...register('data_pagamento')} />
            </div>
          )}
        </div>

        {status === 'pago' && (
          <div>
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select onValueChange={(value) => setValue('forma_pagamento', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Responsável</Label>
          <ResponsavelSelect 
            value={responsavel || ''} 
            onChange={(value) => setValue('responsavel', value)} 
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" {...register('observacoes')} rows={3} />
        </div>

        <div>
          <Label>Anexos</Label>
          <AnexosUpload onAnexosChange={setAnexos} anexosAtuais={anexos} />
        </div>

        {recorrencia !== 'unico' && status === 'pago' && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
            ℹ️ Esta conta é recorrente. Ao marcar como paga, a próxima ocorrência será gerada automaticamente.
          </div>
        )}
      </div>
    </FormSheet>
  );
}
