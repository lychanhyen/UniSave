"""Kiểm tra tự động bố cục trang đã render: lề an toàn và số trang ở chân trang."""

import sys
from pathlib import Path

from PIL import Image

DPI = 144
CM = DPI / 2.54  # số điểm ảnh trên mỗi cm

PAGES = {
    1: "trang bìa",
    2: "lời cảm ơn",
    3: "mục lục",
    12: "thân bài",
    13: "thân bài có bảng",
}

root = Path(sys.argv[1])


def ink_box(path):
    image = Image.open(path).convert("L")
    # Nhị phân hoá: điểm ảnh tối hơn 240 coi là có nội dung
    mask = image.point(lambda value: 255 if value < 240 else 0)
    return image.size, mask.getbbox()


for index, page in enumerate(PAGES, start=1):
    path = root / f"page-{index:04d}.png"
    if not path.exists():
        print(f"thiếu ảnh cho {PAGES[page]}")
        continue
    size, box = ink_box(path)
    width, height = size
    left_limit = 3.5 * CM
    right_limit = width - 2.0 * CM
    top_limit = 2.5 * CM
    bottom_text_zone = height - 2.0 * CM
    footer_top = height - 1.6 * CM

    x1, y1, x2, y2 = box
    issues = []
    if x1 < left_limit - 6:
        issues.append(f"lấn lề trái ({x1:.0f} < {left_limit:.0f})")
    if x2 > right_limit + 6:
        issues.append(f"lấn lề phải ({x2:.0f} > {right_limit:.0f})")
    if y1 < top_limit - 6:
        issues.append(f"lấn lề trên ({y1:.0f} < {top_limit:.0f})")
    if y2 > height - 0.4 * CM:
        issues.append(f"tràn đáy trang ({y2:.0f} > {height:.0f})")
    footer_ink = y2 >= footer_top
    print(
        f"trang {page} ({PAGES[page]}): khung nội dung x {x1:.0f}–{x2:.0f}, y {y1:.0f}–{y2:.0f} "
        f"| giới hạn x {left_limit:.0f}–{right_limit:.0f}, y ≥ {top_limit:.0f} "
        f"| có số trang ở chân: {'có' if footer_ink else 'KHÔNG'} "
        f"| {'OK' if not issues else '; '.join(issues)}"
    )
