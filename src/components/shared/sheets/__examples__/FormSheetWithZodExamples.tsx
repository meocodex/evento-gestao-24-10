/**
 * EXEMPLOS PRÁTICOS DE USO DO FormSheetWithZod
 * 
 * Este arquivo contém diversos exemplos de como usar o FormSheetWithZod
 * em diferentes cenários comuns da aplicação.
 */

import { FormSheetWithZod } from '../FormSheetWithZod';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { z } from 'zod';

// ============================================================
// EXEMPLO 1: Formulário Simples de Contato
// ============================================================

const contatoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  mensagem: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
});

type ContatoFormData = z.infer<typeof contatoSchema>;

export function ExemploFormularioContato() {
  const handleSubmit = async (data: ContatoFormData) => {
    console.log('Dados do contato:', data);
    // await api.enviarContato(data);
  };

  return (
    <FormSheetWithZod
      open={true}
      title="Entrar em Contato"
      description="Envie uma mensagem para nossa equipe"
      schema={contatoSchema}
      defaultValues={{ nome: '', email: '', mensagem: '' }}
      onSubmit={handleSubmit}
      submitText="Enviar Mensagem"
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="joao@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mensagem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escreva sua mensagem aqui..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSheetWithZod>
  );
}

// ============================================================
// EXEMPLO 2: Formulário com Select e Dependências
// ============================================================

const configuracaoSchema = z.object({
  tipo: z.enum(['individual', 'empresa']),
  documento: z.string().min(1, 'Documento é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
});

export function ExemploFormularioComSelect() {
  const handleSubmit = async (data: z.infer<typeof configuracaoSchema>) => {
    console.log('Configuração:', data);
  };

  return (
    <FormSheetWithZod
      open={true}
      title="Configurar Cliente"
      schema={configuracaoSchema}
      defaultValues={{ tipo: 'individual', documento: '', categoria: '' }}
      onSubmit={handleSubmit}
    >
      {(form) => {
        const tipo = form.watch('tipo');
        
        return (
          <>
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tipo === 'individual' ? 'CPF' : 'CNPJ'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tipo === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      }}
    </FormSheetWithZod>
  );
}

// ============================================================
// EXEMPLO 3: Formulário com DatePicker
// ============================================================

const agendamentoSchema = z.object({
  titulo: z.string().min(3, 'Título é obrigatório'),
  data: z.date({ required_error: 'Data é obrigatória' }),
  horario: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido'),
});

export function ExemploFormularioComData() {
  const handleSubmit = async (data: z.infer<typeof agendamentoSchema>) => {
    console.log('Agendamento:', data);
  };

  return (
    <FormSheetWithZod
      open={true}
      title="Novo Agendamento"
      schema={agendamentoSchema}
      defaultValues={{
        titulo: '',
        data: new Date(),
        horario: '09:00',
      }}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Evento</FormLabel>
                <FormControl>
                  <Input placeholder="Reunião com cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Selecione a data do agendamento
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSheetWithZod>
  );
}

// ============================================================
// EXEMPLO 4: Formulário com Checkbox e RadioGroup
// ============================================================

const preferenciaSchema = z.object({
  notificacoes: z.boolean(),
  frequencia: z.enum(['diaria', 'semanal', 'mensal']),
  categorias: z.array(z.string()).min(1, 'Selecione pelo menos uma categoria'),
});

export function ExemploFormularioComCheckbox() {
  const handleSubmit = async (data: z.infer<typeof preferenciaSchema>) => {
    console.log('Preferências:', data);
  };

  const categorias = [
    { id: 'eventos', label: 'Eventos' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'financeiro', label: 'Financeiro' },
  ];

  return (
    <FormSheetWithZod
      open={true}
      title="Preferências de Notificação"
      schema={preferenciaSchema}
      defaultValues={{
        notificacoes: true,
        frequencia: 'diaria',
        categorias: ['eventos'],
      }}
      onSubmit={handleSubmit}
    >
      {(form) => (
        <>
          <FormField
            control={form.control}
            name="notificacoes"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Receber notificações</FormLabel>
                  <FormDescription>
                    Ative para receber atualizações por email
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequencia"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Frequência de Notificações</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="diaria" />
                      </FormControl>
                      <FormLabel className="font-normal">Diariamente</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="semanal" />
                      </FormControl>
                      <FormLabel className="font-normal">Semanalmente</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="mensal" />
                      </FormControl>
                      <FormLabel className="font-normal">Mensalmente</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categorias"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Categorias</FormLabel>
                  <FormDescription>
                    Selecione as categorias que deseja acompanhar
                  </FormDescription>
                </div>
                {categorias.map((categoria) => (
                  <FormField
                    key={categoria.id}
                    control={form.control}
                    name="categorias"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={categoria.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(categoria.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, categoria.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== categoria.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {categoria.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </FormSheetWithZod>
  );
}

// ============================================================
// EXEMPLO 5: Formulário em Grid com Múltiplas Colunas
// ============================================================

const enderecoSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
});

export function ExemploFormularioEmGrid() {
  const handleSubmit = async (data: z.infer<typeof enderecoSchema>) => {
    console.log('Endereço:', data);
  };

  return (
    <FormSheetWithZod
      open={true}
      title="Cadastrar Endereço"
      schema={enderecoSchema}
      defaultValues={{
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      }}
      onSubmit={handleSubmit}
      size="xl"
    >
      {(form) => (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="00000-000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="logradouro"
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
          </div>

          <FormField
            control={form.control}
            name="numero"
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
            control={form.control}
            name="complemento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Apto, Sala, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Estado</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    {/* ... mais estados */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </FormSheetWithZod>
  );
}
