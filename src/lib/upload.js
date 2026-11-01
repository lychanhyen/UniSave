import { supabase } from './supabase';

export async function uploadFile(bucket, userId, file) {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filePath = `${userId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return filePath;
}

/** Upload một data URL (ảnh đã nén ở client) lên Supabase Storage. */
export async function uploadDataUrl(bucket, userId, dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  const file = new File([blob], `photo-${Date.now()}.${extension}`, { type: blob.type });
  const path = await uploadFile(bucket, userId, file);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload ảnh vào bucket riêng tư (ảnh thẻ sinh viên) và trả về đường dẫn.
 * Đường dẫn này cần được đổi thành signed URL khi hiển thị.
 */
export async function uploadPrivateDataUrl(bucket, userId, dataUrl, prefix = 'file') {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type === 'image/png' ? 'png' : 'jpg';
  const file = new File([blob], `${prefix}-${Date.now()}.${extension}`, { type: blob.type });
  return uploadFile(bucket, userId, file);
}
