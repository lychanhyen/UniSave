import clsx from 'clsx';

export function Textarea({ label, value, onChange, rows = 3, placeholder, className, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx('input resize-none', className)}
        {...props}
      />
    </div>
  );
}

export default Textarea;
