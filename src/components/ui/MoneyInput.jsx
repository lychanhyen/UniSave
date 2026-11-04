import { cn } from '../../lib/utils';

/**
 * Ô nhập tiền: hiển thị có dấu chấm phân cách nghìn (700.000) nhưng giá trị
 * truyền ra ngoài vẫn là số nguyên để tính toán.
 */
export default function MoneyInput({ value, onChange, className, placeholder, ...rest }) {
  const display =
    value === '' || value === null || value === undefined
      ? ''
      : Number(value).toLocaleString('vi-VN');

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      placeholder={placeholder}
      onChange={(event) => {
        const digits = event.target.value.replace(/[^\d]/g, '');
        onChange(digits === '' ? '' : Number(digits));
      }}
      className={cn('input tabular-nums', className)}
    />
  );
}
