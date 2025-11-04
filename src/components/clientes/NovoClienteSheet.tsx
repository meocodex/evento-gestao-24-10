import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSheet, useSheetState } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Loader2 } from 'lucide-react';
import { useClientes } from '@/hooks/clientes';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData } from '@/types/eventos';
import { formatarDocumento, formatarTelefone, formatarCEP } from '@/lib/validations/cliente';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';

export function NovoClienteSheet() {
  const { isOpen, open, close } = useSheetState({ resetOnClose: true });
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const { criarCliente } = useClientes();
  const loading = criarCliente.isPending;

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

  // Busca automática de CEP com debounce
  useEffect(() => {
    const cepLimpo = cep?.replace(/\D/g, '') || '';
    
    if (cepLimpo.length !== 8) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      setBuscandoCEP(true);
      try {
        const endereco = await buscarEnderecoPorCEP(cep);
        setValue('endereco.logradouro', endereco.logradouro);
        setValue('endereco.bairro', endereco.bairro);
        setValue('endereco.cidade', endereco.localidade);
        setValue('endereco.estado', endereco.uf);
        if (endereco.complemento) {
          setValue('endereco.complemento', endereco.complemento);
        }
      } catch (error) {
        // Erro já tratado no contexto
      } finally {
        setBuscandoCEP(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [cep, setValue]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      await criarCliente.mutateAsync(data);
      reset();
      close();
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  return (
    <FormSheet
      open={isOpen}
      onOpenChange={(v) => v ? open() : close()}
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      }
      title="Novo Cliente"
      description="Cadastre um novo cliente no sistema"
      onSubmit={handleSubmit(onSubmit)}
      isLoading={loading}
      submitText="Criar Cliente"
      size="lg"
    >
      <div className="space-y-6">
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
          <div className="relative">
            <Input
              id="cep"
              {...register('endereco.cep')}
              placeholder="00000-000"
              onChange={(e) => {
                const formatted = formatarCEP(e.target.value);
                setValue('endereco.cep', formatted);
              }}
              className={buscandoCEP ? "border-navy-200 pr-10" : "border-navy-200"}
            />
            {buscandoCEP && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {errors.endereco?.cep && <p className="text-sm text-destructive">{errors.endereco.cep.message}</p>}
          <p className="text-xs text-muted-foreground">
            Digite o CEP para buscar automaticamente
          </p>
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
      </div>
    </FormSheet>
  );
}
