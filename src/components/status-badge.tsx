import { cn } from '@/lib/utils';
import { getStatusVisual, statusBadgeClasses } from '@/lib/status-ui';

interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const visual = getStatusVisual(status);

  return (
    <span className={cn(statusBadgeClasses(), visual.bgClass, visual.textClass, className)}>
      <span aria-hidden="true">{visual.icon}</span>
      {visual.label}
    </span>
  );
}

