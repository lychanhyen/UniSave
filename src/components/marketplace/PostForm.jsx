import { useState } from 'react';
import { ArrowLeft, Check, MapPin, Phone, Tag, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { useCampuses } from '../../context/CampusContext';
import { POST_CATEGORIES, POST_TYPES } from '../../lib/constants';
import { Button } from '../ui/Button';
import ImageUploader from './ImageUploader';

export default function PostForm({ initial, onSubmit, onCancel, submitLabel = 'Đăng tin' }) {
  const { active: campusOptions, itemOf } = useCampuses();
  const fallbackCampus = campusOptions[0]?.value || 'khac';
  const initialCampus = initial?.location ? itemOf(initial.location) : null;
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [type, setType] = useState(initial?.type || 'pass');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [category, setCategory] = useState(initial?.category || 'books');
  const [location, setLocation] = useState(initial?.location || fallbackCampus);
  const [contact, setContact] = useState(initial?.contact || '');
  const [images, setImages] = useState(initial?.images || []);
  const [errors, setErrors] = useState({});

  // Tin cũ có thể trỏ tới khu vực đã bị ẩn/xoá: vẫn hiển thị để người đăng biết mà sửa.
  const locationOptions =
    initialCampus && !campusOptions.some((item) => item.value === initialCampus.value)
      ? [initialCampus, ...campusOptions]
      : campusOptions;

  function validate() {
    const next = {};
    if (title.trim().length < 8) next.title = 'Tiêu đề cần ít nhất 8 ký tự';
    if (!price || Number(price) <= 0) next.price = 'Nhập giá hợp lệ';
    if (!/^0\d{8,10}$/.test(contact.replace(/\s/g, '')))
      next.contact = 'Số điện thoại/Zalo không hợp lệ (VD: 0987654321)';
    if (description.trim().length < 20)
      next.description = 'Mô tả cần ít nhất 20 ký tự để người mua hiểu rõ';
    if (!location) next.location = 'Chọn khu vực trường/KTX để người mua dễ nhận hàng';
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
      type,
      price: Number(price),
      category,
      location,
      contact: contact.replace(/\s/g, ''),
      images,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="section-title">Ảnh sản phẩm</h2>
            <p className="text-xs text-ink-400">Ảnh rõ ràng giúp tin của bạn bán nhanh hơn.</p>
          </div>
        </div>
        <ImageUploader value={images} onChange={setImages} max={4} />
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <div>
          <label className="label">Tiêu đề tin đăng</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Giáo trình Kinh tế vĩ mô bản mới 95%"
            className={cn('input', errors.title && 'border-rose-400')}
            maxLength={90}
          />
          <div className="mt-1.5 flex items-center justify-between">
            {errors.title ? (
              <p className="text-xs font-medium text-rose-600">{errors.title}</p>
            ) : (
              <p className="text-xs text-ink-400">Ngắn gọn, nêu rõ món đồ và tình trạng.</p>
            )}
            <span className="text-[11px] text-ink-400">{title.length}/90</span>
          </div>
        </div>

        <div>
          <label className="label">Hình thức</label>
          <div className="grid grid-cols-2 gap-3">
            {POST_TYPES.map((item) => {
              const active = type === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setType(item.value)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition',
                    active
                      ? 'border-brand-500 bg-brand-50/70 ring-4 ring-brand-500/10'
                      : 'border-ink-200 bg-white hover:border-ink-300'
                  )}
                >
                  <div>
                    <p className="text-sm font-bold text-ink-900">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {item.value === 'pass' ? 'Bán lại đồ đã dùng' : 'Cho thuê theo ngày/tháng'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'grid h-5 w-5 place-items-center rounded-full border transition',
                      active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-300 text-transparent'
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Danh mục</label>
          <div className="flex flex-wrap gap-2">
            {POST_CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    'chip border transition',
                    active
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Khu vực trường / KTX</label>
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((campus) => {
              const active = location === campus.value;
              return (
                <button
                  key={campus.value}
                  type="button"
                  onClick={() => setLocation(campus.value)}
                  className={cn(
                    'chip border transition',
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700'
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {campus.label}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-400">
            Ưu tiên giao dịch gần: người mua cùng khu vực sẽ thấy tin của bạn trước, đỡ phí ship.
          </p>
          {errors.location && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.location}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              {type === 'rent' ? 'Giá thuê / tháng (VND)' : 'Giá bán (VND)'}
            </label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="65000"
                min={0}
                step={1000}
                className={cn('input pl-10', errors.price && 'border-rose-400')}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="label">Số điện thoại / Zalo</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="0987654321"
                inputMode="tel"
                className={cn('input pl-10', errors.contact && 'border-rose-400')}
              />
            </div>
            {errors.contact ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.contact}</p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-400">Người mua sẽ liên hệ qua số này.</p>
            )}
          </div>
        </div>

        <div>
          <label className="label">Mô tả chi tiết</label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-ink-400" />
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tình trạng món đồ, lý do bán, địa điểm nhận hàng, có thể thương lượng không…"
              className={cn('input resize-none pl-10', errors.description && 'border-rose-400')}
              maxLength={800}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs font-medium text-rose-600">{errors.description}</p>
            ) : (
              <p className="text-xs text-ink-400">Càng chi tiết càng dễ chốt đơn.</p>
            )}
            <span className="text-[11px] text-ink-400">{description.length}/800</span>
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
        <Button type="submit" size="lg" className="sm:min-w-44">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
