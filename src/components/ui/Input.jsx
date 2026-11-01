import { cn } from '../../lib/utils';

export function Input({
  label,
  hint,
  error,
  icon: Icon,
  type = 'text',
  className,
  ...props
}) {
  return (
    <div className={cn('mb-4', className)}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <input
          type={type}
          className={cn('input', Icon && 'pl-11', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15')}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default Input;
