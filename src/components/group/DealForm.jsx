import { useState } from 'react';
import { ArrowLeft, Banknote, CalendarClock, Sparkles, Truck, Users, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';

const QUICK_HOURS = [
  { value: 6, label: '6 giờ' },
  { value: 12, label: '12 giờ' },
  { value: 24, label: '1 ngày' },
  { value: 48, label: '2 ngày' },
  { value: 72, label: '3 ngày' },
];

export default function DealForm({ onSubmit, onCancel, submitLabel = 'Tạo kèo gom đơn' }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [shipSaving, setShipSaving] = useState('');
  const [ownerBank, setOwnerBank] = useState('');
  const [minMembers, setMinMembers] = useState(5);
  const [hours, setHours] = useState(24);
  const [errors, setErrors] = useState({});

  const savings = Math.max(0, Number(originalPrice) - Number(dealPrice));
  const discount =
    Number(originalPrice) > 0
      ? Math.max(0, Math.round((1 - Number(dealPrice) / Number(originalPrice)) * 100))
      : 0;
  const totalSavingPerPerson = savings + (Number(shipSaving) || 0);

  function validate() {
    const next = {};
    if (title.trim().length < 8) next.title = 'Tiêu đề cần ít nhất 8 ký tự';
    if (!originalPrice || Number(originalPrice) <= 0) next.originalPrice = 'Nhập giá gốc';
    if (!dealPrice || Number(dealPrice) <= 0) next.dealPrice = 'Nhập giá gom';
    if (Number(dealPrice) >= Number(originalPrice))
      next.dealPrice = 'Giá gom phải nhỏ hơn giá gốc';
    if (!minMembers || Number(minMembers) < 2) next.minMembers = 'Cần ít nhất 2 người';
    if (description.trim().length < 20)
      next.description = 'Mô tả cần ít nhất 20 ký tự';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      original_price: Number(originalPrice),
      deal_price: Number(dealPrice),
      ship_saving: Number(shipSaving) || 0,
      owner_bank: ownerBank.trim(),
      min_members: Number(minMembers),
      deadline: new Date(Date.now() + hours * 3_600_000).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card space-y-4 p-5 sm:p-6">
        <div>
          <label className="label">Tên kèo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Gom đơn trà sữa Phúc Long - giảm 25%"
            className={cn('input', errors.title && 'border-rose-400')}
            maxLength={90}
          />
          {errors.title && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.title}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Giá gốc (VND)</label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="45000"
                min={0}
                step={1000}
                className={cn('input pl-10', errors.originalPrice && 'border-rose-400')}
              />
            </div>
            {errors.originalPrice && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.originalPrice}</p>
            )}
          </div>

          <div>
            <label className="label">Giá khi gom đơn (VND)</label>
            <div className="relative">
              <Sparkles className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                value={dealPrice}
                onChange={(e) => setDealPrice(e.target.value)}
                placeholder="33000"
                min={0}
                step={1000}
                className={cn('input pl-10', errors.dealPrice && 'border-rose-400')}
              />
            </div>
            {errors.dealPrice ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.dealPrice}</p>
            ) : savings > 0 ? (
              <p className="mt-1.5 text-xs font-semibold text-emerald-600">
                Tiết kiệm {formatCurrency(savings)}/người ({discount}%)
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-brand-800">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wide">Hiển thị trên thẻ kèo</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {discount > 0 && (
                <span className="chip bg-rose-500 text-white">-{discount}%</span>
              )}
              {savings > 0 && (
                <span className="chip bg-white text-brand-700 ring-1 ring-brand-100">
                  Tiết kiệm {formatCurrency(savings)}/người
                </span>
              )}
              {Number(shipSaving) > 0 && (
                <span className="chip bg-white text-amber-700 ring-1 ring-amber-100">
                  <Truck className="h-3.5 w-3.5" />
                  Tiết kiệm {formatCurrency(Number(shipSaving))} phí ship
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-brand-700/80">
            Tổng tiết kiệm mỗi người: <b>{formatCurrency(totalSavingPerPerson)}</b> — con số này
            hiện ngay trên thẻ để mọi người thấy rõ lợi ích khi gom đơn.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Tiết kiệm phí ship / người (VND)</label>
            <div className="relative">
              <Truck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                value={shipSaving}
                onChange={(e) => setShipSaving(e.target.value)}
                placeholder="15000"
                min={0}
                step={1000}
                className="input pl-10"
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-400">Không bắt buộc, dùng khi gom ship chung.</p>
          </div>

          <div>
            <label className="label">Ngân hàng / STK nhận tiền</label>
            <div className="relative">
              <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={ownerBank}
                onChange={(e) => setOwnerBank(e.target.value)}
                placeholder="VD: Vietcombank · 0123456789"
                maxLength={80}
                className="input pl-10"
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Hiện trong công cụ chia tiền để thành viên chuyển khoản.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Số người tối thiểu</label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                value={minMembers}
                onChange={(e) => setMinMembers(e.target.value)}
                min={2}
                max={200}
                className={cn('input pl-10', errors.minMembers && 'border-rose-400')}
              />
            </div>
            {errors.minMembers && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.minMembers}</p>
            )}
          </div>

          <div>
            <label className="label">Hạn chót</label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="input appearance-none pl-10"
              >
                {QUICK_HOURS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sau {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_HOURS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setHours(option.value)}
              className={cn(
                'chip border transition',
                hours === option.value
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Mô tả kèo</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Gom ở đâu, đặt lúc mấy giờ, thanh toán thế nào, ai nhận hàng…"
            className={cn('input resize-none', errors.description && 'border-rose-400')}
            maxLength={600}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs font-medium text-rose-600">{errors.description}</p>
            ) : (
              <p className="text-xs text-ink-400">Nói rõ cách chia tiền và nhận hàng nhé.</p>
            )}
            <span className="text-[11px] text-ink-400">{description.length}/600</span>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-ink-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <Button type="submit" size="lg" className="sm:min-w-48">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
