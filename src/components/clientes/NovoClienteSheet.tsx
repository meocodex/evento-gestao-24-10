import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSheet, useSheetState } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Loader2 } from 'lucide-react';
import { useClientes } from '@/hooks/clientes';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData } from '@/types/eventos';
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
      <div className="space-y-4">
        {/* Tipo de Cliente */}
        <div className="space-y-1.5">
          <Label className="text-sm text-navy-700">Tipo de Cliente</Label>
          <RadioGroup
            value={tipo}
            onValueChange={(value) => setValue('tipo', value as 'CPF' | 'CNPJ')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CPF" id="cpf" />
              <Label htmlFor="cpf" className="cursor-pointer text-sm text-navy-700">
                CPF (Pessoa Física)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CNPJ" id="cnpj" />
              <Label htmlFor="cnpj" className="cursor-pointer text-sm text-navy-700">
                CNPJ (Pessoa Jurídica)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Nome */}
        <div className="space-y-1.5">
          <Label htmlFor="nome" className="text-sm text-navy-700">
            {tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'} *
          </Label>
          <Input 
            id="nome" 
            {...register('nome')} 
            placeholder={tipo === 'CPF' ? 'João da Silva' : 'Empresa Ltda'} 
            className="h-9 border-navy-200" 
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>

        {/* Documento + Telefone + WhatsApp */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="documento" className="text-sm text-navy-700">
              {tipo === 'CPF' ? 'CPF' : 'CNPJ'} *
            </Label>
            <MaskedInput
              id="documento"
              mask="documento"
              documentType={tipo}
              value={watch('documento') || ''}
              onChange={(value) => setValue('documento', value)}
              className="h-9 border-navy-200"
            />
            {errors.documento && <p className="text-xs text-destructive">{errors.documento.message}</p>}
          </div>
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="telefone" className="text-sm text-navy-700">Telefone *</Label>
            <MaskedInput
              id="telefone"
              mask="telefone"
              value={watch('telefone') || ''}
              onChange={(value) => setValue('telefone', value)}
              className="h-9 border-navy-200"
            />
            {errors.telefone && <p className="text-xs text-destructive">{errors.telefone.message}</p>}
          </div>
          <div className="col-span-4 space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm text-navy-700">WhatsApp</Label>
            <MaskedInput
              id="whatsapp"
              mask="telefone"
              value={watch('whatsapp') || ''}
              onChange={(value) => setValue('whatsapp', value)}
              className="h-9 border-navy-200"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm text-navy-700">Email *</Label>
          <Input 
            id="email" 
            type="email" 
            {...register('email')} 
            placeholder="contato@email.com" 
            className="h-9 border-navy-200" 
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Endereço */}
        <div className="pt-3 border-t border-navy-100">
          <h4 className="text-sm font-medium text-navy-800 mb-3">Endereço</h4>
          
          {/* CEP + Logradouro + Número */}
          <div className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-3 space-y-1.5">
              <Label htmlFor="cep" className="text-sm text-navy-700">CEP</Label>
              <div className="relative">
                <MaskedInput
                  id="cep"
                  mask="cep"
                  value={watch('endereco.cep') || ''}
                  onChange={(value) => setValue('endereco.cep', value)}
                  className={`h-9 ${buscandoCEP ? "border-navy-200 pr-8" : "border-navy-200"}`}
                />
                {buscandoCEP && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.endereco?.cep && <p className="text-xs text-destructive">{errors.endereco.cep.message}</p>}
            </div>
            <div className="col-span-7 space-y-1.5">
              <Label htmlFor="logradouro" className="text-sm text-navy-700">Logradouro</Label>
              <Input 
                id="logradouro" 
                {...register('endereco.logradouro')} 
                placeholder="Rua, Avenida..." 
                className="h-9 border-navy-200" 
              />
              {errors.endereco?.logradouro && (
                <p className="text-xs text-destructive">{errors.endereco.logradouro.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="numero" className="text-sm text-navy-700">Nº</Label>
              <Input 
                id="numero" 
                {...register('endereco.numero')} 
                placeholder="123" 
                className="h-9 border-navy-200" 
              />
              {errors.endereco?.numero && <p className="text-xs text-destructive">{errors.endereco.numero.message}</p>}
            </div>
          </div>

          {/* Complemento */}
          <div className="space-y-1.5 mb-3">
            <Label htmlFor="complemento" className="text-sm text-navy-700">Complemento</Label>
            <Input 
              id="complemento" 
              {...register('endereco.complemento')} 
              placeholder="Apt, Sala, Bloco..." 
              className="h-9 border-navy-200" 
            />
          </div>

          {/* Bairro + Cidade + UF */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4 space-y-1.5">
              <Label htmlFor="bairro" className="text-sm text-navy-700">Bairro</Label>
              <Input 
                id="bairro" 
                {...register('endereco.bairro')} 
                placeholder="Centro" 
                className="h-9 border-navy-200" 
              />
              {errors.endereco?.bairro && <p className="text-xs text-destructive">{errors.endereco.bairro.message}</p>}
            </div>
            <div className="col-span-6 space-y-1.5">
              <Label htmlFor="cidade" className="text-sm text-navy-700">Cidade</Label>
              <Input 
                id="cidade" 
                {...register('endereco.cidade')} 
                placeholder="Cuiabá" 
                className="h-9 border-navy-200" 
              />
              {errors.endereco?.cidade && <p className="text-xs text-destructive">{errors.endereco.cidade.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="estado" className="text-sm text-navy-700">UF</Label>
              <Input 
                id="estado" 
                {...register('endereco.estado')} 
                placeholder="MT" 
                maxLength={2} 
                className="h-9 border-navy-200" 
              />
              {errors.endereco?.estado && <p className="text-xs text-destructive">{errors.endereco.estado.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </FormSheet>
  );
}
