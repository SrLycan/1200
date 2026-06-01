import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
  trend?: { value: number; label?: string }; // e.g. { value: 12, label: 'vs mes anterior' }
  suffix?: string;
}

const toneConfig: Record<NonNullable<Props['tone']>, { icon: string; value: string; border: string }> = {
  default:  { icon: 'bg-primary/10 text-primary',                border: 'border-l-primary',    value: 'text-foreground' },
  success:  { icon: 'bg-emerald-500/10 text-emerald-600',        border: 'border-l-emerald-500', value: 'text-emerald-700' },
  warning:  { icon: 'bg-amber-500/10 text-amber-600',            border: 'border-l-amber-500',   value: 'text-amber-700' },
  danger:   { icon: 'bg-destructive/10 text-destructive',        border: 'border-l-destructive', value: 'text-destructive' },
  gold:     { icon: 'bg-yellow-500/10 text-yellow-600',          border: 'border-l-yellow-500',  value: 'text-yellow-700' },
};

export function KpiCard({ label, value, icon: Icon, tone = 'default', trend, suffix }: Props) {
  const cfg = toneConfig[tone];

  return (
    <Card className={cn('card-hover border-l-4', cfg.border)}>
      <CardContent className="flex items-start gap-4 p-5">
        <div className={cn('mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-lg', cfg.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
          <p className={cn('font-display text-2xl font-bold', cfg.value)}>
            {value}
            {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          {trend !== undefined && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              {trend.value >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}