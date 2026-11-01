import { cn } from '../../lib/utils';

export default function Card({ children, className, as: Tag = 'div', ...props }) {
  return (
    <Tag className={cn('card', className)} {...props}>
      {children}
    </Tag>
  );
}