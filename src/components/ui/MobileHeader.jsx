import { Menu, Plus, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileHeader({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-200/70 bg-ink-50/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
          <PiggyBank className="h-4 w-4" />
        </span>
        <span className="text-[15px] font-extrabold tracking-[-0.02em] text-ink-900">UniSave</span>
      </Link>
      <Link
        to="/dashboard"
        className="grid h-10 w-10 place-items-center rounded-lg bg-brand-600 text-white"
        aria-label="Thêm chi tiêu"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </header>
  );
}