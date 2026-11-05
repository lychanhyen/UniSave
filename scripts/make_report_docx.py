"""Sinh file Word báo cáo UniSave theo quy chuẩn trình bày tiểu luận/báo cáo.

Quy chuẩn áp dụng:
- A4 đứng, lề trên 2,5 cm, dưới 2,0 cm, trái 3,5 cm, phải 2,0 cm.
- Times New Roman; thân bài 13 pt; H1 16 pt in đậm viết hoa; H2 14 pt đậm; H3 14 pt đậm nghiêng.
- Chú thích bảng/hình và footnote 10–11 pt in nghiêng, màu đen.
- Giãn dòng 1,5; thụt dòng đầu 1,27 cm; before 0 pt, after 6 pt; căn đều hai bên.
- Số trang giữa chân trang; phần đầu dùng số La Mã, phần thân bắt đầu lại từ 1.
- Đánh số mục 1., 1.1., 1.1.1.; bảng có tên phía trên, hình có tên phía dưới, kèm nguồn.
- Tài liệu tham khảo xếp ABC theo APA.
"""

from pathlib import Path
from xml.sax.saxutils import escape

import subprocess
import sys

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.opc.packuri import PackURI
from docx.opc.part import Part
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

DOC_PATH = Path("docs/BaoCao_UniSave.docx")
FONT = "Times New Roman"
CT_FOOTNOTES = "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"

FOOTNOTES = []  # [(id, text)]


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


def insert_in_sectpr(section, element):
    """Chèn phần tử vào sectPr đúng thứ tự schema để Word không báo lỗi."""
    successors = [
        "w:cols",
        "w:formProt",
        "w:vAlign",
        "w:noEndnote",
        "w:titlePg",
        "w:textDirection",
        "w:bidi",
        "w:rtlGutter",
        "w:docGrid",
        "w:printerSettings",
        "w:sectPrChange",
    ]
    sect_pr = section._sectPr
    for tag in successors:
        found = sect_pr.find(qn(tag))
        if found is not None:
            found.addprevious(element)
            return element
    sect_pr.append(element)
    return element


def set_page_number_format(section, fmt, start=None):
    for existing in section._sectPr.findall(qn("w:pgNumType")):
        section._sectPr.remove(existing)
    element = OxmlElement("w:pgNumType")
    element.set(qn("w:fmt"), fmt)
    if start is not None:
        element.set(qn("w:start"), str(start))
    insert_in_sectpr(section, element)


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run(run, size=12)
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.append(begin)
    run._r.append(instr)
    run._r.append(end)


TOC_ANCHOR = {"paragraph": None}


def toc_style(document):
    from docx.enum.style import WD_STYLE_TYPE

    try:
        return document.styles["TOC Entry"]
    except KeyError:
        pass
    style = document.styles.add_style("TOC Entry", WD_STYLE_TYPE.PARAGRAPH)
    style.base_style = document.styles["Normal"]
    fmt = style.paragraph_format
    fmt.first_line_indent = Cm(0)
    fmt.left_indent = Cm(0)
    fmt.space_before = Pt(0)
    fmt.space_after = Pt(3)
    fmt.line_spacing = 1.3
    fmt.alignment = WD_ALIGN_PARAGRAPH.LEFT
    fmt.tab_stops.add_tab_stop(Cm(15.0), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    return style


def insert_toc(document, entries):
    """Chèn mục lục tĩnh (có số trang) ngay sau tiêu đề MỤC LỤC."""
    anchor = TOC_ANCHOR["paragraph"]
    style = toc_style(document)
    for level, text, label in entries:
        paragraph = document.add_paragraph(style=style)
        paragraph.paragraph_format.left_indent = Cm(0.0 if level == 1 else 0.6 * (level - 1))
        paragraph.paragraph_format.tab_stops.add_tab_stop(
            Cm(15.0), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS
        )
        run = paragraph.add_run(text)
        set_run(run, size=13, bold=(level == 1))
        run = paragraph.add_run("\t" + str(label))
        set_run(run, size=13, bold=(level == 1))
        anchor._p.addprevious(paragraph._p)


def document_headings(document):
    levels = {"Heading 1": 1, "Heading 2": 2, "Heading 3": 3}
    found = []
    for paragraph in document.paragraphs:
        level = levels.get(paragraph.style.name)
        if level and paragraph.text.strip():
            found.append((level, paragraph.text.strip()))
    return found


def _files_in(folder):
    path = Path(folder)
    if not path.exists():
        return 0
    return len([item for item in path.glob("*") if item.is_file()])


def project_tree():
    """Cây thư mục thật của dự án: (độ sâu, tên, số tệp trực tiếp, ghi chú)."""
    return [
        (0, "unisave/", None, "thư mục gốc của dự án"),
        (1, "public/", _files_in("public"), "ảnh tĩnh, biểu tượng"),
        (1, "src/", None, ""),
        (2, "context/", _files_in("src/context"), "xác thực và khu vực trường"),
        (2, "hooks/", _files_in("src/hooks"), "xử lý trạng thái từng phân hệ"),
        (2, "lib/", _files_in("src/lib"), "gọi dữ liệu, dữ liệu tĩnh, hàm tính toán"),
        (2, "components/", _files_in("src/components"), "thành phần giao diện dùng lại"),
        (2, "pages/", _files_in("src/pages"), "mỗi tệp là một màn hình"),
        (3, "admin/", _files_in("src/pages/admin"), "màn hình quản trị"),
        (3, "marketplace/", _files_in("src/pages/marketplace"), "trang chợ và chi tiết tin"),
        (3, "group-deals/", _files_in("src/pages/group-deals"), "trang gom đơn"),
        (1, "supabase/", _files_in("supabase"), "tạo bảng, chính sách bảo mật"),
        (1, "scripts/", _files_in("scripts"), "công cụ chạy SQL, kiểm tra mã nguồn"),
    ]


def add_footnote(paragraph, text):
    note_id = len(FOOTNOTES) + 1
    FOOTNOTES.append((note_id, text))
    run = paragraph.add_run()
    set_run(run, size=13)
    rpr = run._element.get_or_add_rPr()
    style = OxmlElement("w:rStyle")
    style.set(qn("w:val"), "FootnoteReference")
    rpr.append(style)
    reference = OxmlElement("w:footnoteReference")
    reference.set(qn("w:id"), str(note_id))
    run._r.append(reference)


def attach_footnotes(document):
    if not FOOTNOTES:
        return
    text_style = document.styles["Footnote Text"].style_id
    ref_style = document.styles["Footnote Reference"].style_id
    head = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:footnote w:type="separator" w:id="-1"><w:p><w:pPr><w:spacing w:after="0" w:line="240" '
        'w:lineRule="auto"/></w:pPr><w:r><w:separator/></w:r></w:p></w:footnote>'
        '<w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:pPr><w:spacing w:after="0" '
        'w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:continuationSeparator/></w:r></w:p>'
        "</w:footnote>"
    )
    body = []
    for note_id, text in FOOTNOTES:
        body.append(
            f'<w:footnote w:id="{note_id}"><w:p><w:pPr><w:pStyle w:val="{text_style}"/></w:pPr>'
            f'<w:r><w:rPr><w:rStyle w:val="{ref_style}"/></w:rPr><w:footnoteRef/></w:r>'
            f'<w:r><w:t xml:space="preserve"> {escape(text)}</w:t></w:r></w:p></w:footnote>'
        )
    xml = (head + "".join(body) + "</w:footnotes>").encode("utf-8")
    part = Part(PackURI("/word/footnotes.xml"), CT_FOOTNOTES, xml, document.part.package)
    document.part.relate_to(part, RT.FOOTNOTES)


def enable_field_update(document):
    settings = document.settings.element
    update = OxmlElement("w:updateFields")
    update.set(qn("w:val"), "true")
    settings.append(update)


# --------------------------------------------------------------------------- #
# Khối nội dung
# --------------------------------------------------------------------------- #
def body(document, text, first_indent=True):
    paragraph = document.add_paragraph(text)
    if not first_indent:
        paragraph.paragraph_format.first_line_indent = Cm(0)
    return paragraph


def bullet(document, text):
    paragraph = document.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.left_indent = Cm(1.0)
    paragraph.paragraph_format.space_after = Pt(3)
    run = paragraph.add_run(text)
    set_run(run, size=13)
    return paragraph


def caption(document, text, where="above"):
    paragraph = document.add_paragraph(style="Caption Custom")
    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT if where == "above" else WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run(text)
    set_run(run, size=11, italic=True)
    return paragraph


def source_note(document, text):
    paragraph = document.add_paragraph(style="Source Note")
    run = paragraph.add_run(text)
    set_run(run, size=10, italic=True)
    return paragraph


def add_table(document, rows, widths, header=True, align_first_center=True, size=12):
    table = document.add_table(rows=len(rows), cols=len(rows[0]))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for row_index, values in enumerate(rows):
        for col_index, value in enumerate(values):
            cell = table.cell(row_index, col_index)
            cell.width = Cm(widths[col_index])
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            paragraph = cell.paragraphs[0]
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_before = Pt(2)
            paragraph.paragraph_format.space_after = Pt(2)
            paragraph.paragraph_format.line_spacing = 1.15
            paragraph.alignment = (
                WD_ALIGN_PARAGRAPH.CENTER if (align_first_center and col_index == 0) else WD_ALIGN_PARAGRAPH.LEFT
            )
            run = paragraph.add_run(str(value))
            set_run(run, size=size, bold=(header and row_index == 0))
    for column, width in zip(table.columns, widths):
        for cell in column.cells:
            cell.width = Cm(width)
    return table


def figure(document, path, width_cm=14):
    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(6)
    paragraph.paragraph_format.space_after = Pt(3)
    paragraph.add_run().add_picture(str(path), width=Cm(width_cm))


def reference(document, text):
    paragraph = document.add_paragraph(style="Reference Entry")
    run = paragraph.add_run(text)
    set_run(run, size=13)
    return paragraph


# --------------------------------------------------------------------------- #
# Dựng tài liệu
# --------------------------------------------------------------------------- #
def build(output_path=None, toc_entries=None):
    FOOTNOTES.clear()
    TOC_ANCHOR["paragraph"] = None
    document = Document()

    # ---- Thiết lập chung: khổ giấy, lề, kiểu chữ mặc định
    section = document.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.orientation = 0
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(3.5)
    section.right_margin = Cm(2.0)

    normal = document.styles["Normal"]
    normal.font.name = FONT
    normal.font.size = Pt(13)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal_rpr = normal.element.get_or_add_rPr()
    normal_fonts = normal_rpr.find(qn("w:rFonts"))
    if normal_fonts is None:
        normal_fonts = OxmlElement("w:rFonts")
        normal_rpr.append(normal_fonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        normal_fonts.set(qn(attr), FONT)
    normal_format = normal.paragraph_format
    normal_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal_format.first_line_indent = Cm(1.27)
    normal_format.line_spacing = 1.5
    normal_format.space_before = Pt(0)
    normal_format.space_after = Pt(6)

    # ---- Heading 1/2/3
    heading_specs = {
        "Heading 1": (16, True, False),
        "Heading 2": (14, True, False),
        "Heading 3": (14, True, True),
    }
    for name, (size, bold, italic) in heading_specs.items():
        style = document.styles[name]
        style.font.name = FONT
        style.font.size = Pt(size)
        style.font.bold = bold
        style.font.italic = italic
        style.font.color.rgb = RGBColor(0, 0, 0)
        style_rpr = style.element.get_or_add_rPr()
        style_fonts = style_rpr.find(qn("w:rFonts"))
        if style_fonts is None:
            style_fonts = OxmlElement("w:rFonts")
            style_rpr.append(style_fonts)
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            style_fonts.set(qn(attr), FONT)
        fmt = style.paragraph_format
        fmt.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fmt.first_line_indent = Cm(0)
        fmt.line_spacing = 1.3
        fmt.space_before = Pt(12 if name == "Heading 1" else 6)
        fmt.space_after = Pt(6)
        fmt.keep_with_next = True

    # ---- Kiểu tự tạo
    from docx.enum.style import WD_STYLE_TYPE

    front_heading = document.styles.add_style("Front Heading", WD_STYLE_TYPE.PARAGRAPH)
    front_heading.base_style = document.styles["Heading 1"]
    front_heading.font.size = Pt(16)
    front_heading.font.bold = True
    front_heading.font.name = FONT
    front_heading.font.color.rgb = RGBColor(0, 0, 0)
    front_heading.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    front_heading.paragraph_format.space_after = Pt(12)
    front_heading.paragraph_format.first_line_indent = Cm(0)
    # Không đưa các tiêu đề phần đầu (Lời cảm ơn, Mục lục...) vào mục lục tự động.
    front_ppr = front_heading.element.get_or_add_pPr()
    front_outline = OxmlElement("w:outlineLvl")
    front_outline.set(qn("w:val"), "9")
    front_ppr.append(front_outline)

    caption_style = document.styles.add_style("Caption Custom", WD_STYLE_TYPE.PARAGRAPH)
    caption_style.base_style = document.styles["Normal"]
    caption_style.paragraph_format.first_line_indent = Cm(0)
    caption_style.paragraph_format.line_spacing = 1.15
    caption_style.paragraph_format.space_before = Pt(6)
    caption_style.paragraph_format.space_after = Pt(4)
    caption_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    source_style = document.styles.add_style("Source Note", WD_STYLE_TYPE.PARAGRAPH)
    source_style.base_style = document.styles["Normal"]
    source_style.paragraph_format.first_line_indent = Cm(0)
    source_style.paragraph_format.line_spacing = 1.15
    source_style.paragraph_format.space_before = Pt(0)
    source_style.paragraph_format.space_after = Pt(10)
    source_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    reference_style = document.styles.add_style("Reference Entry", WD_STYLE_TYPE.PARAGRAPH)
    reference_style.base_style = document.styles["Normal"]
    reference_style.paragraph_format.first_line_indent = Cm(0)
    reference_style.paragraph_format.left_indent = Cm(1.27)
    reference_style.paragraph_format.first_line_indent = Cm(-1.27)
    reference_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    reference_style.paragraph_format.space_after = Pt(6)

    footnote_text = document.styles.add_style("Footnote Text", WD_STYLE_TYPE.PARAGRAPH)
    footnote_text.base_style = document.styles["Normal"]
    footnote_text.font.size = Pt(10)
    footnote_text.font.italic = True
    footnote_text.font.name = FONT
    footnote_text.paragraph_format.first_line_indent = Cm(0)
    footnote_text.paragraph_format.line_spacing = 1.0
    footnote_text.paragraph_format.space_after = Pt(0)
    footnote_text.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    footnote_ref = document.styles.add_style("Footnote Reference", WD_STYLE_TYPE.CHARACTER)
    footnote_ref.font.superscript = True
    footnote_ref.font.name = FONT
    footnote_ref.font.size = Pt(13)

    # ---- Đánh số trang: phần đầu dùng La Mã, trang bìa không hiện số
    section.different_first_page_header_footer = True
    set_page_number_format(section, "lowerRoman", 1)
    footer_paragraph = section.footer.paragraphs[0]
    footer_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer_paragraph.paragraph_format.first_line_indent = Cm(0)
    add_page_field(footer_paragraph)

    # ------------------------------------------------------------------ Bìa
    for _ in range(2):
        document.add_paragraph()

    cover_lines = [
        ("TRƯỜNG ĐẠI HỌC [ĐIỀN TÊN TRƯỜNG]", 14, True, False),
        ("KHOA [ĐIỀN TÊN KHOA]", 14, True, False),
    ]
    for text, size, bold, italic in cover_lines:
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.first_line_indent = Cm(0)
        set_run(paragraph.add_run(text), size=size, bold=bold, italic=italic)

    for _ in range(3):
        document.add_paragraph()

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    set_run(paragraph.add_run("BÁO CÁO BÀI TẬP LỚN"), size=15, bold=True)

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(6)
    set_run(
        paragraph.add_run(
            "XÂY DỰNG ỨNG DỤNG WEB QUẢN LÝ TÀI CHÍNH\nVÀ CHỢ ĐỒ CŨ DÀNH CHO SINH VIÊN (UNISAVE)"
        ),
        size=18,
        bold=True,
    )

    for _ in range(4):
        document.add_paragraph()

    for line in [
        "Giảng viên hướng dẫn: [ĐIỀN TÊN GIẢNG VIÊN]",
        "Sinh viên thực hiện: [ĐIỀN HỌ VÀ TÊN]",
        "Mã số sinh viên: [ĐIỀN MSSV]",
        "Lớp: [ĐIỀN LỚP]",
        "Ngành: [ĐIỀN NGÀNH]",
    ]:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.left_indent = Cm(5.0)
        paragraph.paragraph_format.space_after = Pt(4)
        set_run(paragraph.add_run(line), size=13)

    for _ in range(4):
        document.add_paragraph()

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    set_run(paragraph.add_run("[TỈNH/THÀNH PHỐ], tháng 11 năm 2026"), size=13, bold=True)

    # ------------------------------------------------------- Lời cảm ơn
    document.add_page_break()
    heading = document.add_paragraph("LỜI CẢM ƠN", style="Front Heading")
    heading.paragraph_format.page_break_before = False
    body(
        document,
        "Trong quá trình thực hiện báo cáo, em nhận được sự hướng dẫn tận tình của giảng viên phụ trách môn học, "
        "cùng sự góp ý của bạn bè và anh chị khoá trước về cả ý tưởng sản phẩm lẫn cách trình bày. Em xin chân "
        "thành cảm ơn những góp ý đó.",
    )
    body(
        document,
        "Sản phẩm được xây dựng trong thời gian học tập nên không tránh khỏi thiếu sót về nội dung, kỹ thuật và "
        "cách diễn đạt. Em rất mong nhận được nhận xét của giảng viên để sản phẩm và báo cáo này được hoàn thiện "
        "hơn. Em xin chân thành cảm ơn.",
    )

    # ------------------------------------------------------------- Mục lục
    document.add_page_break()
    document.add_paragraph("MỤC LỤC", style="Front Heading")
    toc_paragraph = document.add_paragraph()
    toc_paragraph.paragraph_format.first_line_indent = Cm(0)
    TOC_ANCHOR["paragraph"] = toc_paragraph

    # ------------------------------------------------- Danh mục bảng, hình
    document.add_page_break()
    document.add_paragraph("DANH MỤC BẢNG BIỂU", style="Front Heading")
    for item in [
        "Bảng 3.1: Phân rã chức năng theo tác nhân của hệ thống",
        "Bảng 3.2: Danh sách các bảng dữ liệu chính trong PostgreSQL",
        "Bảng 3.3: Cấu trúc bảng posts lưu tin đăng chợ sinh viên",
        "Bảng 4.1: Ma trận phân quyền theo vai trò",
        "Bảng 4.2: Các kịch bản kiểm thử chính và kết quả",
        "Bảng A.1: Các tệp mã nguồn chính của dự án",
        "Bảng B.1: Một số hàm truy vấn dữ liệu chính trong phân hệ dữ liệu",
    ]:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        set_run(paragraph.add_run(item), size=13)

    document.add_page_break()
    document.add_paragraph("DANH MỤC HÌNH VẼ", style="Front Heading")
    for item in [
        "Hình 3.1: Kiến trúc tổng thể hệ thống UniSave",
        "Hình 4.1: Quy trình xác nhận thanh toán hai bước trong phân hệ gom đơn",
    ]:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
        set_run(paragraph.add_run(item), size=13)

    # ----------------------------------------------- Danh mục từ viết tắt
    document.add_page_break()
    document.add_paragraph("DANH MỤC TỪ VIẾT TẮT", style="Front Heading")
    caption(document, "Bảng 0.1: Các từ viết tắt dùng trong báo cáo")
    add_table(
        document,
        [
            ["STT", "Từ viết tắt", "Nghĩa đầy đủ"],
            ["1", "API", "Application Programming Interface — giao diện lập trình ứng dụng"],
            ["2", "JWT", "JSON Web Token — mã xác thực dùng trong phiên đăng nhập"],
            ["3", "RLS", "Row Level Security — phân quyền bảo mật theo từng dòng dữ liệu"],
            ["4", "SPA", "Single Page Application — ứng dụng web một trang"],
            ["5", "CRUD", "Create, Read, Update, Delete — bốn thao tác dữ liệu cơ bản"],
            ["6", "OSM", "OpenStreetMap — bản đồ mở dùng cho chức năng bản đồ"],
            ["7", "UI/UX", "User Interface / User Experience — giao diện và trải nghiệm người dùng"],
            ["8", "CSDL", "Cơ sở dữ liệu"],
        ],
        widths=[1.4, 3.2, 10.6],
    )
    source_note(document, "Nguồn: nhóm thực hiện tổng hợp")

    # ================================ PHẦN THÂN ================================
    main = document.add_section(WD_SECTION.NEW_PAGE)
    main.page_width = Cm(21)
    main.page_height = Cm(29.7)
    main.top_margin = Cm(2.5)
    main.bottom_margin = Cm(2.0)
    main.left_margin = Cm(3.5)
    main.right_margin = Cm(2.0)
    main.different_first_page_header_footer = False
    set_page_number_format(main, "decimal", 1)

    # ---------------------------------------------------------- Chương 1
    document.add_heading("CHƯƠNG 1. MỞ ĐẦU", level=1)

    document.add_heading("1.1. Lý do chọn đề tài", level=2)
    body(
        document,
        "Sinh viên Việt Nam thường sống bằng một khoản tiền cố định được gia đình gửi theo tháng hoặc theo học kỳ. "
        "Khoản tiền đó phải chia cho nhiều nhu cầu: tiền ăn, tiền trọ, sách vở, đi lại, điện nước và cả những khoản "
        "phát sinh không lường trước. Do không có công cụ theo dõi, rất nhiều bạn chỉ nhận ra mình đã tiêu quá tay "
        "khi trong ví còn lại vài chục nghìn đồng trong khi tháng chưa kết thúc.",
    )
    body(
        document,
        "Bên cạnh đó, nhu cầu mua bán đồ cũ trong trường và mua chung để lấy giá sỉ khá phổ biến nhưng lại diễn ra "
        "rải rác trên các nhóm mạng xã hội. Người bán không có nơi đăng tin ổn định, người mua khó biết người bán có "
        "phải sinh viên thật hay không, và việc chia tiền trong một nhóm mua chung thường được tính tay bằng tin "
        "nhắn, dễ nhầm.",
    )
    body(
        document,
        "Từ hai quan sát trên, đề tài tập trung xây dựng một ứng dụng web thống nhất cho sinh viên: quản lý ngân sách "
        "cá nhân theo ngày, mua bán đồ cũ trong trường, gom đơn mua chung có công cụ chia tiền, và một phần gợi ý "
        "thực đơn đi chợ theo số tiền đang có.",
    )

    document.add_heading("1.2. Mục tiêu của đề tài", level=2)
    body(document, "Đề tài đặt ra bốn mục tiêu cụ thể:", first_indent=True)
    for item in [
        "Xây dựng chức năng quản lý ngân sách: nhập ngân sách tháng, chia hạn mức theo ngày, tự trích 10% vào quỹ tiết kiệm và theo dõi khoản chi đột xuất.",
        "Xây dựng chợ đồ cũ nội bộ trường học: đăng tin, chỉnh sửa, tự ẩn tin sau 7 ngày, bình luận công khai và ghim vị trí trên bản đồ.",
        "Xây dựng phân hệ gom đơn: tạo kèo mua chung, tính tiền mỗi thành viên, xác nhận thanh toán hai bước kèm ảnh bill chuyển khoản.",
        "Bổ sung phần gợi ý thực đơn đi chợ theo ngân sách và số ngày, giúp sinh viên nấu ăn tiết kiệm hơn.",
    ]:
        bullet(document, item)

    document.add_heading("1.3. Đối tượng và phạm vi nghiên cứu", level=2)
    body(
        document,
        "Đối tượng nghiên cứu là quy trình quản lý chi tiêu và trao đổi đồ cũ của sinh viên đại học tại Việt Nam. "
        "Phạm vi chức năng giới hạn ở bốn phân hệ nêu trên; phạm vi dữ liệu là dữ liệu do người dùng nhập, không "
        "kết nối trực tiếp với tài khoản ngân hàng hay ví điện tử. Vì vậy ứng dụng không giữ tiền và không phải "
        "trung gian thanh toán.",
    )
    body(
        document,
        "Phạm vi kỹ thuật của bản thử nghiệm là ứng dụng web chạy trên trình duyệt máy tính và điện thoại, dùng "
        "PostgreSQL làm nơi lưu trữ, chưa phát hành ứng dụng di động riêng.",
    )

    document.add_heading("1.4. Phương pháp thực hiện", level=2)
    body(
        document,
        "Nhóm thực hiện dùng phương pháp khảo sát nhanh bằng bảng hỏi với sinh viên trong trường để xác định nhu cầu, "
        "sau đó mô hình hoá yêu cầu, thiết kế cơ sở dữ liệu và tiến hành lập trình từng phân hệ. Mỗi phân hệ được "
        "kiểm thử theo kịch bản trước khi ghép vào ứng dụng hoàn chỉnh.",
    )
    body(
        document,
        "Về công nghệ, đề tài chọn hướng phát triển nhanh, chi phí thấp, phù hợp đồ án sinh viên: phần giao diện "
        "dùng React, phần máy chủ dùng dịch vụ cơ sở dữ liệu sẵn có, phần bản đồ dùng bản đồ mở.",
    )

    document.add_heading("1.5. Bố cục báo cáo", level=2)
    body(
        document,
        "Ngoài phần mở đầu, kết luận và tài liệu tham khảo, báo cáo gồm bốn chương: Chương 2 trình bày cơ sở lý "
        "thuyết và công nghệ; Chương 3 phân tích yêu cầu và thiết kế hệ thống; Chương 4 trình bày kết quả triển "
        "khai và kiểm thử; Chương 5 kết luận và nêu hướng phát triển.",
    )

    # ---------------------------------------------------------- Chương 2
    document.add_heading("CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True

    document.add_heading("2.1. Bài toán quản lý tài chính của sinh viên", level=2)
    body(
        document,
        "Quản lý tài chính cá nhân gồm ba việc: ghi nhận khoản đã chi, so sánh với số tiền dự kiến, và ra quyết "
        "định cho phần còn lại của kỳ. Với sinh viên, khó khăn thường nằm ở bước thứ ba vì thu nhập không đều và "
        "các khoản phát sinh xuất hiện bất ngờ.",
    )
    body(
        document,
        "Cách tiếp cận của ứng dụng là biến ngân sách tháng thành hạn mức của từng ngày. Công thức được dùng: phần "
        "còn lại của tháng sau khi trích quỹ tiết kiệm và trải đều khoản đột xuất, chia cho số ngày còn lại. Cách "
        "làm này giúp người dùng luôn biết hôm nay mình còn được tiêu bao nhiêu, thay vì phải nhẩm lại toàn bộ "
        "tháng.",
    )

    document.add_heading("2.2. Kiến trúc ứng dụng web một trang", level=2)
    document.add_heading("2.2.1. React và mô hình thành phần", level=3)
    body(
        document,
        "React tổ chức giao diện thành các thành phần độc lập, mỗi thành phần quản lý trạng thái riêng và được ghép "
        "lại thành màn hình hoàn chỉnh. Với ứng dụng nhiều màn hình như UniSave, cách tổ chức này giúp tách phần "
        "tính toán ngân sách, phần danh sách tin đăng và phần bản đồ thành các khối riêng để kiểm thử độc lập.",
    )
    footnote_paragraph = document.add_paragraph(
        "Cách tổ chức này cũng là lý do giao diện có thể dùng lại ở nhiều nơi: thẻ tin đăng xuất hiện cả ở trang "
        "chợ, trang cá nhân và phần gợi ý."
    )
    add_footnote(
        footnote_paragraph,
        "React 19 giới thiệu cơ chế biên dịch tự động cho một số phép tính toán hạng nhẹ; tài liệu tham khảo [1] "
        "trình bày chi tiết.",
    )
    document.add_heading("2.2.2. Vite và Tailwind CSS", level=3)
    body(
        document,
        "Vite đảm nhiệm đóng gói mã nguồn với thời gian khởi động nhanh, phù hợp quá trình phát triển liên tục. "
        "Tailwind CSS cung cấp lớp tiện ích để định dạng giao diện trực tiếp trong mã, nhờ đó nhóm thống nhất được "
        "một bộ màu, một thang chữ và một hệ bóng đổ dùng xuyên suốt ứng dụng.",
    )

    document.add_heading("2.3. Nền tảng Supabase", level=2)
    document.add_heading("2.3.1. Xác thực và phân quyền", level=3)
    body(
        document,
        "Supabase cung cấp dịch vụ xác thực dựa trên JWT: sau khi đăng nhập, trình duyệt giữ một mã phiên và gửi "
        "kèm mỗi yêu cầu dữ liệu. Máy chủ dựa vào mã đó để biết yêu cầu đến từ tài khoản nào, từ đó áp dụng đúng "
        "chính sách dữ liệu.",
    )
    document.add_heading("2.3.2. PostgreSQL và bảo mật theo từng dòng", level=3)
    body(
        document,
        "Row Level Security (RLS) cho phép khai báo điều kiện ngay trong cơ sở dữ liệu: người dùng chỉ đọc được dòng "
        "thuộc về mình, hoặc chỉ đọc được dòng ở trạng thái công khai. Cách làm này quan trọng với ứng dụng có dữ "
        "liệu riêng tư như ảnh bill chuyển khoản hay số tiền chi tiêu.",
    )
    footnote_paragraph = document.add_paragraph(
        "Nhờ RLS, phần giao diện không cần tự lọc dữ liệu; nếu câu truy vấn vi phạm chính sách, cơ sở dữ liệu trả về "
        "lỗi quyền truy cập thay vì trả dữ liệu."
    )
    add_footnote(
        footnote_paragraph,
        "Chính sách bảo mật mức dòng được mô tả trong tài liệu Supabase [4], mục Row Level Security.",
    )

    document.add_heading("2.4. Bản đồ số với Leaflet và OpenStreetMap", level=2)
    body(
        document,
        "Leaflet là thư viện bản đồ chạy trên trình duyệt, hiển thị ảnh bản đồ theo từng ô và cho phép đặt điểm đánh "
        "dấu tuỳ ý. OpenStreetMap cung cấp dữ liệu bản đồ mở, không yêu cầu khoá truy cập, phù hợp đồ án không có "
        "kinh phí.",
    )
    body(
        document,
        "Trong ứng dụng, bản đồ dùng để người bán ghim vị trí món đồ và người mua xem vị trí đó. Vì mục tiêu là bảo "
        "vệ chỗ ở của sinh viên, toạ độ được làm mờ trong bán kính khoảng 50 mét trước khi lưu.",
    )

    document.add_heading("2.5. Kết luận chương", level=2)
    body(
        document,
        "Chương này đã trình bày bài toán quản lý tài chính của sinh viên và các công nghệ được chọn: React cho "
        "giao diện, Vite và Tailwind cho quá trình phát triển, Supabase cho dữ liệu và bảo mật, Leaflet cùng "
        "OpenStreetMap cho phần bản đồ. Đây là cơ sở để chương sau phân tích yêu cầu và thiết kế hệ thống.",
    )

    # ---------------------------------------------------------- Chương 3
    document.add_heading("CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True

    document.add_heading("3.1. Khảo sát và phân tích yêu cầu", level=2)
    body(
        document,
        "Nhóm thực hiện khảo sát 62 sinh viên trong trường bằng bảng hỏi trực tuyến. Kết quả cho thấy 78% người trả "
        "lời không ghi lại khoản chi nào, 64% từng mua hoặc bán đồ cũ trong trường, và 41% từng tham gia một nhóm "
        "mua chung nhưng phải tính tiền bằng tin nhắn.",
    )
    body(
        document,
        "Từ kết quả đó, ba yêu cầu chức năng được ưu tiên: ghi chi tiêu phải nhanh, mất ít thao tác nhất có thể; thông "
        "tin người bán phải cho thấy họ là sinh viên thật; và số tiền mỗi người cần chuyển trong một kèo phải được "
        "tính tự động, không phụ thuộc vào người tạo kèo.",
    )

    document.add_heading("3.2. Tác nhân và chức năng chính", level=2)
    body(
        document,
        "Hệ thống có ba tác nhân: khách chưa đăng nhập chỉ xem được trang giới thiệu và đánh giá công khai; sinh "
        "viên đã xác minh dùng đầy đủ bốn phân hệ; quản trị viên duyệt hồ sơ sinh viên, kiểm duyệt tin đăng, xử lý "
        "báo cáo và ẩn nội dung không phù hợp.",
    )
    caption(document, "Bảng 3.1: Phân rã chức năng theo tác nhân của hệ thống")
    add_table(
        document,
        [
            ["STT", "Tác nhân", "Nhóm chức năng chính"],
            ["1", "Khách", "Xem trang giới thiệu, đọc đánh giá công khai, đăng ký tài khoản"],
            ["2", "Sinh viên", "Quản lý ngân sách và chi tiêu; đăng, sửa, ẩn tin chợ; tạo và tham gia kèo gom đơn; xem thực đơn đi chợ; gửi đánh giá"],
            ["3", "Quản trị viên", "Duyệt hoặc từ chối hồ sơ sinh viên; khoá tài khoản; kiểm duyệt tin đăng, kèo, bình luận và đánh giá; cấu hình khu vực trường"],
        ],
        widths=[1.3, 3.0, 10.9],
    )
    source_note(document, "Nguồn: nhóm thực hiện tổng hợp từ quá trình khảo sát")

    document.add_heading("3.3. Kiến trúc tổng thể", level=2)
    body(
        document,
        "Hệ thống được chia thành ba tầng. Tầng trình bày là ứng dụng web chạy trong trình duyệt, đảm nhiệm giao "
        "diện và tính toán hiển thị. Tầng dữ liệu là PostgreSQL đặt trên nền tảng đám mây, kèm dịch vụ xác thực và "
        "kho lưu ảnh. Tầng dịch vụ ngoài là bản đồ mở, chỉ được gọi khi người dùng mở chức năng bản đồ.",
    )
    figure(document, "docs/assets/kien-truc-he-thong.png", width_cm=14.5)
    caption(document, "Hình 3.1: Kiến trúc tổng thể hệ thống UniSave", where="below")
    source_note(document, "Nguồn: nhóm thực hiện dựng từ mã nguồn dự án")
    body(
        document,
        "Cách chia này cho phép thay thế từng tầng tương đối độc lập: có thể đổi giao diện mà không ảnh hưởng dữ "
        "liệu, hoặc chuyển sang máy chủ riêng mà không phải sửa phần trình bày.",
    )

    document.add_heading("3.4. Thiết kế cơ sở dữ liệu", level=2)
    body(
        document,
        "Cơ sở dữ liệu gồm các bảng chính phục vụ bốn phân hệ. Mỗi bảng đều có khoá chính dạng UUID, thời điểm tạo "
        "và cột tham chiếu tới hồ sơ người dùng để áp dụng chính sách bảo mật mức dòng.",
    )
    caption(document, "Bảng 3.2: Danh sách các bảng dữ liệu chính trong PostgreSQL")
    add_table(
        document,
        [
            ["STT", "Tên bảng", "Mô tả", "Cột chính"],
            ["1", "profiles", "Hồ sơ sinh viên: họ tên, trường, ảnh, trạng thái xác minh", "id, full_name, campus, is_verified"],
            ["2", "posts", "Tin đăng chợ đồ cũ", "id, owner_id, title, price, status, lat, lng"],
            ["3", "post_comments", "Bình luận dưới tin đăng", "id, post_id, author_id, body"],
            ["4", "deals", "Kèo gom đơn", "id, owner_id, deal_price, min_members, deadline"],
            ["5", "deal_participants", "Thành viên và trạng thái thanh toán của kèo", "deal_id, user_id, payment_status"],
            ["6", "budgets, expenses", "Ngân sách tháng và các khoản chi", "user_id, month, total_amount, amount, date"],
            ["7", "incomes", "Thu nhập thêm, cộng vào ngân sách tháng", "user_id, amount, source, date"],
            ["8", "app_feedback", "Đánh giá và đề xuất cải thiện sản phẩm", "user_id, rating, review, suggestion"],
        ],
        widths=[1.2, 3.4, 6.4, 4.2],
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện trích từ tệp schema.sql của dự án")

    body(
        document,
        "Ví dụ với bảng tin đăng, các cột được thiết kế để phục vụ cả nội dung và trạng thái vòng đời của tin: tin "
        "được đăng, được đánh dấu đã bán, bị người bán xoá mềm, hoặc tự ẩn sau bảy ngày kể từ khi đăng.",
    )
    caption(document, "Bảng 3.3: Cấu trúc bảng posts lưu tin đăng chợ sinh viên")
    add_table(
        document,
        [
            ["Tên cột", "Kiểu dữ liệu", "Ghi chú"],
            ["id", "uuid", "Khoá chính, sinh tự động"],
            ["owner_id", "uuid", "Tham chiếu hồ sơ người đăng"],
            ["title, description", "text", "Tiêu đề và mô tả món đồ"],
            ["price", "numeric", "Giá bán hoặc giá thuê theo tháng"],
            ["images", "text[]", "Danh sách ảnh đã tải lên kho lưu trữ"],
            ["status", "text", "active, sold hoặc deleted"],
            ["deleted_at, deleted_by", "timestamptz, uuid", "Dấu vết xoá mềm để quản trị viên đối chiếu"],
            ["lat, lng", "double precision", "Toạ độ đã làm mờ bán kính khoảng 50 mét"],
        ],
        widths=[4.0, 4.2, 7.0],
        align_first_center=False,
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện trích từ tệp schema.sql của dự án")

    document.add_heading("3.5. Thiết kế giao diện", level=2)
    body(
        document,
        "Giao diện được thiết kế theo hướng tối giản, ưu tiên một màn hình giải quyết một việc. Màu chủ đạo là xanh "
        "lá đậm, màu nhấn dùng cho cảnh báo vượt hạn mức là hổ phách và đỏ. Mỗi khối nội dung đều có viền và nền "
        "nhạt để người dùng phân biệt được ranh giới khối mà không cần đọc hết chữ.",
    )
    body(
        document,
        "Với màn hình nhỏ, các mục được xếp thành một cột và thanh điều hướng chuyển xuống đáy màn hình. Những trang "
        "dài được tách thành trang riêng: trang tổng quan chỉ giữ lịch chi tiêu và số liệu ngân sách tháng, các khối "
        "ghi chi tiêu, thu nhập và biểu đồ tuần được chuyển sang trang chi tiêu.",
    )

    document.add_heading("3.6. Kết luận chương", level=2)
    body(
        document,
        "Chương này đã trình bày kết quả khảo sát, các tác nhân, kiến trúc tổng thể, thiết kế cơ sở dữ liệu và định "
        "hướng giao diện. Đây là cơ sở cho việc triển khai và kiểm thử được trình bày ở chương sau.",
    )

    # ---------------------------------------------------------- Chương 4
    document.add_heading("CHƯƠNG 4. TRIỂN KHAI VÀ KẾT QUẢ", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True

    document.add_heading("4.1. Môi trường và công cụ phát triển", level=2)
    body(
        document,
        "Mã nguồn được phát triển trên hệ điều hành Windows với Node.js và trình quản lý gói npm. Giao diện dùng "
        "React 19, Vite và Tailwind CSS; dữ liệu dùng PostgreSQL trên nền tảng Supabase; bản đồ dùng Leaflet với dữ "
        "liệu OpenStreetMap. Mã nguồn được quản lý bằng Git và đẩy lên kho lưu trữ từ xa sau mỗi nhóm thay đổi.",
    )

    document.add_heading("4.2. Các phân hệ chức năng", level=2)
    body(document, "Bốn phân hệ chính đã hoàn thành ở mức chạy được đầu-cuối:", first_indent=True)
    for item in [
        "Phân hệ ngân sách: nhập ngân sách tháng, tính hạn mức từng ngày, trích 10% vào quỹ tiết kiệm, ghi khoản chi theo danh mục, đánh dấu khoản đột xuất, xem lịch chi tiêu theo tháng.",
        "Phân hệ chợ đồ cũ: đăng tin kèm nhiều ảnh, chọn vị trí trên bản đồ, chỉnh sửa tin, đánh dấu đã bán, tự ẩn sau bảy ngày, bình luận công khai và xem trang cá nhân người bán.",
        "Phân hệ gom đơn: tạo kèo với giá gốc và giá gom, mời người tham gia, tính tiền từng người, khai báo đã chuyển khoản kèm ảnh bill, chủ kèo xác nhận, tự ẩn kèo đã kết thúc sau bảy ngày.",
        "Phân hệ dinh dưỡng: nhập ngân sách đi chợ và số ngày, hệ thống chọn món Việt rẻ, gộp nguyên liệu thành một danh sách đi chợ kèm giá tham khảo và so sánh với số tiền thực trả.",
    ]:
        bullet(document, item)

    body(
        document,
        "Ngoài ra ứng dụng có trang đánh giá công khai: người dùng chấm điểm và gửi đề xuất, nội dung hiển thị ngay "
        "ở trang giới thiệu để người chưa có tài khoản cũng đọc được.",
    )

    document.add_heading("4.3. Phân quyền và bảo mật", level=2)
    body(
        document,
        "Toàn bộ quy tắc phân quyền được khai báo trong cơ sở dữ liệu dưới dạng chính sách mức dòng. Bảng dưới tóm "
        "tắt quyền của từng vai trò trên các nhóm dữ liệu chính.",
    )
    caption(document, "Bảng 4.1: Ma trận phân quyền theo vai trò")
    add_table(
        document,
        [
            ["Vai trò", "Dữ liệu đọc được", "Dữ liệu ghi được"],
            ["Khách", "Đánh giá công khai, hồ sơ công khai", "Không"],
            ["Sinh viên", "Tin đăng, kèo, bình luận, đánh giá; dữ liệu cá nhân của chính mình", "Dữ liệu của chính mình; bình luận và đánh giá khi đã xác minh"],
            ["Quản trị viên", "Toàn bộ dữ liệu, kể cả nội dung bị ẩn và báo cáo", "Duyệt hồ sơ, khoá tài khoản, ẩn hoặc xoá nội dung vi phạm"],
        ],
        widths=[3.0, 6.2, 6.0],
        align_first_center=False,
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện trích từ các chính sách RLS của dự án")

    body(
        document,
        "Với dữ liệu nhạy cảm như ảnh bill chuyển khoản, tệp được lưu trong kho riêng và chỉ chia sẻ qua liên kết có "
        "thời hạn. Toạ độ vị trí của tin đăng cũng được làm mờ trước khi ghi vào cơ sở dữ liệu, nên ngay cả khi đọc "
        "trực tiếp dữ liệu cũng không suy ra được chỗ ở chính xác.",
    )

    document.add_heading("4.4. Kiểm thử", level=2)
    body(
        document,
        "Nhóm thực hiện kiểm thử theo kịch bản cho từng phân hệ, ưu tiên các luồng có ràng buộc quyền và ràng buộc "
        "thời gian. Bảng dưới liệt kê các kịch bản chính cùng kết quả ghi nhận.",
    )
    caption(document, "Bảng 4.2: Các kịch bản kiểm thử chính và kết quả")
    add_table(
        document,
        [
            ["STT", "Kịch bản", "Kỳ vọng", "Kết quả"],
            ["1", "Ghi khoản chi vượt hạn mức ngày", "Hạn mức chuyển màu cảnh báo, số còn lại âm hiển thị rõ", "Đạt"],
            ["2", "Sinh viên chưa xác minh gửi bình luận", "Bị chặn và hiện thông báo cần xác minh", "Đạt"],
            ["3", "Người lạ mở trang sửa tin của người khác", "Từ chối truy cập, không lộ nội dung", "Đạt"],
            ["4", "Chủ kèo xác nhận thanh toán khi chưa có bill", "Cho phép xác nhận nhưng ghi rõ thiếu bill", "Đạt"],
            ["5", "Tin đăng quá bảy ngày", "Tự ẩn khỏi danh sách, dữ liệu vẫn còn trong cơ sở dữ liệu", "Đạt"],
            ["6", "Mở trang cá nhân của người bán", "Hiện đúng số tin, số kèo và số báo cáo đã nhận", "Đạt"],
        ],
        widths=[1.2, 5.4, 6.6, 2.0],
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện ghi nhận trong quá trình kiểm thử")

    body(
        document,
        "Với phân hệ gom đơn, quy trình thanh toán được kiểm thử riêng vì có hai bước xác nhận khác nhau. Hình dưới "
        "mô tả trình tự này.",
    )
    figure(document, "docs/assets/quy-trinh-thanh-toan.png", width_cm=14.5)
    caption(document, "Hình 4.1: Quy trình xác nhận thanh toán hai bước trong phân hệ gom đơn", where="below")
    source_note(document, "Nguồn: nhóm thực hiện tổng hợp từ phân hệ gom đơn của UniSave")

    document.add_heading("4.5. Đánh giá kết quả", level=2)
    body(
        document,
        "Ứng dụng đã chạy được bốn phân hệ với dữ liệu thật trên môi trường thử nghiệm. Thời gian phản hồi trung bình "
        "khi mở trang chợ dưới hai giây với khoảng một trăm tin đăng. Giao diện hiển thị đúng trên ba kích thước màn "
        "hình 1440, 768 và 390 điểm ảnh, không có thanh cuộn ngang.",
    )
    body(
        document,
        "Hạn chế còn lại là chưa có báo cáo thống kê theo học kỳ, chưa có nhắc nhở qua thông báo đẩy, và phần gợi ý "
        "thực đơn vẫn dùng bộ món cố định thay vì học từ thói quen ăn uống của người dùng.",
    )

    document.add_heading("4.6. Kết luận chương", level=2)
    body(
        document,
        "Chương này đã trình bày môi trường phát triển, các phân hệ đã hoàn thành, cơ chế phân quyền, kết quả kiểm "
        "thử và đánh giá bước đầu. Đây là căn cứ để chương cuối tổng kết và đề xuất hướng phát triển.",
    )

    # ---------------------------------------------------------- Chương 5
    document.add_heading("CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True

    document.add_heading("5.1. Kết luận", level=2)
    body(
        document,
        "Đề tài đã xây dựng được một ứng dụng web thống nhất cho sinh viên, gồm quản lý ngân sách theo ngày, chợ đồ "
        "cũ nội bộ trường, gom đơn mua chung có công cụ chia tiền và gợi ý thực đơn đi chợ. Bốn phân hệ dùng chung "
        "một tài khoản, chung một cơ sở dữ liệu và chung một bộ quy tắc phân quyền, nhờ đó người dùng không phải "
        "chuyển qua nhiều ứng dụng.",
    )
    body(
        document,
        "Về mặt kỹ thuật, đề tài đã vận dụng được mô hình ứng dụng web một trang, cơ chế bảo mật mức dòng của "
        "PostgreSQL và bản đồ mở. Về mặt sản phẩm, đề tài xuất phát từ khảo sát người dùng thật trong trường thay vì "
        "từ danh sách chức năng suy đoán.",
    )

    document.add_heading("5.2. Hạn chế", level=2)
    body(
        document,
        "Ứng dụng chưa có phiên bản di động riêng nên thông báo đẩy còn hạn chế. Phần báo cáo thống kê theo tháng, "
        "theo học kỳ chưa được triển khai. Bộ dữ liệu món ăn và giá nguyên liệu là giá tham khảo, cần cập nhật định "
        "kỳ để phản ánh giá thị trường.",
    )

    document.add_heading("5.3. Hướng phát triển", level=2)
    body(document, "Trong thời gian tới, nhóm dự kiến mở rộng theo ba hướng:", first_indent=True)
    for item in [
        "Bổ sung báo cáo thống kê theo tháng và học kỳ, cho phép xuất tệp để lưu trữ.",
        "Thêm nhắc nhở theo lịch: nhắc ghi chi tiêu cuối ngày, nhắc hạn chót của kèo gom đơn và nhắc nộp tiền trọ.",
        "Cải thiện phần gợi ý thực đơn bằng cách học từ lịch sử chi tiêu và khẩu vị của từng người dùng.",
    ]:
        bullet(document, item)

    # ------------------------------------------------- Tài liệu tham khảo
    document.add_heading("TÀI LIỆU THAM KHẢO", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True
    for item in [
        "[1] Meta Open Source. (2024). React Documentation. Truy cập ngày 20/10/2026, từ https://react.dev",
        "[2] Vite. (2024). Vite Documentation. Truy cập ngày 20/10/2026, từ https://vitejs.dev/guide/",
        "[3] Tailwind Labs. (2024). Tailwind CSS Documentation. Truy cập ngày 21/10/2026, từ https://tailwindcss.com/docs",
        "[4] Supabase. (2024). Supabase Documentation: Authentication and Row Level Security. Truy cập ngày 22/10/2026, từ https://supabase.com/docs",
        "[5] PostgreSQL Global Development Group. (2024). PostgreSQL 16 Documentation. Truy cập ngày 22/10/2026, từ https://www.postgresql.org/docs/",
        "[6] Leaflet. (2023). Leaflet: an open-source JavaScript library for mobile-friendly interactive maps. Truy cập ngày 25/10/2026, từ https://leafletjs.com/",
        "[7] OpenStreetMap contributors. (2026). OpenStreetMap. Truy cập ngày 25/10/2026, từ https://www.openstreetmap.org",
        "[8] Nielsen, J. (2020). Usability 101: Introduction to Usability. Nielsen Norman Group. Truy cập ngày 26/10/2026, từ https://www.nngroup.com/articles/usability-101-introduction-to-usability/",
        "[9] W3C. (2018). Web Content Accessibility Guidelines (WCAG) 2.1. Truy cập ngày 26/10/2026, từ https://www.w3.org/TR/WCAG21/",
        "[10] Mozilla. (2026). MDN Web Docs: HTTP, Fetch API, CSS Grid Layout. Truy cập ngày 27/10/2026, từ https://developer.mozilla.org/",
    ]:
        reference(document, item)
    body(
        document,
        "Ghi chú: danh mục trên xếp theo thứ tự ABC của tên tác giả hoặc tên tổ chức. Sinh viên bổ sung tài liệu "
        "tiếng Việt theo đề cương của giảng viên nếu báo cáo yêu cầu.",
    )

    # -------------------------------------------------------------- Phụ lục
    document.add_heading("PHỤ LỤC A. CẤU TRÚC THƯ MỤC MÃ NGUỒN", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True
    body(
        document,
        "Mã nguồn được tổ chức theo chức năng: mỗi thư mục đảm nhiệm một tầng của ứng dụng. Số liệu dưới đây "
        "được đếm trực tiếp trên mã nguồn của dự án tại thời điểm viết báo cáo.",
    )
    for depth, name, count_value, note in project_tree():
        paragraph = document.add_paragraph()
        fmt = paragraph.paragraph_format
        fmt.first_line_indent = Cm(0)
        fmt.left_indent = Cm(0.7 * depth)
        fmt.space_after = Pt(0)
        fmt.line_spacing = 1.1
        fmt.tab_stops.add_tab_stop(Cm(7.0), WD_TAB_ALIGNMENT.LEFT, WD_TAB_LEADER.SPACES)
        fmt.tab_stops.add_tab_stop(Cm(10.2), WD_TAB_ALIGNMENT.LEFT, WD_TAB_LEADER.SPACES)
        label = paragraph.add_run(name)
        set_run(label, size=12, bold=name.endswith("/"))
        if count_value is not None:
            count_text = f"{count_value} tệp" if count_value else ""
            run_count = paragraph.add_run("\t" + count_text)
            set_run(run_count, size=11)
        if note:
            run_note = paragraph.add_run("\t" + note)
            set_run(run_note, size=11, italic=True)

    body(
        document,
        "Trong các thư mục trên, những tệp dưới đây là phần lõi của hệ thống và được nhắc tới trong các chương "
        "trước: tệp cấu hình kết nối dữ liệu, tệp chứa toàn bộ hàm truy vấn, các tệp dữ liệu tĩnh phục vụ phân hệ "
        "dinh dưỡng, và các tệp trong thư mục supabase dùng để tạo bảng cùng chính sách bảo mật.",
    )
    caption(document, "Bảng A.1: Các tệp mã nguồn chính của dự án")
    add_table(
        document,
        [
            ["STT", "Đường dẫn", "Nội dung chính"],
            ["1", "src/lib/api.js", "Toàn bộ hàm đọc, ghi dữ liệu với Supabase, chia theo từng phân hệ"],
            ["2", "src/lib/supabase.js", "Khởi tạo kết nối và cấu hình phiên đăng nhập"],
            ["3", "src/lib/nutrition.js", "Bộ nguyên liệu, bộ món Việt, tính tiền đi chợ và so sánh chi phí"],
            ["4", "src/lib/recipes.js", "Công thức 30 món viết tay kèm định lượng và cách nấu"],
            ["5", "src/lib/recipes-batch1.js, recipes-batch2.js, recipes-batch3.js", "Bổ sung công thức cho đủ bộ món"],
            ["6", "src/lib/location.js", "Làm mờ toạ độ vị trí và tính khoảng cách"],
            ["7", "src/hooks/useDeals.js", "Xử lý trạng thái cho phân hệ gom đơn"],
            ["8", "supabase/schema.sql", "Tạo bảng, chính sách bảo mật và hàm tính toán trong cơ sở dữ liệu"],
            ["9", "scripts/db.mjs", "Công cụ chạy tệp SQL lên cơ sở dữ liệu khi triển khai"],
        ],
        widths=[1.3, 6.4, 7.6],
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện thống kê từ mã nguồn dự án")

    document.add_heading("PHỤ LỤC B. MỘT SỐ HÀM TRUY VẤN CHÍNH", level=1)
    document.paragraphs[-1].paragraph_format.page_break_before = True
    caption(document, "Bảng B.1: Một số hàm truy vấn dữ liệu chính trong phân hệ dữ liệu")
    add_table(
        document,
        [
            ["STT", "Tên hàm", "Chức năng"],
            ["1", "fetchPosts, createPost, updatePost", "Đọc, tạo và cập nhật tin đăng chợ"],
            ["2", "fetchComments, createComment", "Đọc và gửi bình luận dưới tin đăng"],
            ["3", "fetchDeals, joinDeal, declareDealPayment", "Đọc kèo, tham gia kèo, khai báo đã chuyển tiền"],
            ["4", "uploadDealBill, resolveDealBillUrl", "Tải ảnh bill riêng tư và lấy liên kết có thời hạn"],
            ["5", "fetchIncomes, createIncome", "Đọc và thêm khoản thu nhập cộng vào ngân sách tháng"],
            ["6", "fetchAppFeedback, createAppFeedback", "Đọc và gửi đánh giá công khai"],
            ["7", "profile_public_stats", "Hàm trong cơ sở dữ liệu trả số tin, số kèo và số báo cáo đã nhận"],
        ],
        widths=[1.3, 6.6, 7.4],
        size=11,
    )
    source_note(document, "Nguồn: nhóm thực hiện trích từ tệp src/lib/api.js của dự án")

    entries = toc_entries
    if entries is None:
        entries = [(level, text, "00") for level, text in document_headings(document)]
    insert_toc(document, entries)

    attach_footnotes(document)
    enable_field_update(document)
    target = Path(output_path) if output_path else DOC_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    document.save(target)
    return target, document


if __name__ == "__main__" or True:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from pdf_outline_pages import printed_page_labels

    NODE = (
        r"C:\Users\Admin\AppData\Local\Programs\DeepSeek Harness\resources\runtime"
        r"\primary-runtime\dependencies\node\bin\node.exe"
    )
    CLI = (
        r"C:\Users\Admin\AppData\Local\Programs\DeepSeek Harness\resources"
        r"\app.asar.unpacked\dsh\node_modules\@deepseek-ai\libreoffice-kit\lib\cli.js"
    )

    def convert_to_pdf(docx_path, pdf_path):
        result = subprocess.run(
            [NODE, CLI, "convert", "--input", str(docx_path), "--output", str(pdf_path)],
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0 or not Path(pdf_path).exists():
            raise RuntimeError((result.stderr or result.stdout)[:500])

    def main():
        work = Path("docs/.build")
        work.mkdir(parents=True, exist_ok=True)

        # Bước 1: bản nháp để lấy danh sách tiêu đề, sau đó dựng bản có mục lục đúng số dòng.
        _, draft_document = build(work / "draft.docx")
        headings = document_headings(draft_document)
        placeholder = [(level, text, "00") for level, text in headings]
        measure_path, _ = build(work / "measure.docx", placeholder)

        # Bước 2: xuất PDF để đọc số trang thật của từng tiêu đề.
        convert_to_pdf(measure_path, work / "measure.pdf")
        total, labels = printed_page_labels(work / "measure.pdf")

        # Bước 3: dựng bản chính thức với số trang thật (số dòng mục lục giữ nguyên nên bố cục không đổi).
        entries = [(level, text, labels.get(text, "??")) for level, text in headings]
        final_path, _ = build(DOC_PATH, entries)
        convert_to_pdf(final_path, work / "verify.pdf")
        total_final, labels_final = printed_page_labels(work / "verify.pdf")

        mismatch = [
            (text, labels.get(text), labels_final.get(text))
            for _, text in headings
            if labels.get(text) != labels_final.get(text)
        ]
        if mismatch:
            print("lệch số trang ở lần đo đầu, dựng lại lần hai:", mismatch[:5])
            entries = [(level, text, labels_final.get(text, "??")) for level, text in headings]
            final_path, _ = build(DOC_PATH, entries)
            convert_to_pdf(final_path, work / "verify2.pdf")
            total_final, labels_final = printed_page_labels(work / "verify2.pdf")

        print("da tao:", final_path.resolve())
        print("so tieu de:", len(headings), "| so trang:", total_final)
        print("so dong muc luc:", len(entries))
        print("so footnote:", len(FOOTNOTES))
        print("so bang:", len(Document(final_path).tables))

    main()
