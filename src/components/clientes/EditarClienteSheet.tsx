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
        <div className="space-y-6">
          <FormField
            control={control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cliente</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tipo === 'CPF' ? 'Nome Completo' : 'Razão Social'} *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={tipo === 'CPF' ? 'Ex: João da Silva' : 'Ex: Empresa LTDA'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="documento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tipo === 'CPF' ? 'CPF' : 'CNPJ'} *
                </FormLabel>
                <FormControl>
                  <MaskedInput
                    mask="documento"
                    documentType={tipo}
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="telefone"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <MaskedInput
                      mask="telefone"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Endereço</h3>
            
            <FormField
              control={control}
              name="endereco.cep"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>CEP</FormLabel>
                    {buscandoCEP && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                  <FormControl>
                    <MaskedInput
                      mask="cep"
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="endereco.logradouro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Avenida, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="endereco.numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endereco.complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, Sala, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="endereco.bairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="endereco.cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="endereco.estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="UF" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </Form>
    </FormSheet>
  );
}
