import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnexosUpload } from './AnexosUpload';
import { ClienteSelectFinanceiro } from './ClienteSelectFinanceiro';
import { ResponsavelSelect } from './ResponsavelSelect';
import { useContasReceber } from '@/hooks/financeiro';
import { contaReceberSchema } from '@/lib/validations/financeiro';
import { toast } from 'sonner';
import type { ContaReceber, AnexoFinanceiro, RecorrenciaFinanceiro, StatusContaReceber, TipoContaReceber } from '@/types/financeiro';

type ContaReceberFormData = z.infer<typeof contaReceberSchema>;

interface EditarContaReceberSheetProps {
  conta: ContaReceber;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarContaReceberSheet({ conta, open, onOpenChange }: EditarContaReceberSheetProps) {
  const { atualizar } = useContasReceber();
  const [anexos, setAnexos] = useState<AnexoFinanceiro[]>(conta.anexos || []);
  const [quantidade, setQuantidade] = useState(conta.quantidade);
  const [valorUnitario, setValorUnitario] = useState(conta.valor_unitario);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ContaReceberFormData>({
    resolver: zodResolver(contaReceberSchema),
    defaultValues: {
      descricao: conta.descricao,
      tipo: conta.tipo as TipoContaReceber,
      quantidade: conta.quantidade,
      valor_unitario: conta.valor_unitario,
      recorrencia: conta.recorrencia as RecorrenciaFinanceiro,
      data_vencimento: conta.data_vencimento,
      status: conta.status as StatusContaReceber,
      cliente: conta.cliente || '',
      responsavel: conta.responsavel || '',
      observacoes: conta.observacoes || '',
      data_recebimento: conta.data_recebimento || undefined,
      forma_recebimento: conta.forma_recebimento || undefined,
    }
  });

  useEffect(() => {
    reset({
      descricao: conta.descricao,
      tipo: conta.tipo as TipoContaReceber,
      quantidade: conta.quantidade,
      valor_unitario: conta.valor_unitario,
      recorrencia: conta.recorrencia as RecorrenciaFinanceiro,
      data_vencimento: conta.data_vencimento,
      status: conta.status as StatusContaReceber,
      cliente: conta.cliente || '',
      responsavel: conta.responsavel || '',
      observacoes: conta.observacoes || '',
      data_recebimento: conta.data_recebimento || undefined,
      forma_recebimento: conta.forma_recebimento || undefined,
    });
    setAnexos(conta.anexos || []);
    setQuantidade(conta.quantidade);
    setValorUnitario(conta.valor_unitario);
  }, [conta, reset]);

  const status = watch('status');
  const recorrencia = watch('recorrencia');
  const cliente = watch('cliente');
  const responsavel = watch('responsavel');

  const valorTotal = quantidade * valorUnitario;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(async (data: ContaReceberFormData) => {
      try {
        await atualizar.mutateAsync({
          id: conta.id,
          ...data,
          valor: valorTotal,
          anexos,
        } as Parameters<typeof atualizar.mutateAsync>[0]);
        onOpenChange(false);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        toast.error('Erro ao atualizar conta: ' + message);
      }
    })();
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Conta a Receber"
      onSubmit={onSubmit}
      isLoading={atualizar.isPending}
      submitText="Salvar Alterações"
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
            <Label htmlFor="tipo">Tipo *</Label>
            <Select value={watch('tipo')} onValueChange={(value) => setValue('tipo', value as TipoContaReceber)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="locacao">Locação</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cliente</Label>
            <ClienteSelectFinanceiro 
              value={cliente || ''} 
              onChange={(value) => setValue('cliente', value)} 
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
            <Select value={status} onValueChange={(value) => setValue('status', value as StatusContaReceber)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'recebido' && (
            <div>
              <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
              <Input id="data_recebimento" type="date" {...register('data_recebimento')} />
            </div>
          )}
        </div>

        {status === 'recebido' && (
          <div>
            <Label htmlFor="forma_recebimento">Forma de Recebimento *</Label>
            <Select 
              value={watch('forma_recebimento') || ''} 
              onValueChange={(value) => setValue('forma_recebimento', value)}
            >
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

        {recorrencia !== 'unico' && status === 'recebido' && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
            ℹ️ Esta conta é recorrente. Ao marcar como recebida, a próxima ocorrência será gerada automaticamente.
          </div>
        )}
      </div>
    </FormSheet>
  );
}
