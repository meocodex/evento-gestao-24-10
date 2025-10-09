import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Search } from 'lucide-react';
import { useClientes } from '@/contexts/ClientesContext';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData, Cliente } from '@/types/eventos';
import { formatarDocumento, formatarTelefone, formatarCEP } from '@/lib/validations/cliente';

interface EditarClienteDialogProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarClienteDialog({ cliente, open, onOpenChange }: EditarClienteDialogProps) {
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const { editarCliente, buscarEnderecoPorCEP, loading } = useClientes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const tipo = watch('tipo');
  const cep = watch('endereco.cep');

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome,
        tipo: cliente.tipo,
        documento: cliente.documento,
        email: cliente.email,
        telefone: cliente.telefone,
        whatsapp: cliente.whatsapp,
        endereco: cliente.endereco,
      });
    }
  }, [cliente, reset]);

  const handleBuscarCEP = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) return;

    setBuscandoCEP(true);
    try {
      const endereco = await buscarEnderecoPorCEP(cep);
      setValue('endereco.logradouro', endereco.logradouro);
      setValue('endereco.bairro', endereco.bairro);
      setValue('endereco.cidade', endereco.localidade);
      setValue('endereco.estado', endereco.uf);
      setValue('endereco.complemento', endereco.complemento);
    } catch (error) {
      // Erro já tratado no contexto
    } finally {
      setBuscandoCEP(false);
    }
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      await editarCliente(cliente.id, data);
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Cliente */}
          <div className="space-y-2">
            <Label>Tipo de Cliente</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(value) => setValue('tipo', value as 'CPF' | 'CNPJ')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CPF" id="cpf-edit" />
                <Label htmlFor="cpf-edit" className="cursor-pointer">
                  CPF (Pessoa Física)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CNPJ" id="cnpj-edit" />
                <Label htmlFor="cnpj-edit" className="cursor-pointer">
                  CNPJ (Pessoa Jurídica)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome-edit">{tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'}</Label>
            <Input id="nome-edit" {...register('nome')} placeholder={tipo === 'CPF' ? 'João da Silva' : 'Empresa Ltda'} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="documento-edit">{tipo === 'CPF' ? 'CPF' : 'CNPJ'}</Label>
            <Input
              id="documento-edit"
              {...register('documento')}
              placeholder={tipo === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              onChange={(e) => {
                const formatted = formatarDocumento(e.target.value, tipo);
                setValue('documento', formatted);
              }}
            />
            {errors.documento && <p className="text-sm text-destructive">{errors.documento.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email-edit">Email</Label>
            <Input id="email-edit" type="email" {...register('email')} placeholder="contato@email.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone-edit">Telefone</Label>
              <Input
                id="telefone-edit"
                {...register('telefone')}
                placeholder="(00) 0000-0000"
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  setValue('telefone', formatted);
                }}
              />
              {errors.telefone && <p className="text-sm text-destructive">{errors.telefone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-edit">WhatsApp (Opcional)</Label>
              <Input
                id="whatsapp-edit"
                {...register('whatsapp')}
                placeholder="(00) 90000-0000"
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  setValue('whatsapp', formatted);
                }}
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep-edit">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="cep-edit"
                {...register('endereco.cep')}
                placeholder="00000-000"
                onChange={(e) => {
                  const formatted = formatarCEP(e.target.value);
                  setValue('endereco.cep', formatted);
                }}
              />
              <Button type="button" variant="outline" onClick={handleBuscarCEP} disabled={buscandoCEP}>
                {buscandoCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {errors.endereco?.cep && <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>}
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="logradouro-edit">Logradouro</Label>
              <Input id="logradouro-edit" {...register('endereco.logradouro')} placeholder="Rua, Avenida..." />
              {errors.endereco?.logradouro && (
                <p className="text-sm text-destructive">{errors.endereco.logradouro.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero-edit">Número</Label>
              <Input id="numero-edit" {...register('endereco.numero')} placeholder="123" />
              {errors.endereco?.numero && <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento-edit">Complemento (Opcional)</Label>
            <Input id="complemento-edit" {...register('endereco.complemento')} placeholder="Apt, Sala, Bloco..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro-edit">Bairro</Label>
              <Input id="bairro-edit" {...register('endereco.bairro')} placeholder="Centro" />
              {errors.endereco?.bairro && <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade-edit">Cidade</Label>
              <Input id="cidade-edit" {...register('endereco.cidade')} placeholder="Cuiabá" />
              {errors.endereco?.cidade && <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado-edit">UF</Label>
              <Input id="estado-edit" {...register('endereco.estado')} placeholder="MT" maxLength={2} />
              {errors.endereco?.estado && <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
