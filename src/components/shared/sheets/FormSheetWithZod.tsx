import * as React from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { BaseSheet } from './BaseSheet';
import { Button } from '@/components/ui/button';
import { SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface FormSheetWithZodProps<TFormData extends FieldValues> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  schema: ZodSchema<TFormData>;
  defaultValues: DefaultValues<TFormData>;
  onSubmit: (data: TFormData) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  children: (form: UseFormReturn<TFormData>) => React.ReactNode;
}

export function FormSheetWithZod<TFormData extends FieldValues>({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  isLoading = false,
  side,
  size = 'lg',
  className,
  children,
}: FormSheetWithZodProps<TFormData>) {
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
    form.reset();
  };

  const handleSubmit = async (data: TFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // O erro será tratado pelo componente pai
      throw error;
    }
  };

  // Reset form when sheet opens/closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <BaseSheet
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      side={side}
      size={size}
      className={className}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 pb-4">
              {children(form)}
            </div>
          </ScrollArea>

          <SheetFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </BaseSheet>
  );
}
