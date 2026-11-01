const MAX_FILE_SIZE = 8 * 1024 * 1024;

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Nén ảnh ở client trước khi lưu (localStorage hoặc Storage).
 * Ảnh thẻ sinh viên cần đọc được họ tên/MSSV nên giữ cạnh dài 1200px.
 */
export async function compressImageFile(file, { maxSize = 1200, quality = 0.68 } = {}) {
  if (!file) throw new Error('Chưa chọn ảnh.');
  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('Tệp đã chọn không phải ảnh.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ảnh vượt quá 8MB. Vui lòng chọn ảnh nhỏ hơn.');
  }

  const dataUrl = await readFile(file);
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không đọc được ảnh.'));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
  canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

