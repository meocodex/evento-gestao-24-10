import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Loader2, Search } from 'lucide-react';
import { useClientes } from '@/contexts/ClientesContext';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData } from '@/types/eventos';
import { formatarDocumento, formatarTelefone, formatarCEP } from '@/lib/validations/cliente';
import { useIsMobile } from '@/hooks/use-mobile';

export function NovoClienteSheet() {
  const [open, setOpen] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const { criarCliente, buscarEnderecoPorCEP, loading } = useClientes();
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo: 'CPF',
      endereco: {
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
    },
  });

  const tipo = watch('tipo');
  const cep = watch('endereco.cep');

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
      await criarCliente(data);
      reset();
      setOpen(false);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </SheetTrigger>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:w-[600px] lg:w-[800px] overflow-y-auto"}
      >
        <SheetHeader className="border-b border-navy-100 pb-4 mb-6">
          <SheetTitle className="text-2xl font-display text-navy-800">Novo Cliente</SheetTitle>
          <SheetDescription className="text-navy-500">
            Cadastre um novo cliente no sistema
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Tipo de Cliente */}
          <div className="space-y-2">
            <Label className="text-navy-700">Tipo de Cliente</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(value) => setValue('tipo', value as 'CPF' | 'CNPJ')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CPF" id="cpf" />
                <Label htmlFor="cpf" className="cursor-pointer text-navy-700">
                  CPF (Pessoa Física)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CNPJ" id="cnpj" />
                <Label htmlFor="cnpj" className="cursor-pointer text-navy-700">
                  CNPJ (Pessoa Jurídica)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-navy-700">{tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'}</Label>
            <Input id="nome" {...register('nome')} placeholder={tipo === 'CPF' ? 'João da Silva' : 'Empresa Ltda'} className="border-navy-200" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="documento" className="text-navy-700">{tipo === 'CPF' ? 'CPF' : 'CNPJ'}</Label>
            <Input
              id="documento"
              {...register('documento')}
              placeholder={tipo === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
              onChange={(e) => {
                const formatted = formatarDocumento(e.target.value, tipo);
                setValue('documento', formatted);
              }}
              className="border-navy-200"
            />
            {errors.documento && <p className="text-sm text-destructive">{errors.documento.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-navy-700">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="contato@email.com" className="border-navy-200" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-navy-700">Telefone</Label>
              <Input
                id="telefone"
                {...register('telefone')}
                placeholder="(00) 0000-0000"
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  setValue('telefone', formatted);
                }}
                className="border-navy-200"
              />
              {errors.telefone && <p className="text-sm text-destructive">{errors.telefone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-navy-700">WhatsApp (Opcional)</Label>
              <Input
                id="whatsapp"
                {...register('whatsapp')}
                placeholder="(00) 90000-0000"
                onChange={(e) => {
                  const formatted = formatarTelefone(e.target.value);
                  setValue('whatsapp', formatted);
                }}
                className="border-navy-200"
              />
            </div>
          </div>

          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep" className="text-navy-700">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="cep"
                {...register('endereco.cep')}
                placeholder="00000-000"
                onChange={(e) => {
                  const formatted = formatarCEP(e.target.value);
                  setValue('endereco.cep', formatted);
                }}
                className="border-navy-200"
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
              <Label htmlFor="logradouro" className="text-navy-700">Logradouro</Label>
              <Input id="logradouro" {...register('endereco.logradouro')} placeholder="Rua, Avenida..." className="border-navy-200" />
              {errors.endereco?.logradouro && (
                <p className="text-sm text-destructive">{errors.endereco.logradouro.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-navy-700">Número</Label>
              <Input id="numero" {...register('endereco.numero')} placeholder="123" className="border-navy-200" />
              {errors.endereco?.numero && <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento" className="text-navy-700">Complemento (Opcional)</Label>
            <Input id="complemento" {...register('endereco.complemento')} placeholder="Apt, Sala, Bloco..." className="border-navy-200" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro" className="text-navy-700">Bairro</Label>
              <Input id="bairro" {...register('endereco.bairro')} placeholder="Centro" className="border-navy-200" />
              {errors.endereco?.bairro && <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-navy-700">Cidade</Label>
              <Input id="cidade" {...register('endereco.cidade')} placeholder="Cuiabá" className="border-navy-200" />
              {errors.endereco?.cidade && <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-navy-700">UF</Label>
              <Input id="estado" {...register('endereco.estado')} placeholder="MT" maxLength={2} className="border-navy-200" />
              {errors.endereco?.estado && <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>}
            </div>
          </div>

          <SheetFooter className="border-t border-navy-100 pt-6 mt-6 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cliente
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
