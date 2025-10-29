import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContratos } from '@/hooks/contratos';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { UploadPapelTimbrado } from '@/components/propostas/UploadPapelTimbrado';

interface NovoTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variaveisSugeridas = [
  'cliente_nome', 'cliente_documento', 'cliente_email', 'cliente_telefone',
  'empresa_nome', 'empresa_cnpj', 'empresa_endereco',
  'evento_nome', 'evento_data', 'evento_local', 'evento_horario',
  'valor_total', 'condicoes_pagamento', 'prazo_entrega',
  'fornecedor_nome', 'fornecedor_documento', 'objeto_contrato'
];

export function NovoTemplateDialog({ open, onOpenChange }: NovoTemplateDialogProps) {
  const { criarTemplate } = useContratos();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'evento' | 'fornecedor' | 'cliente' | 'outros'>('evento');
  const [descricao, setDescricao] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [variaveis, setVariaveis] = useState<string[]>([]);
  const [novaVariavel, setNovaVariavel] = useState('');
  const [papelTimbrado, setPapelTimbrado] = useState<string | undefined>();

  const handleSubmit = async () => {
    await criarTemplate.mutateAsync({
      nome,
      tipo,
      descricao,
      conteudo,
      variaveis,
      status: 'ativo',
      versao: 1,
      papelTimbrado,
    });
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setNome('');
    setTipo('evento');
    setDescricao('');
    setConteudo('');
    setVariaveis([]);
    setNovaVariavel('');
    setPapelTimbrado(undefined);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Template de Contrato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Template</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Contrato de Prestação de Serviços - Evento"
            />
          </div>

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
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Breve descrição do template"
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
              placeholder="Digite o conteúdo do contrato. Use {{variavel}} para inserir variáveis dinâmicas."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Dica: Clique nas variáveis acima para inseri-las no conteúdo
            </p>
          </div>

          <Separator className="my-6" />

          <div>
            <Label>Papel Timbrado</Label>
            <UploadPapelTimbrado
              value={papelTimbrado}
              onChange={setPapelTimbrado}
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 O papel timbrado será usado automaticamente em todas propostas e contratos gerados com este template
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!nome || !conteudo}>
            Criar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
