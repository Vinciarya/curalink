import { cn } from '../../lib/utils';

const variants = {
  default: 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]',
  secondary: 'border-[var(--bg-border)] bg-white/5 text-[var(--text-secondary)]',
  outline: 'border-[var(--bg-border)] bg-transparent text-[var(--text-secondary)]',
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  warning: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  info: 'border-sky-400/20 bg-sky-400/10 text-sky-300'
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
