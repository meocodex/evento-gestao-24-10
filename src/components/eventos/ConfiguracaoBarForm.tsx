import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfiguracaoBar } from '@/types/eventos';
import { UploadCardapio } from './UploadCardapio';

interface ConfiguracaoBarFormProps {
  configuracao: ConfiguracaoBar;
  onChange: (config: ConfiguracaoBar) => void;
  eventoId?: string;
  cardapioArquivo?: string;
  cardapioTipo?: string;
  onCardapioChange?: (url: string, tipo: string) => void;
  onCardapioRemove?: () => void;
}

export function ConfiguracaoBarForm({ 
  configuracao, 
  onChange, 
  eventoId,
  cardapioArquivo,
  cardapioTipo,
  onCardapioChange,
  onCardapioRemove
}: ConfiguracaoBarFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Configuração do Bar</h3>

      <div>
        <Label>Quantas máquinas de bar você precisa?</Label>
        <Input
          type="number"
          min="1"
          value={configuracao.quantidadeMaquinas}
          onChange={(e) => onChange({ ...configuracao, quantidadeMaquinas: Number(e.target.value) })}
        />
      </div>

      <div>
        <Label>Quantos bares terá no local?</Label>
        <Input
          type="number"
          min="1"
          value={configuracao.quantidadeBares}
          onChange={(e) => onChange({ ...configuracao, quantidadeBares: Number(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={configuracao.temCardapio}
          onCheckedChange={(checked) => onChange({ ...configuracao, temCardapio: checked as boolean })}
        />
        <Label>Já possui cardápio definido</Label>
      </div>

      {configuracao.temCardapio && (
        <UploadCardapio
          eventoId={eventoId}
          cardapioAtual={cardapioArquivo || configuracao.cardapioUrl}
          cardapioTipo={cardapioTipo}
          onUploadComplete={(url, tipo) => {
            if (onCardapioChange) {
              onCardapioChange(url, tipo);
            }
          }}
          onRemove={() => {
            if (onCardapioRemove) {
              onCardapioRemove();
            }
          }}
        />
      )}
    </div>
  );
}
