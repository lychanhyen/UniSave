"""Phân tích ảnh nền mới: kích thước, tông màu, độ sáng theo vùng để chọn lớp phủ."""

from pathlib import Path

from PIL import Image, ImageStat

source = Path("cb98520a-ea67-4f39-9b7e-f3469e6a2535.png")
image = Image.open(source)
print("kích thước:", image.size, "| chế độ:", image.mode, "| định dạng:", image.format)

rgb = image.convert("RGB")
small = rgb.resize((120, 120))
pixels = list(small.getdata())

# Tông màu trung bình toàn ảnh
mean = ImageStat.Stat(rgb.resize((200, 200))).mean
print("màu trung bình RGB:", [round(value) for value in mean])

# Độ sáng theo 5 vùng (trái trên, trái dưới, giữa, phải trên, phải dưới)
width, height = rgb.size
regions = {
    "trái trên": (0, 0, width // 2, height // 2),
    "trái dưới": (0, height // 2, width // 2, height),
    "giữa": (width // 3, height // 3, 2 * width // 3, 2 * height // 3),
    "phải trên": (width // 2, 0, width, height // 2),
    "phải dưới": (width // 2, height // 2, width, height),
}
for name, box in regions.items():
    region = rgb.crop(box).resize((40, 40))
    stat = ImageStat.Stat(region)
    brightness = 0.299 * stat.mean[0] + 0.587 * stat.mean[1] + 0.114 * stat.mean[2]
    print(f"  {name:10s} sáng trung bình {brightness:5.1f} | RGB {[round(v) for v in stat.mean]}")

# Các màu phổ biến nhất
quantized = small.quantize(colors=8, method=Image.MEDIANCUT).convert("RGB")
counts = {}
for pixel in quantized.getdata():
    counts[pixel] = counts.get(pixel, 0) + 1
print("màu phổ biến nhất:")
for color, count in sorted(counts.items(), key=lambda item: -item[1])[:6]:
    print(f"  #{color[0]:02x}{color[1]:02x}{color[2]:02x}: {count * 100 / 14400:.1f}%")
