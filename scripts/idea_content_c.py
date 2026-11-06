"""Nội dung CÂU 3, CÂU 4, kết luận, tài liệu tham khảo và phụ lục."""

from docx.shared import Cm, Pt

from idea_docx_helpers import FIG, H1, H2, H3, IDEA, LEAD, NOTE, P, TABLE, B


def cau_3(document):
    H1(document, "CÂU 3: THỊ TRƯỜNG – CẠNH TRANH – SWOT/TOWS – MÔ HÌNH KINH DOANH (2,5 ĐIỂM)")

    H2(document, "3.1. Ước lượng quy mô thị trường (TAM – SAM – SOM)")
    P(
        document,
        "Nhóm ước lượng theo hướng từ dưới lên: lấy số sinh viên nhân với mức chi tiêu bình quân mỗi tháng để "
        "ra giá trị dòng tiền mà một công cụ quản lý tài chính có thể tiếp cận. Cách làm này cho một con số lớn "
        "hơn doanh thu thực tế, vì thị trường ở đây là tổng số tiền được quản lý chứ không phải số tiền ứng "
        "dụng thu về.",
    )
    TABLE(
        document,
        [
            ["Lớp thị trường", "Cách tính", "Kết quả ước tính", "Nguồn và mức độ chắc chắn"],
            [
                "TAM – toàn bộ sinh viên Việt Nam",
                "≈ 2,1 triệu sinh viên × 3,5 triệu đồng/tháng × 12 tháng",
                "≈ 88.200 tỉ đồng dòng tiền mỗi năm",
                "Số sinh viên lấy theo số liệu công bố của Bộ GD&ĐT (làm tròn); mức chi tiêu là ước tính của nhóm",
            ],
            [
                "SAM – sinh viên tại TP. Đà Nẵng và các tỉnh lân cận",
                "≈ 110 nghìn sinh viên × 3,5 triệu × 12",
                "≈ 4.620 tỉ đồng mỗi năm",
                "Số sinh viên là ước tính theo số trường đại học, cao đẳng trên địa bàn Đà Nẵng và miền Trung; cần kiểm chứng lại",
            ],
            [
                "SOM – sinh viên Trường ĐH Đông Á trong năm đầu",
                "≈ 12.000 sinh viên × 8% tham gia × 3,5 triệu × 12",
                "≈ 1.000 người dùng, ≈ 42 tỉ đồng dòng tiền",
                "Quy mô trường là ước tính; tỉ lệ 8% là mục tiêu nội bộ của nhóm",
            ],
        ],
        [4.0, 4.6, 3.4, 3.9],
        caption="Ước lượng TAM – SAM – SOM và nguồn số liệu",
        source="Nguồn: nhóm tự ước lượng dựa trên số liệu công khai về quy mô sinh viên; các con số mang tính ước tính, không phải số liệu kiểm toán",
        size=10,
    )
    NOTE(
        document,
        "Ghi chú về độ tin cậy: con số 2,1 triệu sinh viên là số liệu công bố đã được làm tròn; mức chi tiêu "
        "3,5 triệu đồng/tháng và tỉ lệ 8% là giả định của nhóm, chưa khảo sát đủ mẫu. Khi có báo cáo chính thức "
        "của trường hoặc của Bộ GD&ĐT, thay số và giữ nguyên cách tính để bảng vẫn kiểm chứng được.",
    )

    H2(document, "3.2. Phân tích cạnh tranh và chiến lược định vị")
    H3(document, "3.2.1. Đối thủ và giải pháp thay thế")
    TABLE(
        document,
        [
            ["Sản phẩm / cách làm hiện tại", "Quản lý chi tiêu theo ngày", "Chợ nội bộ trường", "Gom đơn chia tiền", "Xác minh sinh viên", "Chi phí"],
            ["Money Lover", "Có", "Không", "Không", "Không", "Miễn phí có giới hạn"],
            ["Sổ thu chi MISA", "Có", "Không", "Không", "Không", "Miễn phí có quảng cáo"],
            ["Nhóm Facebook của trường", "Không", "Có", "Có nhưng tính tay", "Không", "Miễn phí"],
            ["Shopee / TikTok Shop", "Không", "Không", "Không", "Không", "Miễn phí, đẩy mua sắm"],
            ["Sổ tay hoặc ghi chú điện thoại", "Có nhưng không tính toán", "Không", "Không", "Không", "Miễn phí"],
            ["UniSave", "Có", "Có", "Có", "Có", "Miễn phí"],
        ],
        [4.0, 2.6, 2.4, 2.5, 2.2, 2.2],
        caption="So sánh UniSave với các lựa chọn hiện có",
        source="Nguồn: nhóm khảo sát tính năng công khai của từng sản phẩm (tháng 10/2026)",
        size=9.5,
    )
    P(
        document,
        "Điểm khác biệt không nằm ở việc quản lý chi tiêu — nhiều ứng dụng đã làm tốt và miễn phí. Điểm khác "
        "biệt là lớp cộng đồng: chỉ UniSave gắn việc ghi chi tiêu với chợ đồ cũ trong cùng trường và kèo gom "
        "đơn có chia tiền tự động, đồng thời xác minh người dùng là sinh viên thật.",
    )

    H3(document, "3.2.2. Bản đồ định vị và tuyên bố định vị")
    FIG(
        document,
        IDEA / "ban-do-dinh-vi.png",
        "Bản đồ định vị UniSave so với các lựa chọn hiện có",
        "Nguồn: nhóm thực hiện, vị trí trên bản đồ là đánh giá chủ quan dựa trên so sánh tính năng ở Bảng trên",
        width=13.5,
    )
    LEAD(
        document,
        "Với sinh viên sống xa nhà, UniSave là công cụ quản lý tiền duy nhất vừa cho biết hôm nay còn tiêu được "
        "bao nhiêu, vừa giúp tiết kiệm bằng cách gom đơn và mua lại đồ cũ trong chính trường của mình.",
    )

    H2(document, "3.3. Ma trận SWOT và hệ chiến lược TOWS")
    H3(document, "3.3.1. Các yếu tố nội bộ và môi trường")
    TABLE(
        document,
        [
            ["Điểm mạnh (S)", "Điểm yếu (W)"],
            [
                "S1. Giải đúng nỗi lo hằng ngày, dùng được ngay sau khi đăng nhập\n"
                "S2. Có lớp cộng đồng nên người dùng quay lại thường xuyên\n"
                "S3. Xác minh sinh viên thật, giảm rủi ro lừa đảo\n"
                "S4. Chi phí vận hành thấp, chạy trên nền tảng đám mây có sẵn",
                "W1. Nhóm nhỏ, không có nguồn lực phát triển dài hạn\n"
                "W2. Dữ liệu do người dùng tự nhập nên dễ sai và dễ bỏ\n"
                "W3. Chưa có doanh thu, chưa có kế hoạch tài chính rõ ràng\n"
                "W4. Chưa có phiên bản ứng dụng di động riêng",
            ],
            ["Cơ hội (O)", "Thách thức (T)"],
            [
                "O1. Sinh viên có nhu cầu tiết kiệm cao, chi tiêu ngày càng đắt\n"
                "O2. Trường và KTX có nhu cầu số hoá hoạt động mua bán nội bộ\n"
                "O3. Các nhà cung cấp địa phương quanh trường cần kênh bán nhóm\n"
                "O4. Chi phí dùng hạ tầng đám mây ngày càng thấp",
                "T1. Ứng dụng tài chính miễn phí đã có nhiều và mạnh\n"
                "T2. Sinh viên dễ bỏ ứng dụng sau vài tuần\n"
                "T3. Rủi ro lừa đảo trong mua bán đồ cũ ảnh hưởng uy tín nền tảng\n"
                "T4. Quy định về dữ liệu cá nhân ngày càng chặt",
            ],
        ],
        [7.95, 7.95],
        caption="Phân tích SWOT của dự án",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )

    H3(document, "3.3.2. Chiến lược TOWS và hành động cụ thể")
    P(
        document,
        "Mỗi chiến lược dưới đây gắn với việc làm cụ thể, có thời hạn và có chỉ số kiểm tra, thay vì chỉ nêu "
        "phương hướng chung.",
    )
    TABLE(
        document,
        [
            ["Chiến lược", "Hành động cụ thể (làm gì, khi nào)", "Chỉ số kiểm tra"],
            [
                "SO: Dùng cộng đồng để giữ chân người dùng",
                "Mỗi tuần đẩy một kèo gom đơn gợi ý theo trường; hiển thị kèo sắp hết hạn ngay màn hình đầu tiên. Làm trong tháng đầu.",
                "≥ 30% người dùng mở ứng dụng 3 ngày/tuần",
            ],
            [
                "WO: Khi ít vốn và người dùng ham rẻ, tập trung vào gom đơn",
                "Không xây ứng dụng di động riêng ở giai đoạn đầu; dùng bản web chạy trên điện thoại. Ưu tiên phát triển phần chia tiền và xác nhận thanh toán vì đây là phần tạo giá trị rõ nhất.",
                "≥ 50% kèo đủ người trong 7 ngày",
            ],
            [
                "ST: Chống thách thức từ ứng dụng tài chính lớn",
                "Không cạnh tranh ở báo cáo tài chính chuyên sâu. Nhấn vào điều ứng dụng lớn không có: xác minh sinh viên, chợ nội bộ trường, gom đơn cùng bạn học. Đưa bằng chứng này lên trang giới thiệu.",
                "≥ 40% người mới đăng ký nêu lý do \"mua bán trong trường\"",
            ],
            [
                "WT: Giảm rủi ro bị bỏ và rủi ro lừa đảo",
                "Nhắc ghi chi tiêu một lần mỗi tối bằng thông báo ngắn; bắt buộc xác minh sinh viên trước khi đăng tin; cho phép tố cáo kèo và tin đăng, admin phản hồi trong 24 giờ.",
                "≥ 60% người dùng còn hoạt động sau 4 tuần; 100% báo cáo được xử lý trong 24 giờ",
            ],
        ],
        [4.2, 7.9, 3.8],
        caption="Bốn chiến lược TOWS kèm hành động và chỉ số kiểm tra",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )

    H2(document, "3.4. Mô hình kinh doanh (BMC) và các giả thuyết rủi ro")
    H3(document, "3.4.1. Chín khối mô hình kinh doanh")
    TABLE(
        document,
        [
            ["Khối", "Nội dung của UniSave"],
            ["Phân khúc khách hàng", "Sinh viên ở trọ/KTX tại TP. Đà Nẵng, ưu tiên sinh viên Trường ĐH Đông Á; nhà cung cấp nhỏ quanh trường (quán ăn, tạp hoá, photocopy)"],
            ["Giá trị đề xuất", "Biết ngay hôm nay còn tiêu được bao nhiêu; giảm chi phí nhờ gom đơn; mua bán đồ cũ an toàn trong trường"],
            ["Kênh tiếp cận", "Nhóm lớp, nhóm KTX, câu lạc bộ của Trường ĐH Đông Á, trang giới thiệu công khai có đánh giá của người dùng"],
            ["Quan hệ khách hàng", "Tự phục vụ, hỗ trợ qua trang đánh giá công khai và báo cáo; admin duyệt hồ sơ sinh viên"],
            ["Dòng tiền", "Miễn phí cho sinh viên; thu từ quảng cáo của nhà cung cấp quanh trường và phí giới thiệu đơn gom (giả thuyết, chưa triển khai)"],
            ["Nguồn lực chính", "Bốn phân hệ đã chạy được; dữ liệu món ăn và giá tham khảo; cộng đồng sinh viên đã xác minh"],
            ["Hoạt động chính", "Duyệt hồ sơ sinh viên, kiểm duyệt tin đăng và kèo, cập nhật giá nguyên liệu, xử lý báo cáo"],
            ["Đối tác chính", "Nhà cung cấp thực phẩm quanh trường, quán ăn, hiệu sách cũ, ban quản lý KTX"],
            ["Cơ cấu chi phí", "Hạ tầng đám mây, tên miền, thời gian của nhóm; gần như không có chi phí cố định lớn"],
        ],
        [3.6, 12.3],
        caption="Chín khối mô hình kinh doanh của UniSave",
        source="Nguồn: nhóm thực hiện; các dòng tiền là giả thuyết cần kiểm chứng",
        size=10,
    )

    H3(document, "3.4.2. Tính logic liên kết giữa các khối")
    P(
        document,
        "Toàn bộ mô hình dựa trên một vòng lặp: sinh viên vào vì muốn biết tiền còn bao nhiêu, ở lại vì có kèo "
        "gom đơn và đồ cũ trong trường, càng ở lại thì dữ liệu càng đủ để nhắc đúng lúc và gợi ý đúng món. "
        "Nhà cung cấp quanh trường vào sau, khi đã có đủ người dùng trong một khu vực, nên chi phí tiếp cận của "
        "họ thấp hơn quảng cáo ngoài. Vì vậy nguồn thu hợp lý nhất không phải là thu phí sinh viên — điều sẽ "
        "phá vỡ chính lý do họ dùng ứng dụng — mà là phí giới thiệu đơn hàng cho nhà cung cấp địa phương.",
    )

    H3(document, "3.4.3. Ba giả thuyết rủi ro cao nhất của mô hình")
    TABLE(
        document,
        [
            ["Giả thuyết", "Dấu hiệu nếu sai", "Cách thử", "Quyết định"],
            [
                "Sinh viên chịu nhập chi tiêu hằng ngày",
                "Sau 2 tuần, ít hơn 30% người dùng còn ghi chép",
                "Đo số ngày có ghi chép trong 14 ngày đầu",
                "Nếu sai: chuyển sang ghi tự động từ ảnh chuyển khoản, hoặc đổi trọng tâm sang gom đơn",
            ],
            [
                "Nhà cung cấp quanh trường trả phí giới thiệu",
                "Ít hơn 2 nhà cung cấp đồng ý thử trong 1 tháng",
                "Mời 10 nhà cung cấp, đo số người ký thử",
                "Nếu sai: giữ miễn phí, tìm nguồn thu từ quảng cáo hiển thị hoặc gói dịch vụ cho trường",
            ],
            [
                "Chủ kèo đủ uy tín để thu tiền trước",
                "Nhiều kèo đủ người nhưng không ai chuyển khoản",
                "Theo dõi tỉ lệ khai báo đã chuyển khoản trên số kèo đủ người",
                "Nếu sai: thêm bước xác nhận hai chiều và chỉ hiện số tài khoản sau khi đủ người",
            ],
        ],
        [4.4, 4.1, 4.2, 3.2],
        caption="Ba giả thuyết rủi ro cao nhất của mô hình kinh doanh",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )


def cau_4(document):
    H1(document, "CÂU 4: PHƯƠNG ÁN PITCHING VÀ PHẢN BIỆN (2,0 ĐIỂM)")

    H2(document, "4.1. Cấu trúc bài thuyết trình 8 slide")
    TABLE(
        document,
        [
            ["Slide", "Thông điệp chính", "Bằng chứng đưa ra"],
            ["1. Vấn đề", "Cuối tháng sinh viên không biết tiền đã đi đâu", "Con số hạn mức và ảnh chụp màn hình tổng quan"],
            ["2. Insight", "Sinh viên cần một con số tức thì, không cần báo cáo dài", "Kết quả khảo sát ở mục 1.3.1"],
            ["3. Giải pháp", "Bốn phân hệ trong một tài khoản sinh viên", "Sơ đồ luồng trải nghiệm"],
            ["4. Demo", "Ghi một khoản chi trong ba thao tác, xem tiền phải chuyển trong một bước", "Ảnh chụp màn hình Tổng quan và Gom đơn"],
            ["5. Thị trường", "Gần 1.000 người dùng mục tiêu trong năm đầu tại một trường", "Bảng TAM – SAM – SOM"],
            ["6. Cạnh tranh", "Không ai kết hợp quản lý chi tiêu với chợ nội bộ trường", "Bảng so sánh và bản đồ định vị"],
            ["7. Mô hình kinh doanh", "Miễn phí cho sinh viên, thu từ nhà cung cấp địa phương", "Chín khối BMC và ba giả thuyết rủi ro"],
            ["8. Đội ngũ và lời kêu gọi", "Nhóm đã có sản phẩm chạy được, cần người dùng thật để kiểm chứng", "Ảnh trước/sau và kế hoạch 3 tháng"],
        ],
        [3.4, 6.6, 5.9],
        caption="Cấu trúc 8 slide và bằng chứng đi kèm",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )

    H2(document, "4.2. Phân vai và thời lượng thuyết trình")
    TABLE(
        document,
        [
            ["Thời lượng", "Người trình bày", "Nội dung"],
            ["0:00 – 1:30", "Thành viên 1", "Mở đầu, vấn đề và insight"],
            ["1:30 – 4:00", "Thành viên 2", "Giải pháp và demo trực tiếp trên sản phẩm"],
            ["4:00 – 6:30", "Thành viên 3", "Thị trường, cạnh tranh, mô hình kinh doanh"],
            ["6:30 – 8:30", "Thành viên 1", "Kết quả kiểm chứng, minh chứng trước/sau"],
            ["8:30 – 10:00", "Cả nhóm", "Kết luận, roadmap và trả lời câu hỏi"],
        ],
        [3.4, 4.2, 8.3],
        caption="Phân vai thuyết trình trong 10 phút",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )

    H2(document, "4.3. Kịch bản phản biện theo khung Acknowledge – Answer – Evidence – Next Step")
    P(
        document,
        "Năm câu hỏi dưới đây là những câu khó nhất nhóm dự đoán sẽ gặp. Mỗi câu trả lời đi theo bốn bước: "
        "ghi nhận câu hỏi, trả lời thẳng, đưa bằng chứng, nêu bước tiếp theo.",
    )

    questions = [
        (
            "“Sinh viên đã có Money Lover miễn phí, tại sao phải dùng thêm UniSave?”",
            "Đúng là ứng dụng đó làm phần quản lý chi tiêu tốt hơn nhóm ở giai đoạn này.",
            "Nhưng nó không có chợ đồ cũ trong trường, không có kèo gom đơn và không xác minh người dùng là sinh viên thật. Ba việc đó là lý do sinh viên mở ứng dụng mỗi ngày, còn báo cáo tài chính thì không.",
            "Bảng so sánh ở mục 3.2.1 cho thấy không sản phẩm nào có cả ba yếu tố cộng đồng.",
            "Nhóm sẽ đo tỉ lệ người quay lại sau 4 tuần; nếu thấp hơn các ứng dụng tài chính thì đó là tín hiệu phải bỏ phần quản lý chi tiêu và tập trung vào gom đơn.",
        ),
        (
            "“Sinh viên rất lười nhập liệu, làm sao duy trì được?”",
            "Đây là rủi ro lớn nhất và nhóm đã đặt nó thành giả thuyết số một.",
            "Nhóm giảm thao tác ghi chép xuống ba bước và không bắt buộc nhập mô tả. Người dùng chỉ cần nhập số tiền và chọn danh mục có sẵn.",
            "Kết quả đo nội bộ: 3 thao tác cho một khoản chi, và người thử hoàn thành cả bốn nhiệm vụ không cần trợ giúp ở lần thử thứ ba.",
            "Bước tiếp theo là thử nghiệm 5 sinh viên trong 14 ngày, đo số ngày có ghi chép; nếu dưới 30% thì đổi sang nhập từ ảnh chuyển khoản.",
        ),
        (
            "“Bán đồ cũ trong trường thì ai chịu trách nhiệm nếu bị lừa?”",
            "Nhóm không giữ tiền và không bảo đảm giao dịch, nhưng có trách nhiệm làm rõ rủi ro.",
            "Mọi người bán phải là sinh viên đã xác minh, vị trí bị làm mờ trong bán kính khoảng 50 mét, mỗi tin và mỗi kèo đều có nút báo cáo và quản trị viên xử lý trong 24 giờ.",
            "Trong thử nghiệm, báo cáo được ghi nhận và xử lý đúng hạn; tin của tài khoản chưa xác minh không đăng được.",
            "Sắp tới nhóm bổ sung nhãn “giao dịch tại điểm công cộng trong trường” để khuyến khích gặp trực tiếp.",
        ),
        (
            "“Ứng dụng này kiếm tiền bằng cách nào khi miễn phí cho sinh viên?”",
            "Đây là điểm nhóm chưa kiểm chứng, chỉ là giả thuyết.",
            "Nguồn thu dự kiến đến từ nhà cung cấp quanh trường: họ trả phí giới thiệu cho các đơn gom, không phải sinh viên trả phí.",
            "Mô hình 9 khối ở mục 3.4.1 ghi rõ giả thuyết này, và mục 3.4.3 nêu dấu hiệu nếu nó sai.",
            "Nhóm sẽ mời 10 nhà cung cấp quanh trường dùng thử miễn phí trong 1 tháng và đo số người đồng ý trả phí sau đó.",
        ),
        (
            "“Nếu trường hoặc một công ty lớn làm sản phẩm tương tự thì sao?”",
            "Điều đó hoàn toàn có thể xảy ra và thực tế là dấu hiệu thị trường có thật.",
            "Lợi thế của nhóm là hiểu đúng một trường cụ thể: đúng khu vực, đúng mùa thi, đúng món ăn trong KTX. Công ty lớn khó làm sâu ở từng trường trong thời gian ngắn.",
            "Bộ dữ liệu món ăn Việt, giá tham khảo và cách chia kèo đã được xây riêng cho sinh viên Việt Nam, không phải bản dịch từ sản phẩm nước ngoài.",
            "Nhóm sẽ mở rộng theo từng trường, mỗi trường có bộ dữ liệu riêng, và giữ liên hệ chặt với ban quản lý KTX để tạo hào cạnh tranh.",
        ),
    ]

    for index, (question, acknowledge, answer, evidence, next_step) in enumerate(questions, start=1):
        H3(document, f"4.3.{index}. {question}")
        for label, text in (
            ("Acknowledge: ", acknowledge),
            ("Answer: ", answer),
            ("Evidence: ", evidence),
            ("Next Step: ", next_step),
        ):
            paragraph = document.add_paragraph()
            paragraph.paragraph_format.left_indent = Cm(1.0)
            paragraph.paragraph_format.first_line_indent = Cm(0)
            paragraph.paragraph_format.space_after = Pt(3)
            run = paragraph.add_run(label)
            run.bold = True
            run.font.name = "Times New Roman"
            run.font.size = Pt(12)
            run2 = paragraph.add_run(text)
            run2.font.name = "Times New Roman"
            run2.font.size = Pt(12)


def phan_iii(document):
    H1(document, "PHẦN III: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")

    H2(document, "III.1. Kết quả đạt được")
    P(
        document,
        "Nhóm đã đi hết một vòng thiết kế: từ quan sát, xác định vấn đề, chọn giải pháp, dựng sản phẩm chạy được "
        "đến sửa theo phản hồi. Bốn phân hệ chính đều hoạt động: quản lý chi tiêu theo ngày, chợ đồ cũ nội bộ "
        "trường, gom đơn có chia tiền và thực đơn đi chợ theo ngân sách.",
    )
    P(
        document,
        "Giá trị lớn nhất không phải số tính năng mà là việc nhóm biết bỏ: bỏ báo cáo dài, bỏ bước nhập liệu "
        "rườm rà, bỏ những khối thông tin không ai đọc. Bốn vòng PDCA ở mục 2.4 ghi lại đúng những lần phải "
        "quay lại sửa vì người dùng không hiểu hoặc không tìm thấy.",
    )

    H2(document, "III.2. Kế hoạch hành động tiếp theo")
    TABLE(
        document,
        [
            ["Giai đoạn", "Việc chính", "Chỉ số cần đạt"],
            ["Tháng 1", "Chạy thử với 5 sinh viên, ghi dữ liệu thô vào Phụ lục D, sửa các lỗi chặn luồng", "Hoàn thành 4/4 nhiệm vụ không trợ giúp"],
            ["Tháng 2", "Mở cho một trường, tổ chức 2 kèo gom đơn mỗi tuần, cập nhật giá nguyên liệu", "≥ 100 người dùng, ≥ 30% quay lại 3 ngày/tuần"],
            ["Tháng 3", "Mời 10 nhà cung cấp quanh trường, thử mô hình phí giới thiệu đơn gom", "≥ 2 nhà cung cấp ký thử; ≥ 50% kèo đủ người"],
        ],
        [3.0, 8.6, 4.3],
        caption="Roadmap ba tháng sau khi bảo vệ",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )


def references(document):
    H1(document, "TÀI LIỆU THAM KHẢO")
    items = [
        "[1] Bộ Giáo dục và Đào tạo. Số liệu thống kê giáo dục đại học. Truy cập tháng 10/2026, từ https://moet.gov.vn",
        "[2] Tổng cục Thống kê. Niên giám thống kê: dân số và giáo dục. Truy cập tháng 10/2026, từ https://www.gso.gov.vn",
        "[3] Nielsen Norman Group. Usability 101: Introduction to Usability. Truy cập tháng 10/2026, từ https://www.nngroup.com/articles/usability-101-introduction-to-usability/",
        "[4] W3C. Web Content Accessibility Guidelines (WCAG) 2.1. Truy cập tháng 10/2026, từ https://www.w3.org/TR/WCAG21/",
        "[5] Money Lover. Trang sản phẩm và mô tả tính năng trên Google Play. Truy cập tháng 10/2026, từ https://play.google.com",
        "[6] MISA. Sổ thu chi MISA – giới thiệu tính năng. Truy cập tháng 10/2026, từ https://www.misa.vn",
        "[7] OpenStreetMap contributors. Dữ liệu bản đồ mở dùng cho chức năng vị trí. Truy cập tháng 10/2026, từ https://www.openstreetmap.org",
    ]
    for item in items:
        paragraph = document.add_paragraph()
        paragraph.paragraph_format.first_line_indent = Cm(0)
        paragraph.paragraph_format.left_indent = Cm(1.0)
        paragraph.paragraph_format.first_line_indent = Cm(-1.0)
        paragraph.paragraph_format.space_after = Pt(4)
        run = paragraph.add_run(item)
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)


def phu_luc(document):
    H1(document, "PHỤ LỤC MINH CHỨNG")

    H2(document, "Phụ lục A: Bảng câu hỏi khảo sát và biên bản trao đổi")
    P(
        document,
        "Bảng hỏi gồm 10 câu, gửi qua biểu mẫu trực tuyến trong nhóm lớp và nhóm KTX. Đường dẫn biểu mẫu và "
        "ảnh chụp biểu mẫu: [dán link biểu mẫu tại đây].",
    )
    TABLE(
        document,
        [
            ["STT", "Câu hỏi", "Loại câu hỏi"],
            ["1", "Bạn đang ở đâu trong thời gian học?", "Một lựa chọn"],
            ["2", "Mỗi tháng bạn có bao nhiêu tiền để chi tiêu?", "Khoảng giá trị"],
            ["3", "Bạn có ghi lại các khoản chi không? Nếu có, bằng cách nào?", "Một lựa chọn"],
            ["4", "Khi nào bạn nhận ra mình đã tiêu quá tay?", "Một lựa chọn"],
            ["5", "Khoản chi nào chiếm nhiều nhất trong tháng của bạn?", "Một lựa chọn"],
            ["6", "Bạn đã từng mua hoặc bán đồ cũ trong trường chưa?", "Có/Không"],
            ["7", "Bạn có lo lộ thông tin khi mua bán đồ cũ không?", "Thang 1–5"],
            ["8", "Bạn đã từng góp tiền mua chung chưa? Cách tính tiền hiện tại là gì?", "Mở"],
            ["9", "Điều gì khiến bạn bỏ một ứng dụng quản lý chi tiêu?", "Mở"],
            ["10", "Bạn có sẵn sàng thử một ứng dụng miễn phí cho sinh viên không?", "Có/Không"],
        ],
        [1.4, 11.4, 3.1],
        caption="Mười câu hỏi trong biểu mẫu khảo sát",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )
    P(
        document,
        "Biên bản tóm tắt ba cuộc trao đổi dài hơn (ghi chép của nhóm, đã ẩn tên người tham gia): một bạn năm "
        "nhất ở KTX nói rằng chỉ ghi chép bằng ảnh chụp chuyển khoản và thường bỏ sau vài ngày; một bạn năm hai "
        "ở trọ cho biết mỗi lần mua chung đều phải nhắn tin hỏi lại số tiền vì sợ chuyển thiếu; một bạn năm ba "
        "đã bán giáo trình cũ nói lo nhất là người lạ biết phòng mình ở đâu.",
    )

    H2(document, "Phụ lục B: Bản đồ thấu cảm")
    TABLE(
        document,
        [
            ["Nói ra ngoài", "Nghĩ trong đầu"],
            [
                "“Tháng này tao hết tiền rồi, cho tao vay 200 nghìn.”\n"
                "“Ăn gì cũng đắt, mà tao lười nấu.”\n"
                "“Mua chung đi cho rẻ, nhưng tính tiền kiểu gì?”",
                "“Mình tiêu ít hơn bạn cùng phòng mà vẫn hết tiền.”\n"
                "“Ghi chép làm gì cho mệt, vài hôm là bỏ.”\n"
                "“Người bán này có thật là sinh viên không?”",
            ],
            ["Làm gì", "Cảm thấy thế nào"],
            [
                "Chụp màn hình chuyển khoản để nhớ.\n"
                "Lướt nhóm Facebook của trường để tìm đồ cũ.\n"
                "Nhắn tin hỏi lại số tiền khi mua chung.",
                "Lo lắng vào cuối tháng.\n"
                "Ngại khi phải vay bạn cùng phòng.\n"
                "Hào hứng khi săn được món rẻ, rồi hối hận nếu mua bốc đồng.",
            ],
        ],
        [7.95, 7.95],
        caption="Bản đồ thấu cảm của người dùng mục tiêu",
        source="Nguồn: nhóm tổng hợp từ ghi chép trao đổi và quan sát",
        size=10,
    )

    H2(document, "Phụ lục C: Wireframe và nguyên mẫu số")
    P(
        document,
        "Hai khung dưới đây là bản vẽ tay được số hoá lại trước khi dựng giao diện thật. Đường dẫn nguyên mẫu "
        "tương tác: [dán link Figma hoặc link bản chạy thử tại đây].",
    )
    FIG(
        document,
        IDEA / "wireframe.png",
        "Wireframe hai màn hình chính: Tổng quan và Chi tiêu",
        "Nguồn: nhóm thực hiện",
        width=15.5,
    )

    H2(document, "Phụ lục D: Bảng dữ liệu thô kết quả thử nghiệm MVP")
    P(
        document,
        "Bảng dưới là khung ghi nhận cho 5 phiên thử nghiệm. Dòng đầu là ví dụ về cách ghi, không phải dữ liệu "
        "thật; các dòng còn lại điền trong và sau mỗi phiên.",
    )
    TABLE(
        document,
        [
            ["Người thử", "Tuổi", "Trường/KTX", "Số nhiệm vụ xong (4)", "Thời gian (phút)", "Lỗi gặp", "Góp ý nguyên văn", "Hài lòng (1–5)"],
            ["(ví dụ) SV A", "19", "KTX khu A", "4", "18", "Không", "Muốn thấy số tiền còn lại ngay khi mở", "5"],
            ["SV B", "", "", "", "", "", "", ""],
            ["SV C", "", "", "", "", "", "", ""],
            ["SV D", "", "", "", "", "", "", ""],
            ["SV E", "", "", "", "", "", "", ""],
        ],
        [2.4, 1.1, 2.2, 2.2, 2.0, 2.2, 3.0, 1.8],
        caption="Khung ghi nhận dữ liệu thử nghiệm",
        source="Nguồn: nhóm thực hiện; điền trực tiếp trong từng phiên thử",
        size=9,
    )
    NOTE(
        document,
        "Lưu ý khi nộp: bảng này phải là dữ liệu thật sau khi chạy 5 phiên. Dòng ví dụ cần xoá trước khi in, "
        "hoặc giữ lại và ghi rõ là ví dụ minh hoạ cách điền.",
    )

    H2(document, "Phụ lục E: Hình ảnh hoạt động nhóm")
    P(
        document,
        "Phần này dành cho ảnh chụp các buổi làm việc nhóm, ảnh phỏng vấn sinh viên và ảnh phiên thử nghiệm. "
        "Nhóm dán ảnh kèm chú thích ngày, địa điểm và người tham gia. Nếu không có ảnh, ghi rõ lý do thay vì "
        "bỏ trống mục này.",
    )
