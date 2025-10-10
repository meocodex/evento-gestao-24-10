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
    default: 'bg-card hover:shadow-xl',
    primary: 'bg-gradient-to-br from-primary via-primary to-accent text-white shadow-lg hover:shadow-2xl',
    success: 'bg-gradient-to-br from-success to-emerald-500 text-white shadow-lg hover:shadow-2xl',
    warning: 'bg-gradient-to-br from-warning to-orange-500 text-white shadow-lg hover:shadow-2xl',
    danger: 'bg-gradient-to-br from-destructive to-rose-600 text-white shadow-lg hover:shadow-2xl',
  };

  const isGradient = variant !== 'default';

  return (
    <Card className={`${variantStyles[variant]} border-0 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300`}>
      {/* Pattern background for gradient cards */}
      {isGradient && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>
      )}
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isGradient ? 'text-white/90' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <h3 className={`text-3xl font-display font-bold mt-2 ${isGradient ? 'text-white' : 'text-foreground'}`}>
              {value}
            </h3>
            {subtitle && (
              <p className={`text-xs mt-1 ${isGradient ? 'text-white/80' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  trend.isPositive 
                    ? isGradient ? 'bg-white/20 text-white' : 'bg-success/10 text-success'
                    : isGradient ? 'bg-white/20 text-white' : 'bg-destructive/10 text-destructive'
                }`}>
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{trend.value}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
            isGradient ? 'bg-white/20 backdrop-blur-sm' : 'bg-primary/10'
          }`}>
            <Icon className={`h-7 w-7 ${isGradient ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
