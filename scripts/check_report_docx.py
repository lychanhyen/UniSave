"""Kiểm tra file Word vừa tạo: gói OOXML, kiểu chữ, lề, số trang, bảng, hình, footnote."""

from pathlib import Path
from zipfile import ZipFile

from docx import Document
from docx.shared import Cm

DOC = Path("docs/BaoCao_UniSave.docx")


def em(value):
    return round(value / 360000, 2)


document = Document(DOC)

print("=== GÓI TỆP")
with ZipFile(DOC) as package:
    names = package.namelist()
    bad = package.testzip()
    print("số thành phần:", len(names), "| lỗi zip:", bad)
    print("có footnotes.xml:", "word/footnotes.xml" in names)
    print("có mục lục (TOC) trong document.xml:", b'TOC \\o' in package.read("word/document.xml"))
    print("updateFields:", b"updateFields" in package.read("word/settings.xml"))

print("\n=== KHỔ GIẤY VÀ LỀ (cm)")
for index, section in enumerate(document.sections, start=1):
    print(
        f"phần {index}: {em(section.page_width)} x {em(section.page_height)} | "
        f"trên {em(section.top_margin)} | dưới {em(section.bottom_margin)} | "
        f"trái {em(section.left_margin)} | phải {em(section.right_margin)}"
    )

print("\n=== KIỂU CHỮ")
for name in ["Normal", "Heading 1", "Heading 2", "Heading 3", "Footnote Text"]:
    style = document.styles[name]
    fmt = style.paragraph_format
    print(
        f"{name}: {style.font.name} {style.font.size.pt if style.font.size else '?'}pt "
        f"đậm={style.font.bold} nghiêng={style.font.italic} "
        f"giãn={fmt.line_spacing} thụt đầu={round(fmt.first_line_indent.cm, 2) if fmt.first_line_indent else 0}cm "
        f"trước={fmt.space_before.pt if fmt.space_before else 0} sau={fmt.space_after.pt if fmt.space_after else 0}"
    )

print("\n=== NỘI DUNG")
headings = [p for p in document.paragraphs if p.style.name.startswith("Heading")]
print("số tiêu đề:", len(headings))
print("H1:", sum(1 for p in headings if p.style.name == "Heading 1"))
print("H2:", sum(1 for p in headings if p.style.name == "Heading 2"))
print("H3:", sum(1 for p in headings if p.style.name == "Heading 3"))
print("số bảng:", len(document.tables))
print("số hình:", len(document.inline_shapes))
words = sum(len(p.text.split()) for p in document.paragraphs)
print("số từ (không kể bảng):", words)

print("\n=== 5 TIÊU ĐỀ ĐẦU")
for paragraph in headings[:5]:
    print(" •", paragraph.style.name, "|", paragraph.text[:70])

print("\n=== CHÚ THÍCH BẢNG/HÌNH")
for paragraph in document.paragraphs:
    if paragraph.style.name == "Caption Custom":
        print(" •", paragraph.text[:80])
