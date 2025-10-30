import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, FileText, Building, User, Truck } from 'lucide-react';
import type { MaterialAlocado } from '@/types/estoque';
import type { Cliente } from '@/types/eventos';
import type { Transportadora } from '@/types/transportadoras';
import { useOperacionalQueries } from '@/contexts/equipe/useOperacionalQueries';

const declaracaoSchema = z.object({
  remetenteTipo: z.enum(['empresa', 'membro_equipe']),
  remetenteMembroId: z.string().optional(),
  valoresDeclarados: z.record(z.number().positive('Valor deve ser positivo')),
  observacoes: z.string().optional(),
});

type DeclaracaoFormData = z.infer<typeof declaracaoSchema>;

interface GerarDeclaracaoTransporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materiais: MaterialAlocado[];
  cliente: Cliente;
  transportadora?: Transportadora;
  onConfirmar: (dados: DeclaracaoFormData) => Promise<void>;
}

export function GerarDeclaracaoTransporteDialog({
  open,
  onOpenChange,
  materiais,
  cliente,
  transportadora,
  onConfirmar,
}: GerarDeclaracaoTransporteDialogProps) {
  const [loading, setLoading] = useState(false);
  const operacionais = useOperacionalQueries();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<DeclaracaoFormData>({
    resolver: zodResolver(declaracaoSchema),
    defaultValues: {
      remetenteTipo: 'empresa',
      valoresDeclarados: materiais.reduce((acc, m) => ({
        ...acc,
        [m.id]: m.valorDeclarado || 0,
      }), {}),
    },
  });

  const remetenteTipo = watch('remetenteTipo');

  const onSubmit = async (data: DeclaracaoFormData) => {
    setLoading(true);
    try {
      await onConfirmar(data);
      toast.success('Declaração de transporte gerada com sucesso!');
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao gerar declaração:', error);
      toast.error('Erro ao gerar declaração de transporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Declaração de Transporte
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Remetente */}
          <div className="space-y-2">
            <Label>
              <User className="h-4 w-4 inline mr-1" />
              Remetente
            </Label>
            <Controller
              name="remetenteTipo"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa">
                      <Building className="h-4 w-4 inline mr-2" />
                      Empresa
                    </SelectItem>
                    <SelectItem value="membro_equipe">
                      <User className="h-4 w-4 inline mr-2" />
                      Membro da Equipe
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Selecionar Membro da Equipe */}
          {remetenteTipo === 'membro_equipe' && (
            <div className="space-y-2">
              <Label>Selecionar Membro da Equipe *</Label>
              <Controller
                name="remetenteMembroId"
                control={control}
                rules={{ required: remetenteTipo === 'membro_equipe' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {operacionais.operacionais?.map((membro: any) => (
                        <SelectItem key={membro.id} value={membro.id}>
                          <div className="flex flex-col">
                            <span>{membro.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {membro.funcao_principal} - {membro.tipo_vinculo}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.remetenteMembroId && (
                <p className="text-sm text-destructive">
                  Selecione um membro da equipe
                </p>
              )}
            </div>
          )}

          {/* Dados do Destinatário (Cliente) */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium mb-3 text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Destinatário (Cliente)
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nome:</span>{' '}
                <span className="font-medium">{cliente.nome}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Documento:</span>{' '}
                <span className="font-medium">{cliente.documento}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>{' '}
                <span className="font-medium">{cliente.telefone}</span>
              </div>
              {cliente.endereco && (
                <div>
                  <span className="text-muted-foreground">Endereço:</span>{' '}
                  <span className="font-medium">
                    {typeof cliente.endereco === 'object'
                      ? `${cliente.endereco.logradouro}, ${cliente.endereco.numero} - ${cliente.endereco.cidade}/${cliente.endereco.estado}`
                      : cliente.endereco}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transportadora (se houver) */}
          {transportadora && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-medium mb-3 text-sm flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Transportadora
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="font-medium">{transportadora.nome}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">CNPJ:</span>{' '}
                  <span className="font-medium">{transportadora.cnpj}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>{' '}
                  <span className="font-medium">{transportadora.telefone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Materiais com Valores Declarados */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Valores Declarados por Material</h3>
            {materiais.map((material) => (
              <div key={material.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{material.nome}</p>
                  {material.serial && (
                    <p className="text-xs text-muted-foreground">
                      Serial: {material.serial}
                    </p>
                  )}
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register(`valoresDeclarados.${material.id}`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Informações adicionais sobre o transporte..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Declaração
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
