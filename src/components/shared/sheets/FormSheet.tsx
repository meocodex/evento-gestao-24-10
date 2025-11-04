import * as React from 'react';
import { BaseSheet } from './BaseSheet';
import { Button } from '@/components/ui/button';
import { SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface FormSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function FormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  isLoading = false,
  side,
  size = 'lg',
  className,
}: FormSheetProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

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
      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {children}
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
    </BaseSheet>
  );
}
