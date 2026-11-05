"""Đọc bookmark trong PDF do LibreOffice xuất ra để biết mỗi tiêu đề nằm ở trang nào.

PDF của LibreOffice dùng bảng xref cổ điển (không nén), nên chỉ cần đọc cấu trúc đối tượng
là lấy được cặp (tên tiêu đề, chỉ số trang) mà không cần thư viện ngoài.
"""

import json
import re
import sys

from pathlib import Path


def read_objects(data):
    """Trả về dict {số hiệu đối tượng: nội dung thô}."""
    start = int(data[data.rfind(b"startxref") + 9 :].split()[0])
    objects = {}
    if data[start : start + 4] != b"xref":
        raise SystemExit("PDF không dùng bảng xref cổ điển")
    position = start + 4
    while True:
        while data[position : position + 1] in b"\r\n ":
            position += 1
        if data[position : position + 7] == b"trailer":
            break
        header = re.match(rb"(\d+)\s+(\d+)", data[position:])
        first, count = int(header.group(1)), int(header.group(2))
        position += header.end()
        for index in range(count):
            while data[position : position + 1] in b"\r\n ":
                position += 1
            entry = re.match(rb"(\d{10})\s(\d{5})\s([nf])", data[position:])
            if not entry:
                raise SystemExit(f"mục xref hỏng tại vị trí {position}")
            if entry.group(3) == b"n":
                objects[first + index] = int(entry.group(1))
            position += entry.end()
    return objects, position


def slice_object(data, offset):
    end = data.find(b"endobj", offset)
    return data[offset:end]


def find_pages(data, objects, number):
    """Duyệt cây /Pages để lấy danh sách số hiệu đối tượng trang theo thứ tự."""
    body = slice_object(data, objects[number])
    kids = re.search(rb"/Kids\s*\[(.*?)\]", body, re.S)
    pages = []
    for reference in re.finditer(rb"(\d+)\s+0\s+R", kids.group(1)):
        child = int(reference.group(1))
        child_body = slice_object(data, objects[child])
        if b"/Type/Pages" in child_body.replace(b" ", b"") and b"/Kids" in child_body:
            pages.extend(find_pages(data, objects, child))
        else:
            pages.append(child)
    return pages


def decode_title(raw):
    if raw.startswith(b"<"):
        hex_text = raw[1:-1].decode("ascii", "ignore")
        try:
            value = bytes.fromhex(hex_text).decode("utf-16-be")
        except ValueError:
            return ""
        return value
    text = raw[1:-1]
    text = text.replace(b"\\(", b"(").replace(b"\\)", b")").replace(b"\\\\", b"\\")
    try:
        return text.decode("utf-8")
    except UnicodeDecodeError:
        return text.decode("cp1252", "ignore")


def walk_outline(data, objects, number, pages, result, stack=None):
    stack = stack or {"guard": 0}
    body = slice_object(data, objects[number])
    title_match = re.search(rb"/Title\s*(\((?:[^()\\]|\\.)*\)|<[0-9A-Fa-f\s]*>)", body, re.S)
    if title_match:
        title = decode_title(title_match.group(1))
        destination = re.search(rb"/Dest\s*\[\s*(\d+)\s+0\s+R", body)
        if not destination:
            action = re.search(rb"/D\s*\[\s*(\d+)\s+0\s+R", body)
            destination = action
        if destination:
            page_object = int(destination.group(1))
            page_index = pages.index(page_object) + 1 if page_object in pages else None
        else:
            page_index = None
        if title and page_index:
            result.append((title, page_index))

    first = re.search(rb"/First\s+(\d+)\s+0\s+R", body)
    stack["guard"] += 1
    if first and stack["guard"] < 500:
        walk_outline(data, objects, int(first.group(1)), pages, result, stack)
    next_item = re.search(rb"/Next\s+(\d+)\s+0\s+R", body)
    stack["guard"] += 1
    if next_item and stack["guard"] < 500:
        walk_outline(data, objects, int(next_item.group(1)), pages, result, stack)


def main():
    pdf_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    data = pdf_path.read_bytes()

    objects, trailer_start = read_objects(data)
    trailer = data[trailer_start : data.find(b"%%EOF", trailer_start)]
    root = int(re.search(rb"/Root\s+(\d+)\s+0\s+R", trailer).group(1))
    catalog = slice_object(data, objects[root])
    pages_root = int(re.search(rb"/Pages\s+(\d+)\s+0\s+R", catalog).group(1))
    pages = find_pages(data, objects, pages_root)

    outline_match = re.search(rb"/Outlines\s+(\d+)\s+0\s+R", catalog)
    entries = []
    if outline_match:
        walk_outline(data, objects, int(outline_match.group(1)), pages, entries)

    print(f"tổng số trang PDF: {len(pages)}")
    print(f"số bookmark: {len(entries)}")

    body_start = None
    for title, page in entries:
        if title.strip().upper().startswith("CHƯƠNG 1"):
            body_start = page
            break
    if body_start is None:
        raise SystemExit("không tìm thấy bookmark 'CHƯƠNG 1'")

    print(f"trang in bắt đầu ở trang PDF số: {body_start}")

    table = {}
    for title, page in entries:
        printable = page - body_start + 1
        label = str(printable) if printable >= 1 else f"pdf{page}"
        table[title.strip()] = label
        print(f"  {label:>3} | {title}")

    if output_path:
        output_path.write_text(json.dumps(table, ensure_ascii=False, indent=2), encoding="utf-8")
        print("đã ghi:", output_path)


if __name__ == "__main__":
    main()
