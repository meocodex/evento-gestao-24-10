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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl animate-pulse-subtle" />
        <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-bounce-subtle">
          <Icon className="h-16 w-16 text-primary" />
        </div>
      </div>
      
      <h3 className="text-2xl font-display font-bold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          variant="gradient"
          size="lg"
          className="shadow-xl"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
