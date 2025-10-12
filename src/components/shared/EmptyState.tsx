import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="p-6 rounded-full bg-navy-50">
          <Icon className="h-16 w-16 text-navy-600" />
        </div>
      </div>
      
      <h3 className="text-2xl font-display font-bold text-navy-800 mb-2">
        {title}
      </h3>
      
      <p className="text-navy-600 max-w-md mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="default"
          size="lg"
          className="shadow-xl"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
