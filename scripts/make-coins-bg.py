"""Sinh ảnh nền 'đồng xu rơi' cho trang đăng nhập.

Ảnh nền trong suốt (RGBA), đồng xu vàng nhạt + đồng xu xanh mint, có vệt
chuyển động dọc và độ mờ khác nhau để khi đặt dưới lớp phủ xanh #007133
sẽ chỉ còn là hình mờ xuyên qua.

Chạy:
    python scripts/make-coins-bg.py
Kết quả: src/assets/coins-bg.webp
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "coins-bg.webp"

W, H = 1400, 1800
random.seed(20261104)

COIN_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\seguisb.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | None:
    for candidate in COIN_FONT_CANDIDATES:
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                continue
    return None


def coin_layer(size: int, gold: bool) -> Image.Image:
    """Một đồng xu RGBA, vẽ ở 4x rồi thu nhỏ để viền mượt."""
    scale = 4
    d = size * scale
    img = Image.new("RGBA", (d, d), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if gold:
        rim, face, shine = (150, 112, 36, 255), (226, 184, 96, 255), (247, 222, 158, 255)
    else:
        rim, face, shine = (24, 92, 62, 255), (98, 186, 142, 255), (176, 226, 200, 255)

    draw.ellipse((0, 0, d - 1 or 1, d - 1 or 1), fill=rim)
    inset = max(2, int(d * 0.07))
    draw.ellipse((inset, inset, d - inset, d - inset), fill=face)
    inner = max(3, int(d * 0.2))
    draw.ellipse((inner, inner, d - inner, d - inner), outline=shine, width=max(2, scale * 2))

    # Ký hiệu tiền tệ
    font = load_font(max(8, int(d * 0.42)))
    if font is not None:
        glyph = "đ" if gold else "₫"
        box = draw.textbbox((0, 0), glyph, font=font)
        tw, th = box[2] - box[0], box[3] - box[1]
        draw.text(((d - tw) / 2 - box[0], (d - th) / 2 - box[1]), glyph, font=font, fill=shine)

    img = img.resize((size, size), Image.LANCZOS)

    # Vệt chuyển động: kéo mờ theo phương dọc
    streak = img.filter(ImageFilter.GaussianBlur(radius=max(1.0, size * 0.035)))
    out = Image.new("RGBA", (size, size + int(size * 0.55)), (0, 0, 0, 0))
    out.alpha_composite(streak, (0, int(size * 0.5)))
    out.alpha_composite(img, (0, 0))
    return out


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    coins: list[tuple[int, bool]] = []
    for _ in range(34):
        size = random.randint(70, 260)
        coins.append((size, random.random() < 0.72))
    for _ in range(46):
        size = random.randint(26, 62)
        coins.append((size, random.random() < 0.6))

    coins.sort(key=lambda item: item[0], reverse=True)

    for size, gold in coins:
        sprite = coin_layer(size, gold)
        x = random.randint(-size // 2, W - size // 2)
        y = random.randint(-size // 3, H - size // 2)
        alpha = random.uniform(0.18, 0.55) if size > 90 else random.uniform(0.10, 0.34)
        # Xoay nhẹ để trông tự nhiên
        sprite = sprite.rotate(random.uniform(-18, 18), expand=True, resample=Image.BICUBIC)
        layer = sprite.copy()
        faded = Image.new("RGBA", layer.size, (0, 0, 0, 0))
        faded.paste(layer, (0, 0), layer)
        faded.putalpha(layer.getchannel("A").point(lambda v, a=alpha: int(v * a)))
        canvas.alpha_composite(faded, (x, y))

    # Làm mềm tổng thể để hình chỉ còn gợi ý
    canvas = canvas.filter(ImageFilter.GaussianBlur(radius=1.1))

    # Nhẹ dần ở mép trên/dưới để lớp phủ xanh liền mạch
    fade = Image.new("L", (1, H))
    for y in range(H):
        edge = min(1.0, y / (H * 0.16), (H - y) / (H * 0.22))
        fade.putpixel((0, y), int(255 * max(0.0, min(1.0, edge)) ** 0.8))
    alpha = canvas.getchannel("A").point(lambda v: v)
    mask = fade.resize(canvas.size, Image.BILINEAR)
    combined = Image.new("L", canvas.size, 0)
    combined.paste(mask, (0, 0))
    from PIL import ImageChops

    canvas.putalpha(ImageChops.multiply(alpha, combined))

    canvas.save(OUT, format="WEBP", quality=84, method=6)
    print(f"{OUT} — {W}x{H} — {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
