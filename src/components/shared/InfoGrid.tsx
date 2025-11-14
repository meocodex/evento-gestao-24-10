import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoGridItemProps {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  fullWidth?: boolean;
}

interface InfoGridCompactItemProps {
  icon?: LucideIcon;
  value: ReactNode;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
}

interface InfoGridProps {
  items: InfoGridItemProps[];
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface InfoGridCompactProps {
  items: InfoGridCompactItemProps[];
  className?: string;
}

const gapClasses = {
  sm: 'gap-x-2 gap-y-1.5',
  md: 'gap-x-3 gap-y-2',
  lg: 'gap-x-4 gap-y-2.5',
};

export function InfoGridItem({
  icon: Icon,
  label,
  value,
  className,
  iconClassName,
  labelClassName,
  valueClassName,
  fullWidth = false,
}: InfoGridItemProps) {
  return (
    <div className={cn('flex items-center gap-2', fullWidth && 'col-span-2', className)}>
      {Icon && (
        <Icon className={cn('h-4 w-4 text-muted-foreground shrink-0', iconClassName)} />
      )}
      <span className="text-xs truncate">
        <span className={cn('font-medium text-foreground', labelClassName)}>{label}:</span>{' '}
        <span className={cn('text-muted-foreground', valueClassName)}>{value}</span>
      </span>
    </div>
  );
}

export function InfoGrid({ 
  items, 
  columns = 2, 
  gap = 'md',
  className 
}: InfoGridProps) {
  const gridClass = columns === 1 
    ? 'grid-cols-1' 
    : columns === 3 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' 
    : 'grid-cols-2';

  return (
    <div className={cn(
      'grid text-sm',
      gridClass,
      gapClasses[gap],
      className
    )}>
      {items.map((item, index) => (
        <InfoGridItem key={index} {...item} />
      ))}
    </div>
  );
}

// Variant compacto para uso em cards pequenos
export function InfoGridCompact({ 
  items, 
  className 
}: InfoGridCompactProps) {
  return (
    <div className={cn('flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground', className)}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className={cn('flex items-center gap-1', item.className)}>
            {Icon && (
              <Icon className={cn('h-3 w-3 shrink-0', item.iconClassName)} />
            )}
            <span className={item.valueClassName}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
