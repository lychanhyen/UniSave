"""Kiểm tra bản báo cáo sau khi sửa: mục lục có số trang, gạch đầu dòng có chữ, phụ lục có cây thư mục."""

from docx import Document

document = Document("docs/BaoCao_UniSave.docx")

print("=== MỤC LỤC (20 dòng đầu)")
toc = [p for p in document.paragraphs if p.style.name == "TOC Entry"]
for paragraph in toc[:20]:
    print("  " + paragraph.text.replace("\t", " .......... "))
print(f"  ... tổng {len(toc)} dòng")

missing = [p.text for p in toc if p.text.rstrip().endswith("??")]
print("dòng thiếu số trang:", len(missing))

print("\n=== MỤC 1.2 (kiểm tra gạch đầu dòng)")
started = False
for paragraph in document.paragraphs:
    if paragraph.style.name == "TOC Entry":
        continue
    text = paragraph.text.strip()
    if text.startswith("1.2."):
        started = True
        print("  [" + text + "]")
        continue
    if started:
        if text.startswith("1.3."):
            break
        if text:
            print(f"   • ({paragraph.style.name}) {text[:80]}")

print("\n=== PHỤ LỤC A (cây thư mục)")
started = False
lines = 0
for paragraph in document.paragraphs:
    if paragraph.style.name == "TOC Entry":
        continue
    text = paragraph.text.strip()
    if text.startswith("PHỤ LỤC A"):
        started = True
        continue
    if started:
        if text.startswith("PHỤ LỤC B"):
            break
        if "tệp" in text or text.endswith("/"):
            lines += 1
            print("  " + text.replace("\t", "  |  "))
print("số dòng cây thư mục:", lines)

print("\n=== TỔNG HỢP")
print("số bảng:", len(document.tables))
print("số hình:", len(document.inline_shapes))
print("số đoạn:", len(document.paragraphs))
