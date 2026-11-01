import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  GraduationCap,
  Home,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { useCampuses } from '../../context/CampusContext';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { CAMPUS_KINDS, CAMPUS_KIND_MAP, isProtectedCampus } from '../../lib/campuses';
import { cn } from '../../lib/utils';

const KIND_STYLE = {
  ktx: 'bg-brand-50 text-brand-700 ring-brand-100',
  university: 'bg-blue-50 text-blue-700 ring-blue-100',
  area: 'bg-violet-50 text-violet-700 ring-violet-100',
  other: 'bg-ink-100 text-ink-600 ring-ink-200',
};

const EMPTY_FORM = { label: '', area: '', kind: 'ktx' };

export default function AdminCampusesPage() {
  const { campuses, loading, error, create, update, remove, move } = useCampuses();
  const { posts } = useMarketplace();
  const { users } = useAdminUsers();

  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [busyValue, setBusyValue] = useState('');

  const usage = useMemo(() => {
    const postCount = new Map();
    for (const post of posts || []) {
      postCount.set(post.location, (postCount.get(post.location) || 0) + 1);
    }
    const userCount = new Map();
    for (const user of users || []) {
      userCount.set(user.campus, (userCount.get(user.campus) || 0) + 1);
    }
    return { postCount, userCount };
  }, [posts, users]);

  const stats = useMemo(
    () => ({
      total: campuses.length,
      active: campuses.filter((item) => item.is_active).length,
      ktx: campuses.filter((item) => item.kind === 'ktx').length,
      university: campuses.filter((item) => item.kind === 'university').length,
    }),
    [campuses]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campuses;
    return campuses.filter((item) =>
      `${item.label} ${item.area} ${CAMPUS_KIND_MAP[item.kind]?.label || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [campuses, query]);

  // Vị trí trong danh sách đầy đủ: dùng để bật/tắt nút mũi tên đúng cả khi đang tìm kiếm.
  const positionOf = (value) => campuses.findIndex((item) => item.value === value);

  async function handleCreate(event) {
    event.preventDefault();
    if (form.label.trim().length < 2) {
      toast.error('Nhập tên khu vực (ít nhất 2 ký tự).');
      return;
    }
    setCreating(true);
    try {
      await create({
        label: form.label,
        area: form.area,
        kind: form.kind,
        is_active: true,
      });
      toast.success(`Đã thêm khu vực “${form.label.trim()}”.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      toast.error(err.message || 'Không thêm được khu vực.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item) {
    setEditing({
      value: item.value,
      label: item.label,
      area: item.area,
      kind: item.kind,
    });
  }

  async function saveEdit() {
    if (!editing) return;
    if (editing.label.trim().length < 2) {
      toast.error('Tên khu vực cần ít nhất 2 ký tự.');
      return;
    }
    setSavingEdit(true);
    try {
      await update(editing.value, {
        label: editing.label,
        area: editing.area,
        kind: editing.kind,
      });
      toast.success('Đã lưu thay đổi.');
      setEditing(null);
    } catch (err) {
      toast.error(err.message || 'Không lưu được thay đổi.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleActive(item) {
    setBusyValue(item.value);
    try {
      await update(item.value, { is_active: !item.is_active });
      toast.success(
        item.is_active
          ? `Đã tạm ẩn “${item.label}” khỏi form đăng ký và bộ lọc.`
          : `Đã bật lại “${item.label}”.`
      );
    } catch (err) {
      toast.error(err.message || 'Không đổi được trạng thái.');
    } finally {
      setBusyValue('');
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusyValue(deleting.value);
    try {
      await remove(deleting.value);
      toast.success(`Đã xoá “${deleting.label}”.`);
      setDeleting(null);
    } catch (err) {
      toast.error(err.message || 'Không xoá được khu vực.');
    } finally {
      setBusyValue('');
    }
  }

  async function handleMove(item, direction) {
    setBusyValue(item.value);
    try {
      await move(item.value, direction);
    } catch (err) {
      toast.error(err.message || 'Không đổi được thứ tự.');
    } finally {
      setBusyValue('');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị hệ thống"
        title="Khu vực & trường học"
        subtitle="Mỗi trường có KTX, cơ sở và khu vực khác nhau. Cấu hình tại đây sẽ được dùng cho đăng ký tài khoản, đăng tin và bộ lọc chợ sinh viên."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng khu vực', value: stats.total, icon: MapPin, tone: 'bg-brand-50 text-brand-600' },
          { label: 'Đang hoạt động', value: stats.active, icon: Check, tone: 'bg-emerald-50 text-emerald-600' },
          { label: 'Ký túc xá', value: stats.ktx, icon: Home, tone: 'bg-violet-50 text-violet-600' },
          { label: 'Trường đại học', value: stats.university, icon: GraduationCap, tone: 'bg-blue-50 text-blue-600' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center gap-3 p-4">
              <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-2xl', card.tone)}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-extrabold leading-none text-ink-900">{card.value}</p>
                <p className="mt-1 text-[11px] font-semibold text-ink-400">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card h-fit p-5 sm:p-6 lg:col-span-1">
          <h2 className="section-title">Thêm khu vực</h2>
          <p className="mt-1 text-xs text-ink-400">
            Tên hiển thị với sinh viên, ví dụ “KTX Khu A” hoặc “ĐH Bách Khoa”.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="campus-label">
                Tên khu vực
              </label>
              <input
                id="campus-label"
                className="input"
                placeholder="VD: KTX Khu C"
                value={form.label}
                onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                maxLength={60}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="campus-area">
                Vị trí / ghi chú
              </label>
              <input
                id="campus-area"
                className="input"
                placeholder="VD: Làng đại học, Thủ Đức"
                value={form.area}
                onChange={(event) => setForm((prev) => ({ ...prev, area: event.target.value }))}
                maxLength={80}
              />
              <p className="mt-1 text-[11px] text-ink-400">
                Hiển thị nhỏ bên cạnh tên, giúp phân biệt các cơ sở cùng tên.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="campus-kind">
                Nhóm
              </label>
              <select
                id="campus-kind"
                className="input"
                value={form.kind}
                onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
              >
                {CAMPUS_KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" loading={creating} className="w-full justify-center">
              <Plus className="h-4 w-4" />
              Thêm khu vực
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-ink-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span>
              Khu vực “Khu vực khác” là giá trị dự phòng cho hồ sơ và tin đăng cũ nên không xoá
              được. Muốn ẩn khỏi danh sách chọn, hãy tạm ẩn các khu vực không còn dùng.
            </span>
          </div>
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">Danh sách khu vực</h2>
              <p className="mt-1 text-xs text-ink-400">
                {stats.active}/{stats.total} khu vực đang hiển thị cho sinh viên.
              </p>
            </div>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                className="input pl-9"
                placeholder="Tìm khu vực…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-5 space-y-2">
            {loading && (
              <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-xs text-ink-400">
                Đang tải danh sách khu vực…
              </p>
            )}
            {!loading && !filtered.length && (
              <p className="rounded-2xl bg-ink-50 px-4 py-6 text-center text-xs text-ink-400">
                Không tìm thấy khu vực nào khớp “{query}”.
              </p>
            )}

            {filtered.map((item) => {
              const kind = CAMPUS_KIND_MAP[item.kind] || CAMPUS_KIND_MAP.other;
              const isEditing = editing?.value === item.value;
              const used = (usage.postCount.get(item.value) || 0) + (usage.userCount.get(item.value) || 0);
              const protectedItem = isProtectedCampus(item.value);

              return (
                <div
                  key={item.value}
                  className={cn(
                    'rounded-2xl border px-3 py-3 transition',
                    isEditing ? 'border-brand-200 bg-brand-50/40' : 'border-brand-200/70 bg-white',
                    !item.is_active && 'opacity-70'
                  )}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor={`edit-label-${item.value}`}>
                            Tên khu vực
                          </label>
                          <input
                            id={`edit-label-${item.value}`}
                            className="input"
                            value={editing.label}
                            maxLength={60}
                            onChange={(event) =>
                              setEditing((prev) => ({ ...prev, label: event.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label className="label" htmlFor={`edit-area-${item.value}`}>
                            Vị trí / ghi chú
                          </label>
                          <input
                            id={`edit-area-${item.value}`}
                            className="input"
                            value={editing.area}
                            maxLength={80}
                            onChange={(event) =>
                              setEditing((prev) => ({ ...prev, area: event.target.value }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="sm:w-56">
                          <label className="label" htmlFor={`edit-kind-${item.value}`}>
                            Nhóm
                          </label>
                          <select
                            id={`edit-kind-${item.value}`}
                            className="input"
                            value={editing.kind}
                            onChange={(event) =>
                              setEditing((prev) => ({ ...prev, kind: event.target.value }))
                            }
                          >
                            {CAMPUS_KINDS.map((kindItem) => (
                              <option key={kindItem.value} value={kindItem.value}>
                                {kindItem.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={savingEdit}
                            className="btn-primary justify-center py-2 text-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="btn-secondary justify-center py-2 text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                            Huỷ
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-400">
                        Mã khu vực <code className="rounded bg-white px-1.5 py-0.5">{item.value}</code>{' '}
                        giữ nguyên để không làm lệch tin đăng cũ.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(item, 'up')}
                          disabled={positionOf(item.value) <= 0 || busyValue === item.value}
                          className="grid h-6 w-6 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"
                          aria-label={`Đưa ${item.label} lên`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(item, 'down')}
                          disabled={
                            positionOf(item.value) === campuses.length - 1 ||
                            busyValue === item.value
                          }
                          className="grid h-6 w-6 place-items-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30"
                          aria-label={`Đưa ${item.label} xuống`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-ink-900">{item.label}</p>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold ring-1',
                              KIND_STYLE[item.kind] || KIND_STYLE.other
                            )}
                          >
                            {kind.label}
                          </span>
                          {!item.is_active && (
                            <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                              Tạm ẩn
                            </span>
                          )}
                          {protectedItem && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-400">
                          {item.area || 'Chưa ghi vị trí'} · {used} mục đang dùng
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive(item)}
                          disabled={busyValue === item.value}
                          className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-ink-800 disabled:opacity-40"
                        >
                          {item.is_active ? 'Tạm ẩn' : 'Bật lại'}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 transition hover:bg-ink-100 hover:text-brand-600"
                          aria-label={`Sửa ${item.label}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          disabled={protectedItem}
                          className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Xoá ${item.label}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            onClick={() => busyValue !== deleting.value && setDeleting(null)}
          />
          <div className="animate-in relative w-full max-w-md rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink-900">Xoá khu vực “{deleting.label}”?</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                  Khu vực sẽ biến mất khỏi form đăng ký, đăng tin và bộ lọc. Tin đăng cùng hồ sơ cũ
                  vẫn giữ nguyên dữ liệu nhưng sẽ hiển thị là “Khu vực khác”.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="grid h-8 w-8 place-items-center rounded-xl text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-ink-50 p-3 text-[11px] text-ink-500">
              {(usage.postCount.get(deleting.value) || 0)} tin đăng và{' '}
              {(usage.userCount.get(deleting.value) || 0)} hồ sơ đang dùng khu vực này. Nếu chỉ muốn
              ngừng cho chọn, hãy dùng “Tạm ẩn” thay vì xoá.
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="btn-secondary py-2 text-xs"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busyValue === deleting.value}
                className="btn-danger py-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xoá khu vực
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
