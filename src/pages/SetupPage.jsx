import { useNavigate } from 'react-router-dom';
import { Settings2, ArrowRight, Database, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';

const STEPS = [
  {
    icon: Database,
    title: 'Tạo project Supabase',
    desc: 'Truy cập supabase.com, tạo project mới và chờ khởi tạo xong.',
  },
  {
    icon: KeyRound,
    title: 'Lấy URL và anon key',
    desc: 'Vào Settings → API, sao chép Project URL và anon public key.',
  },
  {
    icon: Settings2,
    title: 'Cập nhật .env.local',
    desc: 'Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi khởi động lại dev server.',
  },
];

export default function SetupPage() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Thiết lập"
        title="Kết nối Supabase"
        subtitle="Ứng dụng đang chạy ở chế độ xem trước. Hoàn tất 3 bước dưới đây để bật đăng nhập và dữ liệu thật."
      />

      <div className="space-y-4">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="card flex items-start gap-4 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Bước {i + 1}</p>
              <h3 className="mt-0.5 text-base font-bold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 bg-ink-900 p-5 text-ink-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">.env.local</p>
        <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-brand-300">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
        </pre>
      </div>

      <Button className="mt-6" onClick={() => navigate('/dashboard')}>
        Xem giao diện demo
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}