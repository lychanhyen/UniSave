import { cn } from '../../lib/utils';

export function TextInput({ label, hint, error, className, ...props }) {
  return (
    <div className={cn('mb-4', className)}>
      {label && <label className="label">{label}</label>}
      <input
        type="text"
        className={cn('input', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15')}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

export default TextInput;
