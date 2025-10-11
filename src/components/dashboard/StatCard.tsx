import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-lg hover:border-border',
    primary: 'bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white border-0 shadow-md shadow-primary/20 hover:shadow-xl hover:shadow-primary/30',
    success: 'bg-gradient-to-br from-success/90 to-emerald-500/90 text-white border-0 shadow-md shadow-success/20 hover:shadow-xl hover:shadow-success/30',
    warning: 'bg-gradient-to-br from-warning/90 to-orange-500/90 text-white border-0 shadow-md shadow-warning/20 hover:shadow-xl hover:shadow-warning/30',
    danger: 'bg-gradient-to-br from-destructive/90 to-rose-600/90 text-white border-0 shadow-md shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30',
  };

  const isGradient = variant !== 'default';

  return (
    <Card className={`${variantStyles[variant]} ${isGradient ? 'border-0' : 'border'} overflow-hidden relative group hover:-translate-y-1 transition-all duration-500 rounded-2xl`}>
      {/* Subtle pattern background for gradient cards */}
      {isGradient && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>
      )}
      
      {/* Glassmorphism overlay for default variant */}
      {!isGradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm" />
      )}
      
      <CardContent className="p-8 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isGradient ? 'text-white/70' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <h3 className={`text-4xl font-display font-bold mb-2 tracking-tight ${isGradient ? 'text-white' : 'text-foreground'}`}>
              {value}
            </h3>
            {subtitle && (
              <p className={`text-sm ${isGradient ? 'text-white/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-4">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  trend.isPositive 
                    ? isGradient ? 'bg-white/15 backdrop-blur-sm text-white' : 'bg-success/10 text-success'
                    : isGradient ? 'bg-white/15 backdrop-blur-sm text-white' : 'bg-destructive/10 text-destructive'
                }`}>
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{trend.value}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
            isGradient ? 'bg-white/10 backdrop-blur-sm' : 'bg-primary/5'
          }`}>
            <Icon className={`h-8 w-8 ${isGradient ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
