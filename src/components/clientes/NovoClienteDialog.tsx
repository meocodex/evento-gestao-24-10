import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Loader2, Search } from 'lucide-react';
import { useClientes } from '@/contexts/ClientesContext';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData } from '@/types/eventos';
import { formatarDocumento, formatarTelefone, formatarCEP } from '@/lib/validations/cliente';

export function NovoClienteDialog() {
  const [open, setOpen] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const { criarCliente, buscarEnderecoPorCEP, loading } = useClientes();

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
  }, [cep, buscarEnderecoPorCEP, setValue]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
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
                <RadioGroupItem value="CPF" id="cpf" />
                <Label htmlFor="cpf" className="cursor-pointer">
                  CPF (Pessoa Física)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CNPJ" id="cnpj" />
                <Label htmlFor="cnpj" className="cursor-pointer">
                  CNPJ (Pessoa Jurídica)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">{tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'}</Label>
            <Input id="nome" {...register('nome')} placeholder={tipo === 'CPF' ? 'João da Silva' : 'Empresa Ltda'} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          {/* Documento */}
          <div className="space-y-2">
            <Label htmlFor="documento">{tipo === 'CPF' ? 'CPF' : 'CNPJ'}</Label>
            <Input
              id="documento"
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="contato@email.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Telefones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
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
              <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
              <Input
                id="whatsapp"
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
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <Input
                id="cep"
                {...register('endereco.cep')}
                placeholder="00000-000"
                onChange={(e) => {
                  const formatted = formatarCEP(e.target.value);
                  setValue('endereco.cep', formatted);
                }}
                className={buscandoCEP ? "pr-10" : ""}
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
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input id="logradouro" {...register('endereco.logradouro')} placeholder="Rua, Avenida..." />
              {errors.endereco?.logradouro && (
                <p className="text-sm text-destructive">{errors.endereco.logradouro.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" {...register('endereco.numero')} placeholder="123" />
              {errors.endereco?.numero && <p className="text-sm text-destructive">{errors.endereco.numero.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento (Opcional)</Label>
            <Input id="complemento" {...register('endereco.complemento')} placeholder="Apt, Sala, Bloco..." />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" {...register('endereco.bairro')} placeholder="Centro" />
              {errors.endereco?.bairro && <p className="text-sm text-destructive">{errors.endereco.bairro.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" {...register('endereco.cidade')} placeholder="Cuiabá" />
              {errors.endereco?.cidade && <p className="text-sm text-destructive">{errors.endereco.cidade.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">UF</Label>
              <Input id="estado" {...register('endereco.estado')} placeholder="MT" maxLength={2} />
              {errors.endereco?.estado && <p className="text-sm text-destructive">{errors.endereco.estado.message}</p>}
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
