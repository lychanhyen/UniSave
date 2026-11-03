"""Sinh ảnh minh hoạ khuôn viên trường cho nền trang đăng nhập.

Kết quả: public/assets/images/uda-dashboard/sidebar-campus-v2.png
Ảnh PNG nền trong suốt, bố cục neo đáy (center bottom / 100% auto no-repeat),
tông sáng để khi nằm dưới lớp phủ xanh #00834a sẽ hiện lên mờ như hình chìm.

Chạy:
    python scripts/make-campus-illustration.py
"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "images" / "uda-dashboard" / "sidebar-campus-v2.png"

W, H = 1600, 760
random.seed(8341)

LIGHT = (232, 255, 243, 150)
MID = (176, 236, 205, 130)
DEEP = (6, 74, 44, 120)
SHADOW = (3, 52, 31, 90)


def building(draw, x, base, width, height, color, windows=True, cols=3, rows=4):
    top = base - height
    draw.rounded_rectangle((x, top, x + width, base), radius=10, fill=color)
    if not windows:
        return
    pad = width * 0.16
    win_w = (width - pad * 2) / cols * 0.55
    win_h = win_w * 1.15
    gap_x = (width - pad * 2 - win_w * cols) / max(1, cols - 1)
    gap_y = (height * 0.62 - win_h * rows) / max(1, rows)
    for r in range(rows):
        for c in range(cols):
            wx = x + pad + c * (win_w + gap_x)
            wy = top + height * 0.16 + r * (win_h + gap_y)
            draw.rounded_rectangle(
                (wx, wy, wx + win_w, wy + win_h), radius=max(1, win_w * 0.18), fill=DEEP
            )


def tree(draw, x, base, size):
    trunk_w = max(3, size * 0.09)
    draw.rectangle((x - trunk_w / 2, base - size * 0.5, x + trunk_w / 2, base), fill=DEEP)
    draw.ellipse((x - size * 0.5, base - size * 1.05, x + size * 0.5, base - size * 0.25), fill=MID)
    draw.ellipse((x - size * 0.34, base - size * 1.3, x + size * 0.34, base - size * 0.6), fill=LIGHT)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base = H - 40

    # Nền đất mờ phía sau
    draw.ellipse((-200, base - 60, W + 200, base + 240), fill=SHADOW)

    # Dãy nhà phía xa
    building(draw, 90, base - 10, 250, 230, MID, rows=3)
    building(draw, 1230, base - 14, 280, 250, MID, rows=3)
    building(draw, 300, base - 6, 180, 170, MID, windows=False)

    # Toà nhà chính hai bên
    building(draw, 60, base, 330, 330, LIGHT, cols=4, rows=5)
    building(draw, 1180, base, 360, 350, LIGHT, cols=4, rows=5)

    # Tháp đồng hồ giữa
    cx = W // 2
    draw.rounded_rectangle((cx - 78, base - 420, cx + 78, base), radius=12, fill=LIGHT)
    draw.rounded_rectangle((cx - 58, base - 470, cx + 58, base - 388), radius=10, fill=LIGHT)
    draw.polygon(
        [(cx, base - 560), (cx - 74, base - 462), (cx + 74, base - 462)], fill=LIGHT
    )
    draw.ellipse((cx - 34, base - 372, cx + 34, base - 304), outline=DEEP, width=7)
    draw.line((cx, base - 338, cx, base - 360), fill=DEEP, width=6)
    draw.line((cx, base - 338, cx + 20, base - 326), fill=DEEP, width=6)

    # Cổng vòm
    draw.rounded_rectangle((cx - 250, base - 190, cx - 120, base), radius=10, fill=MID)
    draw.rounded_rectangle((cx + 120, base - 190, cx + 250, base), radius=10, fill=MID)
    draw.arc((cx - 250, base - 320, cx + 250, base - 60), start=180, end=360, fill=MID, width=26)

    # Cây xanh
    for x, size in [
        (430, 150), (505, 110), (1090, 160), (1170, 112),
        (150, 120), (1460, 130), (760, 96), (860, 88),
    ]:
        tree(draw, x, base, size)

    # Bậc thang và lối đi
    for i, shrink in enumerate(range(0, 90, 22)):
        draw.rounded_rectangle(
            (cx - 210 + shrink, base - 12 + i * 11, cx + 210 - shrink, base + 2 + i * 11),
            radius=4,
            fill=(LIGHT[0], LIGHT[1], LIGHT[2], max(40, LIGHT[3] - i * 22)),
        )

    # Đèn sân
    for x in (cx - 330, cx + 330):
        draw.rectangle((x - 3, base - 150, x + 3, base), fill=DEEP)
        draw.ellipse((x - 13, base - 176, x + 13, base - 146), fill=LIGHT)

    # Làm mềm rất nhẹ để hoà vào nền xanh
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))
    img.save(OUT, format="PNG", optimize=True)
    print(f"{OUT} — {W}x{H} — {OUT.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
