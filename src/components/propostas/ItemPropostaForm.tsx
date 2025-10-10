import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemProposta } from '@/types/contratos';

interface ItemPropostaFormProps {
  item?: ItemProposta;
  onSave: (item: ItemProposta) => void;
  onCancel: () => void;
}

export function ItemPropostaForm({ item, onSave, onCancel }: ItemPropostaFormProps) {
  const [tipo, setTipo] = useState<'servico' | 'produto' | 'pacote'>(item?.tipo || 'servico');
  const [descricao, setDescricao] = useState(item?.descricao || '');
  const [quantidade, setQuantidade] = useState(item?.quantidade || 1);
  const [unidade, setUnidade] = useState(item?.unidade || 'un');
  const [valorUnitario, setValorUnitario] = useState(item?.valorUnitario || 0);
  const [observacoes, setObservacoes] = useState(item?.observacoes || '');

  const valorTotal = quantidade * valorUnitario;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novoItem: ItemProposta = {
      id: item?.id || `item-${Date.now()}`,
      tipo,
      descricao,
      quantidade,
      valorUnitario,
      valorTotal,
      unidade,
      observacoes,
    };

    onSave(novoItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="servico">Serviço</SelectItem>
              <SelectItem value="produto">Produto</SelectItem>
              <SelectItem value="pacote">Pacote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Unidade *</Label>
          <Select value={unidade} onValueChange={setUnidade}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="un">Unidade (un)</SelectItem>
              <SelectItem value="hora">Hora</SelectItem>
              <SelectItem value="dia">Dia</SelectItem>
              <SelectItem value="diaria">Diária</SelectItem>
              <SelectItem value="m2">Metro quadrado (m²)</SelectItem>
              <SelectItem value="kg">Quilograma (kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva o serviço ou produto..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Quantidade *</Label>
          <Input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            min={1}
            step={0.01}
            required
          />
        </div>

        <div>
          <Label>Valor Unitário *</Label>
          <Input
            type="number"
            value={valorUnitario}
            onChange={(e) => setValorUnitario(Number(e.target.value))}
            min={0}
            step={0.01}
            required
          />
        </div>

        <div>
          <Label>Valor Total</Label>
          <Input
            value={valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            disabled
            className="bg-muted"
          />
        </div>
      </div>

      <div>
        <Label>Observações (opcional)</Label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações adicionais sobre este item..."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {item ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}