"""Cắt viền trắng của logo trường để không bị thành khối trắng bè ngang."""

from pathlib import Path

from PIL import Image, ImageChops

src = Path("docs/assets/logo-truong.jpg")
dst = Path("docs/assets/logo-truong-cat.png")

image = Image.open(src).convert("RGB")
background = Image.new("RGB", image.size, (255, 255, 255))
bbox = ImageChops.difference(image, background).getbbox()
if not bbox:
    raise SystemExit("không tìm thấy nội dung, ảnh trắng hoàn toàn")

padding = 6
left = max(bbox[0] - padding, 0)
top = max(bbox[1] - padding, 0)
right = min(bbox[2] + padding, image.size[0])
bottom = min(bbox[3] + padding, image.size[1])

cropped = image.crop((left, top, right, bottom))
cropped.save(dst)
width, height = cropped.size
print(f"đã cắt: {dst}")
print(f"kích thước: {width}x{height} | tỉ lệ rộng/cao: {round(width / height, 3)}")
