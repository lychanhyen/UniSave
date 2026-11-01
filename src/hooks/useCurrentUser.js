import { useAuth } from '../context/AuthContext';

/**
 * Người dùng hiện tại đã chuẩn hoá cho cả chế độ demo và Supabase.
 * Trả về object rỗng khi chưa đăng nhập để các trang được bảo vệ không crash.
 */
export function useCurrentUser() {
  const { user } = useAuth();

  if (!user) {
    return {
      id: '',
      email: '',
      full_name: '',
      student_code: '',
      campus: 'khac',
      avatar_url: '',
      student_card_url: '',
      role: 'student',
      is_verified: false,
      verification_status: 'none',
      verification_note: '',
      is_locked: false,
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    full_name: user.full_name || user.user_metadata?.full_name || 'Sinh viên UniSave',
    student_code: user.student_code || user.user_metadata?.student_code || '',
    campus: user.campus || user.user_metadata?.campus || 'khac',
    avatar_url: user.avatar_url || '',
    student_card_url: user.student_card_url || '',
    role: user.role === 'admin' ? 'admin' : 'student',
    is_verified: Boolean(user.is_verified),
    verification_status:
      user.verification_status || (user.is_verified ? 'approved' : 'none'),
    verification_note: user.verification_note || '',
    is_locked: Boolean(user.is_locked),
    created_at: user.created_at || null,
  };
}
