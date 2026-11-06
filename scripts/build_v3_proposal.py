"""Tái lập toàn bộ bản ĐỀ XUẤT v3 từ bản v2.

Gồm:
- 8 chỉnh sửa đối chiếu 9 chương học (HMW, dữ kiện/giả định, Empathy Map, tên sản phẩm,
  ma trận quyết định, mức fidelity, actionable metric, BMC v0.1).
- 2 chỉnh sửa theo Google Form thật (Phụ lục A 5 câu + link; nhóm "ở cùng gia đình";
  số câu 10 -> 5; ngưỡng thời gian 1-2 phút).
- Phụ lục D đổi thành "Dữ liệu kiểm chứng hiện có" (phương án B): bảng tần suất khảo sát
  và bảng lỗi đã sửa, không có dòng dữ liệu bịa.

Cách dùng:
    python scripts/build_v3_proposal.py            # áp dụng
    python scripts/build_v3_proposal.py --revert    # trả các module về trạng thái git
"""

import subprocess
import sys
from pathlib import Path

SURVEY = Path("docs/assets/survey")

A = Path("scripts/idea_content_a.py")
B = Path("scripts/idea_content_b.py")
C = Path("scripts/idea_content_c.py")
MODULES = [A, B, C]


def patch(path, pairs, label):
    text = path.read_text(encoding="utf-8")
    ok = 0
    for old, new in pairs:
        if old not in text:
            print(f"  KHÔNG THẤY ({label}): {old[:55]!r}")
            continue
        text = text.replace(old, new, 1)
        ok += 1
    path.write_text(text, encoding="utf-8")
    print(f"{path.name}: {ok}/{len(pairs)} ({label})")


def replace_block(path, start_anchor, end_anchor, new_block, label):
    text = path.read_text(encoding="utf-8")
    start = text.find(start_anchor)
    end = text.find(end_anchor)
    if start < 0 or end < 0 or end <= start:
        print(f"  KHÔNG THẤY khối: {label}")
        return
    path.write_text(text[:start] + new_block + text[end:], encoding="utf-8")
    print(f"  đã thay khối: {label}")


def main():
    if "--revert" in sys.argv:
        subprocess.run(["git", "checkout", "--", *[str(m) for m in MODULES]], check=False)
        print("đã trả 3 module nội dung về trạng thái git")
        return

    # ------------------------------------------------------------------ A
    text = A.read_text(encoding="utf-8")

    # (1) tên sản phẩm: chèn trước bảng phân công của mục I.1
    marker = "I.1. Tên dự án và thông tin nhóm thực hiện"
    start = text.find(marker)
    table_pos = text.find("    TABLE(", start) if start >= 0 else -1
    if table_pos > 0:
        naming = '''    P(
        document,
        "Tên sản phẩm được đặt theo đúng quy trình đặt tên: dùng 5W1H xác định người dùng (sinh viên), giá trị cần tạo (tiết kiệm, "
        "quản lý tiền) và bối cảnh sử dụng (trong trường, trên điện thoại), sau đó ghép hai từ khoá Uni (university) và Save "
        "(tiết kiệm) thành UniSave. Nhóm loại các phương án dài, khó đọc hoặc trùng tên sản phẩm quen thuộc; UniSave được chọn vì "
        "đọc được bằng tiếng Việt, ngắn và gợi đúng giá trị. Bước thử tên với người ngoài nhóm sẽ thực hiện cùng phiên thử nghiệm ở "
        "mục 2.3.2, không phải kết quả đã có.",
    )

'''
        text = text[:table_pos] + naming + text[table_pos:]
        print("  đã chèn đoạn đặt tên sản phẩm")
    else:
        print("  KHÔNG THẤY mốc I.1")

    # (2)+(4) dữ kiện/giả định và Empathy Map; (5) HMW
    text = text.replace(
        '    H3(document, "1.3.2. Insight quan trọng")\n',
        '''    P(
        document,
        "Trong các phát hiện dưới đây, phần ghi kèm số liệu và trích dẫn là dữ kiện đã thu được; phần giải thích lý do là giả định của "
        "nhóm, cần kiểm chứng tiếp ở các vòng sau. Nhóm tách hai loại này ngay từ đầu để tránh biến suy đoán thành kết luận.",
    )

    H3(document, "1.3.2. Insight quan trọng")
    P(
        document,
        "Toàn bộ ghi chép quan sát và phỏng vấn được tổng hợp trước vào bản đồ thấu cảm bốn vùng Nói – Nghĩ – Làm – Cảm thấy (Phụ lục "
        "B), sau đó nhóm mới rút ra insight. Cách làm này giúp insight bám vào dữ liệu thay vì cảm nhận riêng của thành viên.",
    )
''',
        1,
    )

    text = text.replace(
        '''    LEAD(
        document,
        "“Những ngày cuối tháng, mình không dám mở ví, cũng không nhớ tiền đã đi đâu.”",
    )''',
        '''    LEAD(
        document,
        "“Những ngày cuối tháng, mình không dám mở ví, cũng không nhớ tiền đã đi đâu.”",
    )
    P(
        document,
        "Từ POV này, nhóm đặt câu hỏi cơ hội theo hướng mở: “Làm thế nào để sinh viên biết ngay hôm nay mình còn tiêu được bao nhiêu "
        "mà không phải ghi chép nhiều hơn ba thao tác?”. Câu hỏi cơ hội này là mốc chuyển từ giai đoạn xác định vấn đề (Define) sang "
        "giai đoạn tạo ý tưởng (Ideate) ở mục 2.1: mọi ý tưởng sau đó đều được kiểm tra xem có trả lời đúng câu hỏi này không.",
    )''',
        1,
    )

    # (9)+(10) 5 câu hỏi thật và nhóm "ở cùng gia đình"
    text = text.replace("biểu mẫu 10 câu trả lời trong khoảng 3 phút", "biểu mẫu 5 câu, chỉ mất 1–2 phút", 1)
    text = text.replace(
        '''            ["Không nêu mức thu nhập", "2/11 (18,2%)", "Dữ liệu còn thiếu: không dùng nhóm này để kết luận về thu nhập, chỉ ghi nhận để lần khảo sát sau bổ sung"],''',
        '''            ["Ở cùng gia đình (không thuê trọ)", "2/11 (18,2%)", "Nhóm ít chịu áp lực tiền trọ và bữa ăn nên hạn mức theo ngày ít cấp thiết hơn; với họ, phần tiết kiệm và mua lại giáo trình cũ có ý nghĩa hơn"],''',
        1,
    )
    A.write_text(text, encoding="utf-8")
    print("idea_content_a.py: đã áp dụng chỉnh sửa I.1 / 1.3.x / 1.4.1 / Bảng 4")

    # ------------------------------------------------------------------ B
    patch(
        B,
        [
            ('H3(document, "2.1.2. Ma trận lựa chọn giải pháp")', 'H3(document, "2.1.2. Ma trận quyết định lựa chọn giải pháp")'),
            (
                '"phải ảnh dựng lại bằng công cụ thiết kế.",',
                '"phải ảnh dựng lại bằng công cụ thiết kế. Nhóm đi từ wireframe mức thấp (Phụ lục C) đến bản chạy được mức cao như trong "\n'
                '        "mục này; mức độ hoàn thiện tăng dần qua từng vòng sửa, đúng cách làm prototype nhanh: dựng bản thô trước, chỉ làm "\n'
                '        "kỹ phần giúp kiểm tra giả thuyết.",',
            ),
            (
                '''        "Bảng dưới là các chỉ số nhóm dùng để biết bản mẫu có giải quyết được vấn đề hay không, kèm ngưỡng đặt ra "
        "trước khi thử. Cột cuối ghi trạng thái thật: chỉ số nào đã đo được bằng dữ liệu hiện có, chỉ số nào còn "
        "chờ phiên thử chính thức.",''',
                '''        "Các chỉ số dưới đây là chỉ số hành động (actionable metric): mỗi chỉ số gắn với một giả thuyết cụ thể và đủ để "
        "nhóm đổi cách làm nếu kết quả sai, khác với các con số chỉ để gây ấn tượng. Ngưỡng thành công được đặt trước "
        "khi thử để tránh diễn giải kết quả theo ý muốn. Cột cuối ghi trạng thái thật: chỉ số nào đã đo được bằng dữ "
        "liệu hiện có, chỉ số nào còn chờ phiên thử chính thức.",''',
            ),
            (
                '"Soạn biểu mẫu 10 câu (Phụ lục A) để hỏi đúng những chỗ bản mẫu chưa rõ, không hỏi chung chung.",',
                '"Soạn biểu mẫu 5 câu (Phụ lục A) để hỏi đúng những chỗ bản mẫu chưa rõ, không hỏi chung chung.",',
            ),
            (
                '"Đo thời gian trung bình hoàn thành biểu mẫu 10 câu", "≤ 3 phút", "Đã đạt: khoảng 3 phút"',
                '"Đo thời gian trung bình hoàn thành biểu mẫu 5 câu", "≤ 2 phút", "Đã đạt: khoảng 1–2 phút (theo mô tả biểu mẫu)"',
            ),
            (
                '"Dự kiến: sau 5 phiên chính thức, ghi kết quả vào bảng dữ liệu thô ở Phụ lục D rồi đối chiếu với ngưỡng ở mục 2.3.3.",',
                '"Dự kiến: sau 5 phiên chính thức, ghi kết quả vào bảng chỉ số ở mục 2.3.3 và bổ sung vào Phụ lục D.",',
            ),
        ],
        "ma trận quyết định + fidelity + actionable + số câu + Phụ lục D",
    )

    # ------------------------------------------------------------------ C
    text = C.read_text(encoding="utf-8")
    text = text.replace(
        'caption="Chín khối mô hình kinh doanh của UniSave",',
        'caption="Chín khối mô hình kinh doanh của UniSave (BMC v0.1 – tháng 11/2026)",',
        1,
    )
    C.write_text(text, encoding="utf-8")

    # Phụ lục A theo Google Form thật
    block_a = '''    H2(document, "Phụ lục A: Bảng câu hỏi khảo sát và biên bản trao đổi")
    P(
        document,
        "Biểu mẫu khảo sát được tạo bằng Google Form với tiêu đề “Khảo sát thấu cảm: Thói quen chi tiêu và nhu cầu "
        "tiết kiệm của sinh viên”, gồm 5 câu hỏi, thời gian trả lời khoảng 1–2 phút. Đường dẫn biểu mẫu: "
        "https://forms.gle/kaDc2qCbn44usZKo9. Nhóm thu được 11 phản hồi hợp lệ; kết quả câu 1 và câu 3 được dùng "
        "trực tiếp ở mục 1.3.1, kết quả câu 2 và câu 4 lưu trong phần tổng hợp của biểu mẫu.",
    )
    TABLE(
        document,
        [
            ["Câu", "Nội dung câu hỏi", "Phương án trả lời"],
            [
                "1",
                "Bạn hiện đang sống ở đâu và nguồn thu nhập/trợ cấp hàng tháng khoảng bao nhiêu?",
                "Dưới 2,5 triệu (KTX hoặc trọ xa nhà)\\nTừ 2,5–4 triệu (KTX hoặc trọ xa nhà)\\nTrên 4 triệu (KTX hoặc trọ xa nhà)\\nỞ cùng gia đình",
            ],
            [
                "2",
                "Bạn thường bắt đầu gặp tình trạng hụt tiền/cháy túi vào khoảng thời gian nào trong tháng?",
                "Từ ngày 1 đến ngày 10\\nTừ ngày 11 đến ngày 20\\nTừ ngày 21 đến cuối tháng\\nKhông bao giờ bị hụt tiền",
            ],
            [
                "3",
                "Những lý do nào khiến bạn khó tiết kiệm hoặc dễ bị thâm hụt tài chính?",
                "Chưa biết cách chia ngân sách theo ngày/tháng\\nChi phí ăn uống, đi chợ hằng ngày quá tốn kém\\nMua sắm bốc đồng do sale online (đã lưu thẻ/ví thanh toán)\\nNgại ghi chép thủ công vì phức tạp và hay quên\\nĐồ dùng/giáo trình mua mới đắt nhưng ít sử dụng",
            ],
            [
                "4",
                "Nếu có một nền tảng web hỗ trợ các tính năng sau, bạn quan tâm đến tính năng nào nhất?",
                "Tự động chia hạn mức chi tiêu cho từng ngày\\nTìm người gom đơn đi chợ sỉ chung khu KTX/trọ\\nPass hoặc cho thuê đồ dùng, sách cũ nội bộ sinh viên\\nTất cả các tính năng trên",
            ],
            [
                "5",
                "Hãy kể ngắn gọn về lần gần nhất bạn bị “hết tiền” trước cuối tháng, nguyên nhân chính là gì?",
                "Trả lời ngắn, không giới hạn phương án",
            ],
        ],
        [1.2, 6.4, 8.3],
        caption="Năm câu hỏi trong biểu mẫu khảo sát",
        source="Nguồn: biểu mẫu Google Form của nhóm, https://forms.gle/kaDc2qCbn44usZKo9 (thu tháng 11/2026)",
        size=10,
    )
    P(
        document,
        "Ghi chú về kết quả: câu 3 là câu chọn nhiều lý do nên tổng tỉ lệ lớn hơn 100%; câu 5 là câu trả lời mở, "
        "nhóm dùng để minh hoạ bối cảnh chứ không thống kê thành tỉ lệ.",
    )
    P(
        document,
        "Biên bản phỏng vấn: nhóm ghi theo mẫu bốn dòng cho mỗi phiên — (1) hoàn cảnh của người được hỏi, (2) câu "
        "nói đáng chú ý giữ nguyên văn, (3) khó khăn chính khi quản lý tiền, (4) điều họ muốn có nhất. Mỗi phiên "
        "khoảng 15 phút, ghi ngay sau khi kết thúc để không mất chi tiết; tên người tham gia được ẩn hoặc viết tắt "
        "khi đưa vào báo cáo.",
    )

    CAU_HOI = [
        ("phan-hoi-1.png", "Tổng hợp phản hồi câu 1: nơi ở và mức thu nhập hằng tháng"),
        ("phan-hoi-2.png", "Tổng hợp phản hồi câu 2: thời điểm bắt đầu hụt tiền trong tháng"),
        ("phan-hoi-3.png", "Tổng hợp phản hồi câu 3: lý do khó tiết kiệm hoặc dễ thâm hụt"),
        ("phan-hoi-4.png", "Tổng hợp phản hồi câu 4: tính năng người trả lời quan tâm nhất"),
        ("phan-hoi-5.png", "Tổng hợp phản hồi câu 5: câu trả lời mở về lần hết tiền gần nhất"),
    ]
    for file_name, caption in CAU_HOI:
        FIG(
            document,
            f"docs/assets/survey/{file_name}",
            caption,
            "Nguồn: tab Responses của biểu mẫu Google Form, chụp tháng 11/2026; biểu mẫu không thu thập email người trả lời",
            width=13.6,
        )

'''
    replace_block(C, '    H2(document, "Phụ lục A: Bảng câu hỏi khảo sát và biên bản trao đổi")',
                  '    H2(document, "Phụ lục B: Bản đồ thấu cảm")', block_a, "Phụ lục A")

    # Phụ lục D: phương án B – dữ liệu kiểm chứng hiện có
    block_d = '''    H2(document, "Phụ lục D: Dữ liệu kiểm chứng hiện có")
    P(
        document,
        "Nhóm chưa tổ chức phiên thử nghiệm chính thức với người ngoài nhóm, nên phụ lục này tập hợp hai nguồn dữ "
        "liệu thật đang có: kết quả khảo sát 11 sinh viên và danh sách lỗi phát hiện trong quá trình nhóm tự dùng "
        "thử rồi sửa. Không có dòng dữ liệu nào được điền thay hay làm tròn cho đẹp.",
    )

    H3(document, "D.1. Bảng tần suất kết quả khảo sát (n = 11)")
    P(
        document,
        "Bảng dưới giữ nguyên số người chọn từng phương án để đối chiếu với tỉ lệ ở mục 1.3.1. Biểu đồ đầy đủ nằm "
        "trong tab Responses của biểu mẫu (đường dẫn ở Phụ lục A).",
    )
    TABLE(
        document,
        [
            ["Câu hỏi", "Phương án", "Số người", "Tỉ lệ"],
            ["Câu 1 – thu nhập và nơi ở", "Dưới 2,5 triệu/tháng", "4", "36,4%"],
            ["", "Từ 2,5 – 4 triệu/tháng", "2", "18,2%"],
            ["", "Trên 4 triệu/tháng", "3", "27,3%"],
            ["", "Ở cùng gia đình", "2", "18,2%"],
            ["Câu 3 – lý do khó tiết kiệm (chọn nhiều)", "Mua sắm bốc đồng do sale online", "4", "36,4%"],
            ["", "Chưa biết chia ngân sách theo ngày", "3", "27,3%"],
            ["", "Chi phí ăn uống, đi chợ tốn kém", "3", "27,3%"],
            ["", "Đồ dùng, giáo trình mua mới đắt", "2", "18,2%"],
            ["", "Ngại ghi chép thủ công", "1", "9,1%"],
            ["", "Tổng số lượt chọn ở câu 3", "13", "—"],
        ],
        [4.4, 7.2, 2.0, 2.3],
        caption="Tần suất trả lời của 11 phản hồi khảo sát",
        source="Nguồn: 11 phản hồi Google Form của nhóm (tháng 11/2026)",
        size=10,
    )

    H3(document, "D.2. Lỗi phát hiện khi tự dùng thử và đã sửa")
    P(
        document,
        "Trong lúc dựng và tự chạy thử bản MVP, nhóm ghi lại các lỗi chặn luồng và sửa ngay; bảng dưới là những lỗi "
        "đã xử lý xong, không phải danh sách dự định.",
    )
    TABLE(
        document,
        [
            ["Lỗi gặp phải", "Hiện tượng thực tế", "Cách sửa", "Trạng thái"],
            [
                "Ô nhập số tiền chặn số lớn",
                "Gõ 275.000 đồng hoặc 11.800 đồng phí ship thì bị từ chối; thông báo lỗi khó hiểu",
                "Bỏ giới hạn ký tự, lưu số nguyên và định dạng hiển thị riêng",
                "Đã sửa",
            ],
            [
                "Thẻ kèo gom đơn che mất số tiền phải chuyển",
                "Mô tả bị cắt còn hai dòng, muốn xem bảng chia tiền phải bấm thêm",
                "Tách trang chi tiết kèo: mở ra thấy ngay bảng chia tiền từng người",
                "Đã sửa",
            ],
            [
                "Tài khoản chưa xác minh vẫn bình luận được",
                "Người chưa xác minh sinh viên gửi được bình luận, thông báo lỗi hiện ra chung chung",
                "Chặn quyền bình luận và viết lại thông báo nêu rõ lý do",
                "Đã sửa",
            ],
            [
                "Khối giới thiệu trang chợ khó đọc",
                "Chữ xám trên nền tối, xem ngoài trời gần như không đọc được",
                "Đổi bố cục khối giới thiệu, tăng tương phản chữ",
                "Đã sửa",
            ],
        ],
        [4.0, 5.4, 4.4, 2.1],
        caption="Các lỗi đã sửa trong quá trình tự dùng thử bản MVP",
        source="Nguồn: nhóm thực hiện, đối chiếu với lịch sử sửa trong mã nguồn",
        size=9.5,
    )
    NOTE(
        document,
        "Phụ lục này không thay thế phiên thử với người dùng ngoài nhóm. Các chỉ số ở mục 2.3.3 vẫn để trống ở "
        "những dòng chờ phiên thử chính thức; nhóm ghi rõ giới hạn này thay vì điền số ước đoán.",
    )

'''
    replace_block(C, '    H2(document, "Phụ lục D: Bảng dữ liệu thô kết quả thử nghiệm MVP")',
                  '    H2(document, "Phụ lục E: Hình ảnh hoạt động nhóm")', block_d, "Phụ lục D")

    # Roadmap: không hứa ghi dữ liệu thô vào D nữa
    text = C.read_text(encoding="utf-8")
    text = text.replace(
        '"Chạy thử với 5 sinh viên, ghi dữ liệu thô vào Phụ lục D, sửa các lỗi chặn luồng"',
        '"Chạy thử với 5 sinh viên, ghi kết quả vào mục 2.3.3 và cập nhật Phụ lục D, sửa các lỗi chặn luồng"',
        1,
    )
    C.write_text(text, encoding="utf-8")
    print("idea_content_c.py: đã cập nhật Phụ lục A, Phụ lục D, BMC và roadmap")
    # Ảnh chụp từ bản chạy thật và link deploy
    bt = B.read_text(encoding="utf-8")
    old_src = '"Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)"'
    new_src = '"Nguồn: ảnh chụp trực tiếp từ bản chạy thật https://unisave-theta.vercel.app với dữ liệu người dùng thật (tháng 11/2026)"'
    so_lan = bt.count(old_src)
    bt = bt.replace(old_src, new_src)
    bt = bt.replace(
        '"kỹ phần giúp kiểm tra giả thuyết.",',
        '"kỹ phần giúp kiểm tra giả thuyết. Bản chạy thật đặt tại https://unisave-theta.vercel.app và đang có dữ liệu của "\n'
        '        "người dùng thật, không phải dữ liệu mẫu.",',
        1,
    )
    B.write_text(bt, encoding="utf-8")
    print(f"nguồn ảnh thật: {so_lan} chú thích")

    ct = C.read_text(encoding="utf-8")
    ct = ct.replace(
        '"tương tác: [dán link Figma hoặc link bản chạy thử tại đây].",',
        '"tương tác: bản chạy thật đặt tại https://unisave-theta.vercel.app; nhóm dùng tài khoản thử để xem dữ liệu thật "\n'
        '        "khi chấm. Bản vẽ wireframe ở hình bên dưới.",',
        1,
    )
    C.write_text(ct, encoding="utf-8")
    print("đã cập nhật link bản chạy thật ở Phụ lục C")

    # Ảnh hoạt động nhóm ở Phụ lục E
    patch(
        C,
        [
            (
                '    P(\n'
                '        document,\n'
                '        "Phần này dành cho ảnh chụp các buổi làm việc nhóm, ảnh phỏng vấn sinh viên và ảnh phiên thử nghiệm. "\n'
                '        "Nhóm dán ảnh kèm chú thích ngày, địa điểm và người tham gia. Nếu không có ảnh, ghi rõ lý do thay vì "\n'
                '        "bỏ trống mục này.",\n'
                '    )\n',
                '    P(\n'
                '        document,\n'
                '        "Ảnh dưới đây ghi lại buổi làm việc nhóm tại Trường Đại học Đông Á, có mặt toàn bộ thành viên trong nhóm. "\n'
                '        "Nhóm dùng buổi này để chốt lại vấn đề, phân công nhiệm vụ và rà soát các đầu việc còn thiếu trước khi nộp.",\n'
                '    )\n'
                '    FIG(\n'
                '        document,\n'
                '        "docs/assets/nhom/anh-lam-nhom.jpg",\n'
                '        "Buổi làm việc nhóm tại Trường Đại học Đông Á, thứ Sáu ngày 6/11/2026; thành viên tham gia: toàn bộ nhóm",\n'
                '        "Nguồn: ảnh chụp của nhóm",\n'
                '        width=15.0,\n'
                '    )\n',
            ),
        ],
        "ảnh nhóm Phụ lục E",
    )

    print("hoàn tất áp dụng chỉnh sửa cho v3")


if __name__ == "__main__":
    main()
