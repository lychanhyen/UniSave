"""Vẽ sơ đồ tư duy (Mind Map) cho Phụ lục B."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1800, 1050
BACKGROUND = (255, 255, 255)
CENTER_FILL = (0, 85, 56)
BRANCH_FILL = (232, 243, 236)
BRANCH_LINE = (0, 85, 56)
TEXT_DARK = (20, 20, 20)
TEXT_LIGHT = (255, 255, 255)

FONT_DIR = Path(r"C:\Windows\Fonts")
FONT_REGULAR = FONT_DIR / "times.ttf"
FONT_BOLD = FONT_DIR / "timesbd.ttf"


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


image = Image.new("RGB", (W, H), BACKGROUND)
draw = ImageDraw.Draw(image)

CENTER_BOX = (620, 455, 1180, 595)
draw.rounded_rectangle(CENTER_BOX, radius=18, fill=CENTER_FILL)
center_text = "Quản lý tiền của sinh viên"
text_width = draw.textlength(center_text, font=font(40, True))
draw.text(
    ((CENTER_BOX[0] + CENTER_BOX[2]) / 2 - text_width / 2, CENTER_BOX[1] + 46),
    center_text,
    font=font(40, True),
    fill=TEXT_LIGHT,
)

BRANCHES = [
    {
        "title": "Thu nhập",
        "leaves": ["Trợ cấp theo tháng", "Làm thêm không đều", "Nhận theo đợt"],
        "box": (60, 120, 520, 250),
        "anchor": (520, 185),
    },
    {
        "title": "Chi tiêu hằng ngày",
        "leaves": ["Ăn uống, đi chợ", "Đi lại, xăng xe", "Học liệu, in ấn"],
        "box": (60, 690, 520, 820),
        "anchor": (520, 755),
    },
    {
        "title": "Mua chung",
        "leaves": ["Gom đơn giá sỉ", "Chia tiền theo người", "Tính tay hay nhầm"],
        "box": (1280, 120, 1740, 250),
        "anchor": (1280, 185),
    },
    {
        "title": "Đồ cũ trong trường",
        "leaves": ["Giáo trình, sách", "Đồ điện, quần áo", "Lo lộ thông tin"],
        "box": (1280, 690, 1740, 820),
        "anchor": (1280, 755),
    },
]

for branch in BRANCHES:
    box = branch["box"]
    # đường nối từ hộp trung tâm tới hộp nhánh
    start = (CENTER_BOX[0] if box[0] < 600 else CENTER_BOX[2], (CENTER_BOX[1] + CENTER_BOX[3]) // 2)
    draw.line([start, branch["anchor"]], fill=BRANCH_LINE, width=5)

    draw.rounded_rectangle(box, radius=14, fill=BRANCH_FILL, outline=BRANCH_LINE, width=3)
    title = branch["title"]
    title_width = draw.textlength(title, font=font(34, True))
    draw.text(
        ((box[0] + box[2]) / 2 - title_width / 2, box[1] + 22),
        title,
        font=font(34, True),
        fill=CENTER_FILL,
    )

    # các nhánh con dưới hộp
    center_x = (box[0] + box[2]) / 2
    y = box[3] + 26 if box[1] < 500 else box[3] + 26
    for leaf in branch["leaves"]:
        leaf_width = draw.textlength(leaf, font=font(26))
        draw.text((center_x - leaf_width / 2, y), leaf, font=font(26), fill=TEXT_DARK)
        y += 42

out = Path("docs/assets/idea/mind-map.png")
out.parent.mkdir(parents=True, exist_ok=True)
image.save(out)
print("đã tạo:", out, image.size)
