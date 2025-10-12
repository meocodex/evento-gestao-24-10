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
    default: 'bg-white border-2 border-navy-100 hover:border-navy-300',
    primary: 'bg-white border-2 border-navy-100 hover:border-navy-400',
    success: 'bg-white border-2 border-emerald-100 hover:border-emerald-300',
    warning: 'bg-white border-2 border-amber-100 hover:border-amber-300',
    danger: 'bg-white border-2 border-red-100 hover:border-red-300',
  };

  const accentBarColors = {
    default: 'bg-navy-600',
    primary: 'bg-navy-600',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-destructive',
  };

  const iconBgColors = {
    default: 'bg-navy-50 group-hover:bg-navy-100',
    primary: 'bg-navy-50 group-hover:bg-navy-100',
    success: 'bg-emerald-50 group-hover:bg-emerald-100',
    warning: 'bg-amber-50 group-hover:bg-amber-100',
    danger: 'bg-red-50 group-hover:bg-red-100',
  };

  const iconColors = {
    default: 'text-navy-600',
    primary: 'text-navy-600',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <Card className={`${variantStyles[variant]} hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden relative group`}>
      {/* Accent bar lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarColors[variant]}`} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-2">
              {title}
            </p>
            <h3 className="text-4xl font-display font-bold text-navy-800 mb-2 tracking-tight">
              {value}
            </h3>
            {subtitle && (
              <p className="text-sm text-navy-500">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-3">
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
          <div className={`p-4 rounded-xl transition-all duration-300 ${iconBgColors[variant]}`}>
            <Icon className={`h-8 w-8 ${iconColors[variant]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
