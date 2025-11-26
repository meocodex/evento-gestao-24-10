import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, FileText, User, Phone, FileDigit } from 'lucide-react';
import type { MaterialAlocado } from '@/types/estoque';
import { formatarCPF, formatarTelefone } from '@/lib/formatters';

const retiradaSchema = z.object({
  retiradoPorNome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  retiradoPorDocumento: z.string().min(8, 'Documento inválido'),
  retiradoPorTelefone: z.string().min(10, 'Telefone inválido'),
  aceitoTermo: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar o termo de responsabilidade',
  }),
});

type RetiradaFormData = z.infer<typeof retiradaSchema>;

interface RegistrarRetiradaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materiais: MaterialAlocado[];
  onConfirmar: (dados: RetiradaFormData) => Promise<void>;
}

export function RegistrarRetiradaDialog({
  open,
  onOpenChange,
  materiais,
  onConfirmar,
}: RegistrarRetiradaDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RetiradaFormData>({
    resolver: zodResolver(retiradaSchema),
    defaultValues: {
      aceitoTermo: false,
    },
  });

  const aceitoTermo = watch('aceitoTermo');

  const onSubmit = async (data: RetiradaFormData) => {
    setLoading(true);
    try {
      await onConfirmar(data);
      toast.success('Termo de retirada gerado com sucesso!');
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao gerar termo:', error);
      toast.error('Erro ao gerar termo de retirada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registrar Retirada de Materiais
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Materiais sendo retirados */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-medium mb-3 text-sm">Materiais a serem retirados</h3>
            <div className="space-y-2">
              {materiais.map((material) => (
                <div key={material.id} className="text-sm flex justify-between items-center">
                  <div>
                    <span className="font-medium">{material.nome}</span>
                    {material.serial && (
                      <span className="text-muted-foreground ml-2">
                        Serial: {material.serial}
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    Qtd: {material.quantidadeAlocada}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dados da pessoa que retira */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Dados do Responsável pela Retirada</h3>
            
            <div className="space-y-2">
              <Label htmlFor="retiradoPorNome">
                <User className="h-4 w-4 inline mr-1" />
                Nome Completo *
              </Label>
              <Input
                id="retiradoPorNome"
                {...register('retiradoPorNome')}
                placeholder="Nome completo da pessoa que retira"
              />
              {errors.retiradoPorNome && (
                <p className="text-sm text-destructive">{errors.retiradoPorNome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retiradoPorDocumento">
                <FileDigit className="h-4 w-4 inline mr-1" />
                CPF/RG *
              </Label>
              <Input
                id="retiradoPorDocumento"
                {...register('retiradoPorDocumento')}
                placeholder="000.000.000-00 ou 00.000.000-0"
                onChange={(e) => {
                  const formatted = formatarCPF(e.target.value);
                  register('retiradoPorDocumento').onChange(e);
                  e.target.value = formatted;
                }}
                maxLength={14}
              />
              {errors.retiradoPorDocumento && (
                <p className="text-sm text-destructive">{errors.retiradoPorDocumento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retiradoPorTelefone">
                <Phone className="h-4 w-4 inline mr-1" />
                Telefone *
              </Label>
              <Input
                id="retiradoPorTelefone"
                {...register('retiradoPorTelefone')}
                placeholder="(00) 00000-0000"
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  register('retiradoPorTelefone').onChange(e);
                  e.target.value = formatted;
                }}
                maxLength={15}
              />
              {errors.retiradoPorTelefone && (
                <p className="text-sm text-destructive">{errors.retiradoPorTelefone.message}</p>
              )}
            </div>
          </div>

          {/* Termo de Responsabilidade */}
          <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
            <h3 className="font-medium text-sm">Termo de Responsabilidade</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Declaro, sob as penas da lei, que recebi os materiais acima discriminados 
              em perfeitas condições de uso e funcionamento. Comprometo-me a zelar pela 
              integridade dos mesmos e a devolvê-los nas mesmas condições em que foram 
              retirados. Reconheço que sou o único responsável pelos materiais durante o 
              período em que estiverem sob minha guarda, respondendo civil e criminalmente 
              por qualquer dano, perda ou extravio.
            </p>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aceitoTermo"
                checked={aceitoTermo}
                onCheckedChange={(checked) => setValue('aceitoTermo', checked as boolean)}
              />
              <Label
                htmlFor="aceitoTermo"
                className="text-sm font-normal cursor-pointer"
              >
                Li e concordo com o termo de responsabilidade
              </Label>
            </div>
            {errors.aceitoTermo && (
              <p className="text-sm text-destructive">{errors.aceitoTermo.message}</p>
            )}
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
              Gerar Termo de Retirada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
