"""Vẽ ba hình cho báo cáo thiết kế ý tưởng: wireframe, bản đồ định vị, luồng người dùng."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path("docs/assets/idea")
OUT.mkdir(parents=True, exist_ok=True)

FONTS = ["C:/Windows/Fonts/times.ttf", "C:/Windows/Fonts/arial.ttf"]
INK = (28, 32, 30)
GREY = (120, 128, 124)
BRAND = (15, 107, 79)
BRAND_LIGHT = (232, 244, 238)
AMBER = (196, 138, 26)


def font(size):
    for path in FONTS:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def wireframe():
    """Hai khung wireframe: màn hình tổng quan và màn hình chi tiêu."""
    width, height = 1500, 820
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    draw.text((width / 2, 34), "Wireframe 2 màn hình chính của UniSave", font=font(30), fill=INK, anchor="mm")

    def panel(x, title):
        draw.rectangle((x, 90, x + 660, 780), outline=(200, 206, 202), width=3)
        draw.rectangle((x, 90, x + 660, 150), fill=BRAND_LIGHT, outline=(200, 206, 202), width=3)
        draw.text((x + 24, 120), title, font=font(22), fill=BRAND, anchor="lm")

    def block(x, y, w, h, label, dashed=False):
        if dashed:
            for offset in range(x, x + w, 12):
                draw.line((offset, y, min(offset + 6, x + w), y), fill=GREY, width=2)
                draw.line((offset, y + h, min(offset + 6, x + w), y + h), fill=GREY, width=2)
            for offset in range(y, y + h, 12):
                draw.line((x, offset, x, min(offset + 6, y + h)), fill=GREY, width=2)
                draw.line((x + w, offset, x + w, min(offset + 6, y + h)), fill=GREY, width=2)
        else:
            draw.rectangle((x, y, x + w, y + h), outline=(170, 178, 174), width=2, fill=(249, 250, 249))
        draw.text((x + w / 2, y + h / 2), label, font=font(18), fill=GREY if dashed else INK, anchor="mm")

    # Màn hình 1: tổng quan
    panel(40, "1. Tổng quan")
    block(70, 180, 600, 150, "Thẻ ngân sách tháng + hạn mức hôm nay", dashed=False)
    block(70, 350, 290, 150, "Biểu đồ tuần")
    block(380, 350, 290, 150, "Heo đất tiết kiệm")
    block(70, 520, 600, 90, "Lịch chi tiêu theo ngày")
    block(70, 630, 190, 60, "Thêm chi tiêu")
    block(275, 630, 190, 60, "Xem chi tiêu")
    block(480, 630, 190, 60, "Đánh giá")
    draw.text((70, 720), "Ghi chú: nút hành động chính nằm trong tầm ngón tay", font=font(17), fill=AMBER)

    # Màn hình 2: chi tiêu
    panel(800, "2. Chi tiêu")
    block(830, 180, 600, 90, "Tổng chi tháng + số còn lại")
    block(830, 290, 600, 70, "Ô nhập nhanh: số tiền · danh mục · ngày")
    block(830, 380, 290, 60, "Lưu khoản chi")
    block(1130, 380, 300, 60, "Thêm thu nhập")
    block(830, 460, 600, 220, "Danh sách khoản chi gần đây")
    block(830, 700, 600, 50, "Lọc theo danh mục")
    draw.text((830, 760), "Ghi chú: mỗi khoản chi chỉ cần 3 thao tác", font=font(17), fill=AMBER)

    path = OUT / "wireframe.png"
    image.save(path)
    return path


def perceptual_map():
    """Bản đồ định vị theo hai trục: chuyên sâu tài chính và tính cộng đồng sinh viên."""
    width, height = 1400, 1000
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    draw.text((width / 2, 40), "Bản đồ định vị sản phẩm", font=font(32), fill=INK, anchor="mm")

    left, right, top, bottom = 180, 1260, 130, 860
    cx, cy = (left + right) / 2, (top + bottom) / 2
    draw.line((left, cy, right, cy), fill=INK, width=3)
    draw.line((cx, top, cx, bottom), fill=INK, width=3)

    draw.text((right, cy + 18), "Cộng đồng sinh viên", font=font(20), fill=INK, anchor="rm")
    draw.text((left, cy + 18), "Cá nhân đơn lẻ", font=font(20), fill=INK, anchor="lm")
    draw.text((cx + 12, top), "Chuyên sâu tài chính", font=font(20), fill=INK, anchor="lm")
    draw.text((cx + 12, bottom), "Chỉ mua bán", font=font(20), fill=INK, anchor="lm")

    points = [
        ("Money Lover", 0.28, 0.24, GREY),
        ("MISA Sổ chi tiêu", 0.42, 0.30, GREY),
        ("Nhóm Facebook trường", 0.76, 0.62, GREY),
        ("Shopee / TikTok Shop", 0.70, 0.80, GREY),
        ("Sổ tay ghi chép", 0.14, 0.72, GREY),
        ("UniSave", 0.66, 0.26, BRAND),
    ]
    for name, px, py, colour in points:
        x = left + px * (right - left)
        y = top + py * (bottom - top)
        radius = 15 if name == "UniSave" else 11
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=colour)
        draw.text((x + radius + 10, y), name, font=font(22 if name == "UniSave" else 19), fill=colour, anchor="lm")

    draw.text(
        (width / 2, 940),
        "Trục ngang: mức độ gắn với cộng đồng sinh viên. Trục dọc: độ chuyên sâu về quản lý tài chính.",
        font=font(18),
        fill=GREY,
        anchor="mm",
    )
    path = OUT / "ban-do-dinh-vi.png"
    image.save(path)
    return path


def user_flow():
    """Luồng người dùng từ lúc nhận tiền đến khi chốt sổ cuối tháng."""
    width, height = 1600, 460
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    draw.text((width / 2, 40), "Luồng trải nghiệm chính trên ứng dụng", font=font(30), fill=INK, anchor="mm")

    steps = [
        ("Nhận trợ cấp", "nhập số tiền có"),
        ("Chia hạn mức", "tự chia theo ngày"),
        ("Ghi chi tiêu", "3 thao tác"),
        ("Xem còn lại", "hạn mức hôm nay"),
        ("Chốt sổ", "phần dư vào heo đất"),
    ]
    box_w, gap, top = 270, 45, 120
    start = 70
    for index, (title, note) in enumerate(steps):
        x = start + index * (box_w + gap)
        draw.rounded_rectangle((x, top, x + box_w, top + 150), radius=14, fill=BRAND_LIGHT, outline=BRAND, width=3)
        draw.text((x + box_w / 2, top + 55), title, font=font(23), fill=INK, anchor="mm")
        draw.text((x + box_w / 2, top + 100), note, font=font(18), fill=GREY, anchor="mm")
        if index < len(steps) - 1:
            x1 = x + box_w + 6
            x2 = x + box_w + gap - 6
            draw.line((x1, top + 75, x2, top + 75), fill=BRAND, width=3)
            draw.polygon([(x2, top + 75), (x2 - 12, top + 67), (x2 - 12, top + 83)], fill=BRAND)

    draw.text((width / 2, 340), "Nguồn: nhóm thực hiện tổng hợp từ luồng sử dụng thực tế của ứng dụng", font=font(18), fill=GREY, anchor="mm")
    path = OUT / "luong-nguoi-dung.png"
    image.save(path)
    return path


if __name__ == "__main__":
    for created in (wireframe(), perceptual_map(), user_flow()):
        print("da tao:", created.resolve())
