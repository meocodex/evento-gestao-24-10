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
    default: 'bg-card',
    primary: 'bg-gradient-primary text-white',
    success: 'bg-gradient-success text-white',
    warning: 'bg-gradient-warning text-white',
    danger: 'bg-gradient-danger text-white',
  };

  const isGradient = variant !== 'default';

  return (
    <Card className={`${variantStyles[variant]} border-0 shadow-md hover:shadow-lg transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isGradient ? 'text-white/80' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <h3 className={`text-2xl font-bold mt-2 ${isGradient ? 'text-white' : 'text-foreground'}`}>
              {value}
            </h3>
            {subtitle && (
              <p className={`text-xs mt-1 ${isGradient ? 'text-white/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive
                      ? isGradient
                        ? 'text-white'
                        : 'text-success'
                      : isGradient
                      ? 'text-white/80'
                      : 'text-destructive'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${isGradient ? 'bg-white/20' : 'bg-primary/10'}`}>
            <Icon className={`h-6 w-6 ${isGradient ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
