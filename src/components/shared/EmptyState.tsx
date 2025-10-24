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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      {/* Ícone com animação e efeitos visuais aprimorados */}
      <div className="relative mb-8 group">
        {/* Background decorativo animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-2xl scale-150 opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Círculo principal com gradiente */}
        <div className="relative p-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:scale-105">
          <Icon className="h-20 w-20 text-primary group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
        </div>
        
        {/* Efeito de brilho animado */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
      </div>
      
      {/* Título com melhor hierarquia visual */}
      <h3 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
        {title}
      </h3>
      
      {/* Descrição com melhor legibilidade */}
      <p className="text-muted-foreground text-lg max-w-lg mb-8 leading-relaxed">
        {description}
      </p>
      
      {/* Botão de ação aprimorado */}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 px-8 py-6 text-base"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
