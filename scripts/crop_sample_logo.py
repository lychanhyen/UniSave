"""Cắt viền trắng logo lấy từ file mẫu và kiểm tra màu nhận diện."""

from pathlib import Path

from PIL import Image, ImageChops

src = Path("docs/assets/logo-truong/image6.png")
dst = Path("docs/assets/logo-dhdn.png")

image = Image.open(src).convert("RGB")
background = Image.new("RGB", image.size, (255, 255, 255))
bbox = ImageChops.difference(image, background).getbbox()
if not bbox:
    raise SystemExit("ảnh trắng hoàn toàn")

pad = 4
crop = (
    max(bbox[0] - pad, 0),
    max(bbox[1] - pad, 0),
    min(bbox[2] + pad, image.size[0]),
    min(bbox[3] + pad, image.size[1]),
)
logo = image.crop(crop)
logo.save(dst)
w, h = logo.size
print(f"đã cắt: {dst} | {w}x{h} | tỉ lệ {round(w / h, 2)}")

# đếm điểm ảnh màu cam và xanh để xác nhận đúng logo trường
orange = blue = 0
pixels = logo.load()
for y in range(0, h, 3):
    for x in range(0, w, 3):
        r, g, b = pixels[x, y]
        if r > 180 and 60 < g < 170 and b < 110:
            orange += 1
        if b > 110 and r < 110 and g < 150:
            blue += 1
print(f"điểm cam: {orange} | điểm xanh: {blue}")
