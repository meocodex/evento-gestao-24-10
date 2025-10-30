import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Truck } from 'lucide-react';
import type { MaterialAlocado } from '@/types/estoque';

interface SelecionarMaterialParaDocumentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materiais: MaterialAlocado[];
  onConfirmar: (materiaisSelecionados: MaterialAlocado[]) => void;
  titulo?: string;
}

export function SelecionarMaterialParaDocumentoDialog({
  open,
  onOpenChange,
  materiais,
  onConfirmar,
  titulo = 'Selecionar Materiais',
}: SelecionarMaterialParaDocumentoDialogProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const toggleMaterial = (materialId: string) => {
    const novoselecionados = new Set(selecionados);
    if (novoselecionados.has(materialId)) {
      novoselecionados.delete(materialId);
    } else {
      novoselecionados.add(materialId);
    }
    setSelecionados(novoselecionados);
  };

  const selecionarTodos = () => {
    const materiaisSemDocumento = materiais.filter(
      (m) => !m.termoRetiradaUrl && !m.declaracaoTransporteUrl
    );
    setSelecionados(new Set(materiaisSemDocumento.map((m) => m.id)));
  };

  const limparSelecao = () => {
    setSelecionados(new Set());
  };

  const handleConfirmar = () => {
    const materiaisSelecionados = materiais.filter((m) =>
      selecionados.has(m.id)
    );
    onConfirmar(materiaisSelecionados);
    setSelecionados(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selecionados.size} de {materiais.length} materiais selecionados
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selecionarTodos}
                disabled={materiais.every(
                  (m) => m.termoRetiradaUrl || m.declaracaoTransporteUrl
                )}
              >
                Selecionar Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={limparSelecao}
                disabled={selecionados.size === 0}
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {materiais.map((material) => {
              const temDocumento = !!(
                material.termoRetiradaUrl || material.declaracaoTransporteUrl
              );
              const isSelecionado = selecionados.has(material.id);

              return (
                <div
                  key={material.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    selecionados.has(material.id) ? 'bg-primary/5 border-primary' : ''
                  } ${temDocumento ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selecionados.has(material.id)}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        if (checked === true || checked === false) {
                          toggleMaterial(material.id);
                        }
                      }}
                      disabled={temDocumento}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {material.nome}
                        </span>
                        {temDocumento && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Documento Gerado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {material.serial && (
                          <span>Serial: {material.serial}</span>
                        )}
                        <span>Qtd: {material.quantidadeAlocada}</span>
                        {material.tipoEnvio === 'antecipado' && (
                          <Badge variant="secondary" className="gap-1">
                            <Truck className="h-3 w-3" />
                            Antecipado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {materiais.every(
            (m) => m.termoRetiradaUrl || m.declaracaoTransporteUrl
          ) && (
            <p className="text-sm text-center text-muted-foreground py-4">
              Todos os materiais já possuem documentos gerados
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={selecionados.size === 0}
          >
            Continuar com {selecionados.size} material(is)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
