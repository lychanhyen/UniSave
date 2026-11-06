"""Sinh tài liệu "Thiết kế ý tưởng" cho dự án UniSave.

Chạy:
    python scripts/make_idea_design.py
Kết quả: docs/ThietKeYTuong_v2.docx

Định dạng giữ theo bản gốc: A4, lề 2,54 cm, Times New Roman 13 pt, giãn dòng 1,3,
chú thích bảng/hình 11 pt in nghiêng kèm nguồn.
"""

from pathlib import Path

from docx import Document
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

DOC_PATH = Path("docs/ThietKeYTuong_v2.docx")
SCREENS = Path("docs/assets/screens")
IDEA = Path("docs/assets/idea")
FONT = "Times New Roman"
TEXT_WIDTH = 15.9

TABLE_INDEX = 0
FIGURE_INDEX = 0
TABLE_CAPTIONS = []
FIGURE_CAPTIONS = []


# --------------------------------------------------------------------------- #
# Tiện ích định dạng
# --------------------------------------------------------------------------- #
def set_run(run, size=13, bold=False, italic=False):
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(attr), FONT)
    return run


def setup(document):
    section = document.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)

    normal = document.styles["Normal"]
    normal.font.name = FONT
    normal.font.size = Pt(13)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    rpr = normal.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(attr), FONT)
    fmt = normal.paragraph_format
    fmt.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    fmt.first_line_indent = Cm(1.0)
    fmt.line_spacing = 1.3
    fmt.space_before = Pt(0)
    fmt.space_after = Pt(6)

    for name, size, bold in (("Heading 1", 16, True), ("Heading 2", 14, True), ("Heading 3", 13, True)):
        style = document.styles[name]
        style.font.name = FONT
        style.font.size = Pt(size)
        style.font.bold = bold
        style.font.italic = name == "Heading 3"
        style.font.color.rgb = RGBColor(0, 0, 0)
        style_rpr = style.element.get_or_add_rPr()
        style_fonts = style_rpr.find(qn("w:rFonts"))
        if style_fonts is None:
            style_fonts = OxmlElement("w:rFonts")
            style_rpr.append(style_fonts)
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            style_fonts.set(qn(attr), FONT)
        f = style.paragraph_format
        f.alignment = WD_ALIGN_PARAGRAPH.LEFT
        f.first_line_indent = Cm(0)
        f.line_spacing = 1.2
        f.space_before = Pt(12 if name == "Heading 1" else 8)
        f.space_after = Pt(6)
        f.keep_with_next = True
    return document


def H1(document, text, page_break=True):
    paragraph = document.add_heading(text, level=1)
    paragraph.paragraph_format.page_break_before = page_break
    for run in paragraph.runs:
        set_run(run, size=16, bold=True)
    return paragraph


def H2(document, text):
    paragraph = document.add_heading(text, level=2)
    for run in paragraph.runs:
        set_run(run, size=14, bold=True)
    return paragraph


def H3(document, text):
    paragraph = document.add_heading(text, level=3)
    for run in paragraph.runs:
        set_run(run, size=13, bold=True, italic=True)
    return paragraph


def P(document, text, indent=True, bold=False):
    paragraph = document.add_paragraph()
    if not indent:
        paragraph.paragraph_format.first_line_indent = Cm(0)
    run = paragraph.add_run(text)
    set_run(run, size=13, bold=bold)
    return paragraph


def LEAD(document, text):
    """Câu chốt: in đậm, thụt lề, dùng cho POV và UVP."""
    paragraph = document.add_paragraph()
    paragraph.paragraph_format.left_indent = Cm(1.0)
    paragraph.paragraph_format.right_indent = Cm(0.6)
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(6)
    paragraph.paragraph_format.space_after = Pt(8)
    run = paragraph.add_run(text)
    set_run(run, size=13, bold=True)
    return paragraph


def B(document, text):
    paragraph = document.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.left_indent = Cm(1.0)
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(text)
    set_run(run, size=13)
    return paragraph


def TABLE(document, rows, widths, caption=None, source=None, size=11, header=True):
    global TABLE_INDEX
    if caption:
        TABLE_INDEX += 1
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_before = Pt(8)
        paragraph.paragraph_format.space_after = Pt(3)
        paragraph.paragraph_format.keep_with_next = True
        run = paragraph.add_run(f"Bảng {TABLE_INDEX}: {caption}")
        set_run(run, size=11, italic=True)
        TABLE_CAPTIONS.append(f"Bảng {TABLE_INDEX}: {caption}")

    table = document.add_table(rows=len(rows), cols=len(rows[0]))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for r_index, values in enumerate(rows):
        for c_index, value in enumerate(values):
            cell = table.cell(r_index, c_index)
            cell.width = Cm(widths[c_index])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_before = Pt(2)
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.line_spacing = 1.0
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = paragraph.add_run(str(value))
            set_run(run, size=size, bold=(header and r_index == 0))
    for column, width in zip(table.columns, widths):
        for cell in column.cells:
            cell.width = Cm(width)

    if source:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.space_before = Pt(2)
        paragraph.paragraph_format.space_after = Pt(10)
        run = paragraph.add_run(source)
        set_run(run, size=10, italic=True)
    return table


def FIG(document, path, caption, source=None, width=14.5):
    global FIGURE_INDEX
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(8)
    paragraph.paragraph_format.space_after = Pt(3)
    paragraph.paragraph_format.keep_with_next = True
    paragraph.add_run().add_picture(str(path), width=Cm(width))

    FIGURE_INDEX += 1
    cap = document.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.first_line_indent = Cm(0)
    cap.paragraph_format.space_after = Pt(2)
    run = cap.add_run(f"Hình {FIGURE_INDEX}: {caption}")
    set_run(run, size=11, italic=True)
    FIGURE_CAPTIONS.append(f"Hình {FIGURE_INDEX}: {caption}")

    if source:
        note = document.add_paragraph()
        note.paragraph_format.first_line_indent = Cm(0)
        note.alignment = WD_ALIGN_PARAGRAPH.CENTER
        note.paragraph_format.space_after = Pt(10)
        run = note.add_run(source)
        set_run(run, size=10, italic=True)
    return FIGURE_INDEX


def PAGE_BREAK(document):
    document.add_page_break()


def NOTE(document, text):
    """Ô ghi chú phương pháp: viền ngoài, chữ 11 pt nghiêng."""
    table = document.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    cell.width = Cm(TEXT_WIDTH)
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), "F1F6F3")
    cell._tc.get_or_add_tcPr().append(shading)
    paragraph = cell.paragraphs[0]
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.line_spacing = 1.15
    paragraph.paragraph_format.space_before = Pt(3)
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(text)
    set_run(run, size=11, italic=True)
    spacer = document.add_paragraph()
    spacer.paragraph_format.space_after = Pt(2)
    spacer.paragraph_format.first_line_indent = Cm(0)
    return table
