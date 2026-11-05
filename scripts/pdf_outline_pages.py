"""Đọc bookmark của PDF (do LibreOffice xuất) để biết mỗi tiêu đề nằm ở trang nào."""

import re
from pathlib import Path


def _read_objects(data):
    start = int(data[data.rfind(b"startxref") + 9 :].split()[0])
    if data[start : start + 4] != b"xref":
        raise RuntimeError("PDF không dùng bảng xref cổ điển")
    offsets = {}
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
                raise RuntimeError("mục xref hỏng")
            if entry.group(3) == b"n":
                offsets[first + index] = int(entry.group(1))
            position += entry.end()
    return offsets, position


def _slice(data, offsets, number):
    return data[offsets[number] : data.find(b"endobj", offsets[number])]


def _collect_pages(data, offsets, number):
    body = _slice(data, offsets, number)
    kids = re.search(rb"/Kids\s*\[(.*?)\]", body, re.S)
    pages = []
    for reference in re.finditer(rb"(\d+)\s+0\s+R", kids.group(1)):
        child = int(reference.group(1))
        if b"/Kids" in _slice(data, offsets, child):
            pages.extend(_collect_pages(data, offsets, child))
        else:
            pages.append(child)
    return pages


def _decode_title(raw):
    if raw.startswith(b"<"):
        hex_text = raw[1:-1].decode("ascii", "ignore")
        try:
            text = bytes.fromhex(hex_text).decode("utf-16-be")
        except ValueError:
            return ""
        return text.lstrip("\ufeff")
    text = raw[1:-1]
    text = text.replace(b"\\(", b"(").replace(b"\\)", b")").replace(b"\\\\", b"\\")
    try:
        return text.decode("utf-8")
    except UnicodeDecodeError:
        return text.decode("cp1252", "ignore")


def _walk(data, offsets, number, pages, out, guard):
    if guard[0] > 800:
        return
    guard[0] += 1
    body = _slice(data, offsets, number)
    title_match = re.search(rb"/Title\s*(\((?:[^()\\]|\\.)*\)|<[0-9A-Fa-f\s]*>)", body, re.S)
    if title_match:
        title = _decode_title(title_match.group(1)).strip()
        destination = re.search(rb"/Dest\s*\[\s*(\d+)\s+0\s+R", body) or re.search(
            rb"/D\s*\[\s*(\d+)\s+0\s+R", body
        )
        if destination:
            page_object = int(destination.group(1))
            if page_object in pages:
                out.append((title, pages.index(page_object) + 1))
    first = re.search(rb"/First\s+(\d+)\s+0\s+R", body)
    if first:
        _walk(data, offsets, int(first.group(1)), pages, out, guard)
    following = re.search(rb"/Next\s+(\d+)\s+0\s+R", body)
    if following:
        _walk(data, offsets, int(following.group(1)), pages, out, guard)


def read_pdf_outline(pdf_path):
    """Trả về (tổng số trang, [(tiêu đề, chỉ số trang PDF)])."""
    data = Path(pdf_path).read_bytes()
    offsets, trailer_start = _read_objects(data)
    trailer = data[trailer_start : data.find(b"%%EOF", trailer_start)]
    root = int(re.search(rb"/Root\s+(\d+)\s+0\s+R", trailer).group(1))
    catalog = _slice(data, offsets, root)
    pages = _collect_pages(data, offsets, int(re.search(rb"/Pages\s+(\d+)\s+0\s+R", catalog).group(1)))
    entries = []
    outline = re.search(rb"/Outlines\s+(\d+)\s+0\s+R", catalog)
    if outline:
        _walk(data, offsets, int(outline.group(1)), pages, entries, [0])
    return len(pages), entries


def printed_page_labels(pdf_path):
    """Đổi chỉ số trang PDF sang số trang in: bìa = i (ẩn), phần thân bắt đầu lại từ 1."""
    total, entries = read_pdf_outline(pdf_path)
    body_start = next((page for title, page in entries if title.upper().startswith("CHƯƠNG 1")), None)
    if body_start is None:
        raise RuntimeError("không thấy bookmark CHƯƠNG 1")
    labels = {}
    for title, page in entries:
        number = page - body_start + 1
        labels[title] = str(number) if number >= 1 else f"pdf{page}"
    return total, labels
