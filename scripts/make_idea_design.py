"""Lắp ghép tài liệu Thiết kế ý tưởng: mục lục có số trang, danh mục bảng/hình, xuất bản Word."""

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

sys.path.insert(0, str(Path(__file__).resolve().parent))

import idea_docx_helpers as helpers
from idea_content_a import cau_1, cover, danh_muc_bang_hinh, danh_muc_viet_tat, loi_cam_on, muc_luc, phan_i
from idea_content_b import cau_2
from idea_content_c import cau_3, cau_4, phan_iii, phu_luc, references
from pdf_outline_pages import read_pdf_outline

OUT = Path("docs/ThietKeYTuong_v2.docx")
DOWNLOADS = Path("D:/Downloads")

NODE = (
    r"C:\Users\Admin\AppData\Local\Programs\DeepSeek Harness\resources\runtime"
    r"\primary-runtime\dependencies\node\bin\node.exe"
)
CLI = (
    r"C:\Users\Admin\AppData\Local\Programs\DeepSeek Harness\resources"
    r"\app.asar.unpacked\dsh\node_modules\@deepseek-ai\libreoffice-kit\lib\cli.js"
)


def add_page_numbers(document):
    footer = document.sections[0].footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.paragraph_format.first_line_indent = Cm(0)
    run = footer.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
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


def build(toc_entries=None):
    helpers.TABLE_INDEX = 0
    helpers.FIGURE_INDEX = 0
    helpers.TABLE_CAPTIONS.clear()
    helpers.FIGURE_CAPTIONS.clear()

    document = Document()
    helpers.setup(document)
    add_page_numbers(document)

    anchors = {}
    cover(document)
    loi_cam_on(document)
    muc_luc(document, anchors)
    danh_muc_viet_tat(document)
    danh_muc_bang_hinh(document, anchors)

    phan_i(document)
    cau_1(document)
    cau_2(document)
    cau_3(document)
    cau_4(document)
    phan_iii(document)
    references(document)
    phu_luc(document)

    # Mục lục: lấy toàn bộ tiêu đề cấp 1–3
    headings = []
    for paragraph in document.paragraphs:
        level = {"Heading 1": 1, "Heading 2": 2, "Heading 3": 3}.get(paragraph.style.name)
        if level and paragraph.text.strip():
            headings.append((level, paragraph.text.strip()))

    entries = toc_entries or [(level, text, "00") for level, text in headings]

    style = document.styles.add_style("TOC Line", 1)
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)
    style.paragraph_format.first_line_indent = Cm(0)
    style.paragraph_format.space_after = Pt(2)
    style.paragraph_format.line_spacing = 1.15
    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    style.paragraph_format.tab_stops.add_tab_stop(Cm(15.9), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)

    anchor = anchors["toc"]
    for level, text, page in entries:
        paragraph = document.add_paragraph(style=style)
        paragraph.paragraph_format.left_indent = Cm(0 if level == 1 else 0.5 * (level - 1))
        run = paragraph.add_run(text)
        helpers.set_run(run, size=12, bold=(level == 1))
        run = paragraph.add_run("\t" + str(page))
        helpers.set_run(run, size=12, bold=(level == 1))
        anchor._p.addprevious(paragraph._p)

    # Danh mục bảng và hình: lấy đúng danh sách chú thích đã tạo
    table_lines = list(helpers.TABLE_CAPTIONS)
    figure_lines = list(helpers.FIGURE_CAPTIONS)

    table_anchor = anchors["tables"]
    for line in table_lines:
        paragraph = document.add_paragraph(style=style)
        run = paragraph.add_run(line)
        helpers.set_run(run, size=11)
        table_anchor._p.addprevious(paragraph._p)

    figure_anchor = anchors["figures"]
    for line in figure_lines:
        paragraph = document.add_paragraph(style=style)
        run = paragraph.add_run(line)
        helpers.set_run(run, size=11)
        figure_anchor._p.addprevious(paragraph._p)

    return document, headings


def convert_to_pdf(docx_path, pdf_path):
    Path(pdf_path).unlink(missing_ok=True)
    result = subprocess.run(
        [NODE, CLI, "convert", "--input", str(docx_path), "--output", str(pdf_path)],
        capture_output=True,
        text=True,
        timeout=420,
    )
    if result.returncode != 0 or not Path(pdf_path).exists():
        raise RuntimeError((result.stderr or result.stdout)[:600])


def main():
    parser = argparse.ArgumentParser(description="Sinh báo cáo Thiết kế ý tưởng")
    parser.add_argument("--out", default=str(OUT), help="đường dẫn tệp docx đầu ra")
    parser.add_argument("--no-copy", action="store_true", help="không chép đè tệp trong Downloads")
    args = parser.parse_args()

    out_path = Path(args.out)
    OUT_LOCAL = out_path
    work = Path("docs/.build-" + out_path.stem)
    work.mkdir(parents=True, exist_ok=True)

    _, headings = build()
    placeholder = [(level, text, "00") for level, text in headings]
    measure_path = work / "measure.docx"
    document, _ = build(placeholder)
    document.save(measure_path)

    convert_to_pdf(measure_path, work / "measure.pdf")
    total, entries = read_pdf_outline(work / "measure.pdf")
    labels = {title: str(page) for title, page in entries}

    missing = [text for _, text in headings if text not in labels]
    if missing:
        print("không thấy số trang cho:", missing[:5])

    final_entries = [(level, text, labels.get(text, "??")) for level, text in headings]
    final_document, _ = build(final_entries)
    OUT_LOCAL.parent.mkdir(parents=True, exist_ok=True)
    final_document.save(OUT_LOCAL)

    convert_to_pdf(OUT_LOCAL, work / "verify.pdf")
    total_final, entries_final = read_pdf_outline(work / "verify.pdf")
    labels_final = {title: str(page) for title, page in entries_final}
    drift = [(text, labels.get(text), labels_final.get(text)) for _, text in headings if labels.get(text) != labels_final.get(text)]

    if drift:
        print("lệch số trang, dựng lại:", drift[:5])
        final_entries = [(level, text, labels_final.get(text, "??")) for level, text in headings]
        final_document, _ = build(final_entries)
        final_document.save(OUT_LOCAL)

    # Chép bản hoàn chỉnh về thư mục Downloads với đúng tên tệp gốc
    candidates = [
        name
        for name in os.listdir(DOWNLOADS)
        if name.startswith("Thi") and name.endswith(".docx") and "(" not in name
    ]
    target_name = candidates[0] if candidates else None
    if target_name and not args.no_copy:
        shutil.copyfile(OUT_LOCAL, DOWNLOADS / target_name)
        print("đã cập nhật tệp gốc:", DOWNLOADS / target_name)
    elif args.no_copy:
        print("bỏ qua bước chép vào Downloads (--no-copy)")

    print("đã tạo:", OUT_LOCAL.resolve())
    print("số trang:", total_final, "| số tiêu đề:", len(headings), "| bảng:", helpers.TABLE_INDEX, "| hình:", helpers.FIGURE_INDEX)


if __name__ == "__main__":
    main()
