import { cn } from '../../lib/utils';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-xl border border-[var(--bg-border)] bg-white/[0.03] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary-dim)]',
        className
      )}
      {...props}
    />
  );
}
