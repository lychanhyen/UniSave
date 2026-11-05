"""Vẽ hai hình minh hoạ cho báo cáo: kiến trúc hệ thống và quy trình thanh toán."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path("docs/assets")
OUT.mkdir(parents=True, exist_ok=True)

FONT_CANDIDATES = [
    "C:/Windows/Fonts/times.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/segoeui.ttf",
]

BRAND = (15, 107, 79)
BRAND_LIGHT = (232, 244, 238)
INK = (24, 28, 26)
GREY = (110, 118, 114)


def pick_font(size, bold=False):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_box(draw, box, title, subtitle="", fill="white", outline=BRAND, title_font=None, sub_font=None):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=14, fill=fill, outline=outline, width=3)
    lines = [line for line in [title, subtitle] if line]
    total = len(lines)
    for index, line in enumerate(lines):
        font = title_font if index == 0 else sub_font
        y = (y1 + y2) / 2 + (index - (total - 1) / 2) * 30
        draw.text(((x1 + x2) / 2, y), line, font=font, fill=INK, anchor="mm")


def arrow(draw, start, end, color=BRAND):
    draw.line([start, end], fill=color, width=3)
    x1, y1 = end
    x0, y0 = start
    if abs(y1 - y0) > abs(x1 - x0):
        direction = 1 if y1 > y0 else -1
        draw.polygon([(x1, y1), (x1 - 9, y1 - 15 * direction), (x1 + 9, y1 - 15 * direction)], fill=color)
    else:
        direction = 1 if x1 > x0 else -1
        draw.polygon([(x1, y1), (x1 - 15 * direction, y1 - 9), (x1 - 15 * direction, y1 + 9)], fill=color)


def make_architecture():
    width, height = 1560, 780
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    font_label = pick_font(24)
    font_box = pick_font(25)
    font_sub = pick_font(19)
    font_note = pick_font(18)

    draw.text((width / 2, 28), "Kiến trúc tổng thể hệ thống UniSave", font=pick_font(32), fill=INK, anchor="mm")

    draw_box(draw, (560, 78, 1000, 168), "Người dùng sinh viên", "Trình duyệt điện thoại / máy tính", fill=BRAND_LIGHT, title_font=font_box, sub_font=font_sub)
    arrow(draw, (780, 170), (780, 236))

    draw.rounded_rectangle((100, 238, 1100, 430), radius=18, fill="white", outline=BRAND, width=4)
    draw.text((120, 256), "Ứng dụng web (SPA) — React 19 · Vite · Tailwind CSS", font=font_label, fill=BRAND)
    modules = [
        ("Ngân sách", "theo ngày"),
        ("Chợ sinh viên", "tin đăng"),
        ("Gom đơn", "chia tiền"),
        ("Dinh dưỡng", "thực đơn"),
        ("Đánh giá", "công khai"),
    ]
    box_width, gap = 180, 16
    start_x = 120
    for index, (title, subtitle) in enumerate(modules):
        x = start_x + index * (box_width + gap)
        draw_box(draw, (x, 300, x + box_width, 400), title, subtitle, fill=BRAND_LIGHT, outline=(120, 170, 148), title_font=font_sub, sub_font=pick_font(17))

    arrow(draw, (600, 432), (600, 500))
    draw.text((618, 452), "HTTPS · REST · JWT", font=font_note, fill=GREY)

    draw.rounded_rectangle((100, 502, 1100, 700), radius=18, fill="white", outline=BRAND, width=4)
    draw.text((120, 520), "Supabase — PostgreSQL", font=font_label, fill=BRAND)
    services = [
        ("Auth", "đăng nhập, JWT"),
        ("PostgREST", "truy vấn dữ liệu"),
        ("Row Level Security", "phân quyền từng dòng"),
        ("Storage", "ảnh, bill"),
    ]
    service_width = 215
    for index, (title, subtitle) in enumerate(services):
        x = 130 + index * (service_width + 22)
        draw_box(draw, (x, 570, x + service_width, 670), title, subtitle, fill=BRAND_LIGHT, outline=(120, 170, 148), title_font=font_sub, sub_font=pick_font(17))

    arrow(draw, (1102, 340), (1230, 340))
    arrow(draw, (1230, 360), (1102, 360))
    draw_box(draw, (1232, 276, 1520, 424), "Leaflet + OpenStreetMap", "bản đồ vị trí tin đăng", fill=BRAND_LIGHT, title_font=font_sub, sub_font=pick_font(17))

    draw.text((width / 2, 738), "Nguồn: nhóm thực hiện dựng từ mã nguồn UniSave", font=font_note, fill=GREY, anchor="mm")

    path = OUT / "kien-truc-he-thong.png"
    image.save(path)
    return path


def make_payment_flow():
    width, height = 1560, 420
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    font_step = pick_font(23)
    font_sub = pick_font(18)

    draw.text((width / 2, 26), "Quy trình xác nhận thanh toán hai bước", font=pick_font(30), fill=INK, anchor="mm")

    steps = [
        ("1. Thành viên khai báo", "bấm Đã chuyển khoản"),
        ("2. Tải bill", "ảnh chuyển khoản (riêng tư)"),
        ("3. Chủ kèo xác nhận", "xem bill, đối chiếu số tiền"),
        ("4. Hệ thống ghi nhận", "trạng thái paid + thông báo"),
    ]
    box_width, gap, top = 320, 40, 150
    start_x = 60
    for index, (title, subtitle) in enumerate(steps):
        x = start_x + index * (box_width + gap)
        draw_box(draw, (x, top, x + box_width, top + 150), title, subtitle, fill=BRAND_LIGHT, title_font=font_step, sub_font=font_sub)
        if index < len(steps) - 1:
            arrow(draw, (x + box_width + 4, top + 75), (x + box_width + gap - 6, top + 75))

    draw.text((width / 2, 372), "Nguồn: nhóm thực hiện tổng hợp từ phân hệ gom đơn của UniSave", font=font_sub, fill=GREY, anchor="mm")

    path = OUT / "quy-trinh-thanh-toan.png"
    image.save(path)
    return path


if __name__ == "__main__":
    first = make_architecture()
    second = make_payment_flow()
    print("da tao:", first.resolve())
    print("da tao:", second.resolve())
