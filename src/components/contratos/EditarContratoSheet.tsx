import { useState, useEffect } from 'react';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/hooks/contratos';
import { Contrato, StatusContrato } from '@/types/contratos';

interface EditarContratoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrato: Contrato | null;
}

export function EditarContratoSheet({ open, onOpenChange, contrato }: EditarContratoSheetProps) {
  const { editarContrato } = useContratos();
  const [titulo, setTitulo] = useState('');
  const [status, setStatus] = useState<StatusContrato>('rascunho');
  const [conteudo, setConteudo] = useState('');
  const [valor, setValor] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (contrato) {
      setTitulo(contrato.titulo);
      setStatus(contrato.status);
      setConteudo(contrato.conteudo);
      setValor(contrato.valor?.toString() || '');
      setDataInicio(contrato.dataInicio || '');
      setDataFim(contrato.dataFim || '');
      setObservacoes(contrato.observacoes || '');
    }
  }, [contrato]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contrato) {
      await editarContrato.mutateAsync({ 
        id: contrato.id, 
        data: {
          titulo,
          status,
          conteudo,
          valor: valor ? parseFloat(valor) : undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          observacoes,
        }
      });
      onOpenChange(false);
    }
  };

  if (!contrato) return null;

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Contrato"
      onSubmit={handleSubmit}
      isLoading={editarContrato.isPending}
      submitText="Salvar Alterações"
      size="xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título do Contrato</Label>
          <Input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proposta">Proposta</SelectItem>
              <SelectItem value="em_negociacao">Em Negociação</SelectItem>
              <SelectItem value="aprovada">Aprovada</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="em_revisao">Em Revisão</SelectItem>
              <SelectItem value="aguardando_assinatura">Aguardando Assinatura</SelectItem>
              <SelectItem value="assinado">Assinado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="expirado">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="valor">Valor Total</Label>
          <Input
            id="valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="conteudo">Conteúdo do Contrato</Label>
          <Textarea
            id="conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Observações adicionais sobre o contrato"
          />
        </div>
      </div>
    </FormSheet>
  );
}
