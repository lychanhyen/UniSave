import { Menu, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';

export default function MobileHeader({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-100"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <PiggyBank className="h-4.5 w-4.5" />
        </span>
        <span className="text-base font-extrabold tracking-tight text-ink-900">UniSave</span>
      </Link>
      <Link
        to="/dashboard"
        className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-glow"
        aria-label="Thêm chi tiêu"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </header>
  );
}
