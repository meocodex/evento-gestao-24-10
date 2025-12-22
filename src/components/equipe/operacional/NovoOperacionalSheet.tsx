import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSheet } from '@/components/shared/sheets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaskedInput } from '@/components/ui/masked-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus } from 'lucide-react';
import { useEquipe } from '@/hooks/equipe';
import { useCategorias } from '@/hooks/categorias';
import { useToast } from '@/hooks/use-toast';
import { operacionalSchema, type OperacionalInput } from '@/lib/validations/operacional';

interface NovoOperacionalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoOperacionalSheet({ open, onOpenChange }: NovoOperacionalSheetProps) {
  const { criarOperacional } = useEquipe();
  const { funcoesEquipe, adicionarCategoria } = useCategorias();
  const { toast } = useToast();

  const [mostrarAdicionarFuncao, setMostrarAdicionarFuncao] = useState(false);
  const [novaFuncaoNome, setNovaFuncaoNome] = useState('');

  const form = useForm<OperacionalInput>({
    resolver: zodResolver(operacionalSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      whatsapp: '',
      email: '',
      funcao_principal: '',
      tipo_vinculo: 'freelancer',
      cnpj_pj: '',
      observacoes: ''
    }
  });

  const tipoVinculo = form.watch('tipo_vinculo');

  const onSubmit = async (data: OperacionalInput) => {
    try {
      await criarOperacional.mutateAsync({
        nome: data.nome,
        cpf: data.cpf || null,
        telefone: data.telefone,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        funcao_principal: data.funcao_principal,
        tipo_vinculo: data.tipo_vinculo,
        cnpj_pj: data.cnpj_pj || null,
        observacoes: data.observacoes || null,
        funcoes_secundarias: null,
        foto: null,
        documentos: null,
        status: 'ativo'
      });

      toast({
        title: 'Membro cadastrado!',
        description: `${data.nome} foi cadastrado como operacional. Use "Conceder Acesso" para criar credenciais de sistema.`
      });

      form.reset();
      setMostrarAdicionarFuncao(false);
      setNovaFuncaoNome('');
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar operacional';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cadastrar Membro da Equipe Operacional"
      onSubmit={form.handleSubmit(onSubmit)}
      isLoading={criarOperacional.isPending}
      submitText="Cadastrar"
      size="lg"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Nome */}
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Nome Completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CPF + Telefone + WhatsApp */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">CPF</FormLabel>
                    <FormControl>
                      <MaskedInput
                        mask="cpf"
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
                control={form.control}
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
                control={form.control}
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
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Função Principal */}
          <FormField
            control={form.control}
            name="funcao_principal"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Função Principal *</FormLabel>
                {!mostrarAdicionarFuncao ? (
                  <div className="flex gap-2">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value === '__adicionar__') {
                          setMostrarAdicionarFuncao(true);
                        } else {
                          field.onChange(value);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {funcoesEquipe?.map((funcao) => (
                          <SelectItem key={funcao.value} value={funcao.label}>
                            {funcao.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="__adicionar__">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar nova função
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={novaFuncaoNome}
                      onChange={(e) => setNovaFuncaoNome(e.target.value)}
                      placeholder="Nome da nova função"
                      className="h-9"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-9"
                      onClick={async () => {
                        if (novaFuncaoNome.trim()) {
                          try {
                            await adicionarCategoria.mutateAsync({ 
                              tipo: 'funcoes_equipe',
                              categoria: {
                                value: novaFuncaoNome.trim().toLowerCase().replace(/\s+/g, '_'),
                                label: novaFuncaoNome.trim(),
                                ativa: true
                              }
                            });
                            field.onChange(novaFuncaoNome.trim());
                            setMostrarAdicionarFuncao(false);
                            setNovaFuncaoNome('');
                          } catch (error) {
                            toast({
                              title: 'Erro',
                              description: 'Não foi possível adicionar a função',
                              variant: 'destructive'
                            });
                          }
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        setMostrarAdicionarFuncao(false);
                        setNovaFuncaoNome('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Vínculo + CNPJ */}
          <div className="grid grid-cols-12 gap-3">
            <div className={tipoVinculo === 'pj' ? 'col-span-6' : 'col-span-12'}>
              <FormField
                control={form.control}
                name="tipo_vinculo"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm">Tipo de Vínculo *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clt">CLT</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="pj">PJ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {tipoVinculo === 'pj' && (
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name="cnpj_pj"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm">CNPJ *</FormLabel>
                      <FormControl>
                        <MaskedInput
                          mask="cnpj"
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
            )}
          </div>

          {/* Observações */}
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm">Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais..."
                    rows={3}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormSheet>
  );
}
