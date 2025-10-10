import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/contexts/ContratosContext';
import { ContratoTemplate } from '@/types/contratos';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface EditarTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ContratoTemplate | null;
}

const variaveisSugeridas = [
  'cliente_nome', 'cliente_documento', 'cliente_email', 'cliente_telefone',
  'empresa_nome', 'empresa_cnpj', 'empresa_endereco',
  'evento_nome', 'evento_data', 'evento_local', 'evento_horario',
  'valor_total', 'condicoes_pagamento', 'prazo_entrega',
  'fornecedor_nome', 'fornecedor_documento', 'objeto_contrato'
];

export function EditarTemplateDialog({ open, onOpenChange, template }: EditarTemplateDialogProps) {
  const { editarTemplate } = useContratos();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'evento' | 'fornecedor' | 'cliente' | 'outros'>('evento');
  const [descricao, setDescricao] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [variaveis, setVariaveis] = useState<string[]>([]);
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [novaVariavel, setNovaVariavel] = useState('');

  useEffect(() => {
    if (template) {
      setNome(template.nome);
      setTipo(template.tipo);
      setDescricao(template.descricao);
      setConteudo(template.conteudo);
      setVariaveis(template.variaveis);
      setStatus(template.status);
    }
  }, [template]);

  const handleSubmit = () => {
    if (template) {
      editarTemplate(template.id, {
        nome,
        tipo,
        descricao,
        conteudo,
        variaveis,
        status,
        versao: template.versao + 1,
      });
      onOpenChange(false);
    }
  };

  const adicionarVariavel = (variavel: string) => {
    if (variavel && !variaveis.includes(variavel)) {
      setVariaveis([...variaveis, variavel]);
      setConteudo(conteudo + `{{${variavel}}}`);
    }
  };

  const removerVariavel = (variavel: string) => {
    setVariaveis(variaveis.filter(v => v !== variavel));
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Template</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label>Variáveis Disponíveis</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {variaveisSugeridas.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => adicionarVariavel(v)}
                >
                  {v}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={novaVariavel}
                onChange={(e) => setNovaVariavel(e.target.value)}
                placeholder="Nova variável personalizada"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    adicionarVariavel(novaVariavel);
                    setNovaVariavel('');
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  adicionarVariavel(novaVariavel);
                  setNovaVariavel('');
                }}
              >
                Adicionar
              </Button>
            </div>
          </div>

          <div>
            <Label>Variáveis Usadas</Label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
              {variaveis.length === 0 ? (
                <span className="text-sm text-muted-foreground">Nenhuma variável adicionada</span>
              ) : (
                variaveis.map((v) => (
                  <Badge key={v} variant="secondary">
                    {v}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removerVariavel(v)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo do Template</Label>
            <Textarea
              id="conteudo"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!nome || !conteudo}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
