import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-4xl bg-brand-50 text-brand-600">
        <Compass className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-ink-900">404</h1>
      <p className="mt-2 text-sm text-ink-500">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/dashboard" className="mt-6">
        <Button>Về trang tổng quan</Button>
      </Link>
    </div>
  );
}