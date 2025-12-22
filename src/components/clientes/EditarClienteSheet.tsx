import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSheet } from '@/components/shared/sheets';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useClientes } from '@/hooks/clientes';
import { clienteSchema } from '@/lib/validations/cliente';
import { ClienteFormData, Cliente } from '@/types/eventos';
import { buscarEnderecoPorCEP } from '@/lib/api/viacep';

interface EditarClienteSheetProps {
  cliente: Cliente;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditarClienteSheet({ cliente, open, onOpenChange }: EditarClienteSheetProps) {
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const { editarCliente } = useClientes();
  const loading = editarCliente.isPending;

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const { handleSubmit, watch, setValue, reset, control } = form;

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
      await editarCliente.mutateAsync({ id: cliente.id, data });
      reset();
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no contexto
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Cliente"
      description="Atualize as informações do cliente"
      onSubmit={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      isLoading={loading}
      submitText="Salvar Alterações"
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Tipo de Cliente */}
          <FormField
            control={control}
            name="tipo"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Tipo de Cliente</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CPF" id="cpf-edit" />
                      <Label htmlFor="cpf-edit" className="cursor-pointer text-sm">
                        CPF (Pessoa Física)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CNPJ" id="cnpj-edit" />
                      <Label htmlFor="cnpj-edit" className="cursor-pointer text-sm">
                        CNPJ (Pessoa Jurídica)
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nome */}
          <FormField
            control={control}
            name="nome"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">
                  {tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'} *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={tipo === 'CPF' ? 'Ex: João da Silva' : 'Ex: Empresa LTDA'}
                    className="h-9"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Documento + Telefone + WhatsApp */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <FormField
                control={control}
                name="documento"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">
                      {tipo === 'CPF' ? 'CPF' : 'CNPJ'} *
                    </FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="documento"
                        documentType={tipo}
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4">
              <FormField
                control={control}
                name="telefone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Telefone *</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="telefone"
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-4">
              <FormField
                control={control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">WhatsApp</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="telefone"
                        value={field.value || ''}
                        onChange={field.onChange}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Email */}
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Endereço */}
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium mb-3">Endereço</h4>
            
            {/* CEP + Logradouro + Número */}
            <div className="grid grid-cols-12 gap-3 mb-3">
              <div className="col-span-3">
                <FormField
                  control={control}
                  name="endereco.cep"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <FormLabel className="text-sm">CEP</FormLabel>
                        {buscandoCEP && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                      </div>
                      <FormControl>
                        <MaskedInput
                          mask="cep"
                          value={field.value || ''}
                          onChange={field.onChange}
                          className="h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-7">
                <FormField
                  control={control}
                  name="endereco.logradouro"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, Avenida, etc." className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={control}
                  name="endereco.numero"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">Nº</FormLabel>
                      <FormControl>
                        <Input placeholder="123" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Complemento */}
            <div className="mb-3">
              <FormField
                control={control}
                name="endereco.complemento"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, Sala, etc." className="h-9" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bairro + Cidade + UF */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <FormField
                  control={control}
                  name="endereco.bairro"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-6">
                <FormField
                  control={control}
                  name="endereco.cidade"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2">
                <FormField
                  control={control}
                  name="endereco.estado"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">UF</FormLabel>
                      <FormControl>
                        <Input placeholder="MT" maxLength={2} className="h-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </FormSheet>
  );
}
