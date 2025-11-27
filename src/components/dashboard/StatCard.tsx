import React from 'react';
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

export const StatCard = React.memo(function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border border-border hover:border-border/80',
    primary: 'bg-card border border-primary/20 hover:border-primary/40',
    success: 'bg-card border border-success/20 hover:border-success/40',
    warning: 'bg-card border border-warning/20 hover:border-warning/40',
    danger: 'bg-card border border-destructive/20 hover:border-destructive/40',
  };

  const accentBarColors = {
    default: 'bg-primary',
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
  };

  const iconBgColors = {
    default: 'bg-primary/10 group-hover:bg-primary/20',
    primary: 'bg-primary/10 group-hover:bg-primary/20',
    success: 'bg-success/10 group-hover:bg-success/20',
    warning: 'bg-warning/10 group-hover:bg-warning/20',
    danger: 'bg-destructive/10 group-hover:bg-destructive/20',
  };

  const iconColors = {
    default: 'text-primary',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <Card className={`${variantStyles[variant]} smooth-hover shadow-md rounded-xl overflow-hidden relative group`}>
      {/* Accent bar lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarColors[variant]}`} />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {title}
            </p>
            <h3 className="text-2xl font-display font-bold text-card-foreground mb-1 tracking-tight">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  trend.isPositive 
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <span>{trend.isPositive ? '↑' : '↓'}</span>
                  <span>{trend.value}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl transition-all duration-300 ${iconBgColors[variant]}`}>
            <Icon className={`h-6 w-6 ${iconColors[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
