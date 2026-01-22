import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'stagnant' | 'warning' | 'error' | 'success';
  label?: string;
  className?: string;
}

const statusConfig = {
  active: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success',
    defaultLabel: '활동',
  },
  stagnant: {
    bg: 'bg-amber/10',
    text: 'text-amber',
    border: 'border-amber/30',
    dot: 'bg-amber',
    defaultLabel: '정체',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning',
    defaultLabel: '경고',
  },
  error: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    border: 'border-destructive/30',
    dot: 'bg-destructive',
    defaultLabel: '오류',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success',
    defaultLabel: '완료',
  },
};

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-soft', config.dot)} />
      {label || config.defaultLabel}
    </span>
  );
};
