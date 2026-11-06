"""Kiểm tra tài liệu Thiết kế ý tưởng sau khi sinh."""

from docx import Document

path = "docs/ThietKeYTuong_v2.docx"
document = Document(path)

print("=== TỔNG QUAN")
print("số đoạn:", len(document.paragraphs))
print("số bảng:", len(document.tables))
print("số hình nhúng:", len(document.inline_shapes))
section = document.sections[0]
print("khổ giấy:", round(section.page_width.cm, 1), "x", round(section.page_height.cm, 1), "| lề:", round(section.left_margin.cm, 2), "cm")

print("\n=== MỤC LỤC (12 dòng đầu)")
toc = [p for p in document.paragraphs if p.style.name == "TOC Line" and p.text.strip()]
shown = 0
for paragraph in toc:
    text = paragraph.text.strip()
    if text.startswith(("Bảng ", "Hình ")):
        continue
    if shown < 12:
        print("  " + text.replace("\t", " ..... "))
        shown += 1
print("tổng dòng mục lục:", len([p for p in toc if not p.text.strip().startswith(("Bảng ", "Hình "))]))

missing = [p.text for p in toc if p.text.strip().endswith("??")]
print("dòng thiếu số trang:", len(missing))

print("\n=== DANH MỤC BẢNG / HÌNH")
tables_listed = [p.text for p in toc if p.text.strip().startswith("Bảng ")]
figures_listed = [p.text for p in toc if p.text.strip().startswith("Hình ")]
print("bảng liệt kê:", len(tables_listed), "| hình liệt kê:", len(figures_listed))

print("\n=== KIỂM TRA NỘI DUNG BẮT BUỘC")
full_text = "\n".join(p.text for p in document.paragraphs)
checks = {
    "5W1H (bảng 5 vấn đề)": "Bảng 3:" in full_text or "Năm vấn đề" in full_text,
    "Insight": "Insight thứ nhất" in full_text,
    "POV": "Tuyên bố POV" in full_text,
    "Persona": "Chân dung người dùng" in full_text,
    "UVP liền mạch": "Giá trị đề xuất độc đáo" in full_text,
    "TAM-SAM-SOM": "TAM – SAM – SOM" in full_text,
    "TOWS hành động": "Chiến lược TOWS" in full_text,
    "3 giả thuyết rủi ro": "Ba giả thuyết rủi ro" in full_text,
    "Q&A A-A-E-N": "Acknowledge" in full_text and "Next Step" in full_text,
    "Minh chứng trước/sau": "TRƯỚC khi sửa" in full_text and "SAU khi sửa" in full_text,
    "Kịch bản test 5 người": "5 sinh viên" in full_text,
    "Phụ lục D": "dữ liệu thô" in full_text,
}
for name, passed in checks.items():
    print(("  OK   " if passed else "  THIẾU ") + name)

print("\n=== ĐOẠN UVP (kiểm tra viết liền mạch)")
for index, paragraph in enumerate(document.paragraphs):
    if paragraph.text.strip().startswith("Vấn đề của sinh viên không phải là thiếu ứng dụng"):
        print("  số từ:", len(paragraph.text.split()), "| số câu:", paragraph.text.count("."), "| kiểu:", paragraph.style.name)
        break
