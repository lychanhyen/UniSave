"""Nội dung CÂU 2: giải pháp, nguyên mẫu, kiểm chứng và minh chứng trước/sau."""

from docx.shared import Cm

from idea_docx_helpers import B, FIG, H1, H2, H3, IDEA, LEAD, NOTE, P, SCREENS, TABLE


def cau_2(document):
    H1(document, "CÂU 2: THIẾT KẾ GIẢI PHÁP – NGUYÊN MẪU MVP – KIỂM CHỨNG (4,0 ĐIỂM)")

    H2(document, "2.1. Quá trình tạo ý tưởng và lý do chọn hướng sản phẩm")
    H3(document, "2.1.1. Tổng hợp ý tưởng bằng kỹ thuật SCAMPER")
    P(
        document,
        "Nhóm bắt đầu từ 5 vấn đề ở Câu 1 và đề xuất 12 ý tưởng. Bảng dưới ghi lại những ý tưởng còn lại sau "
        "khi loại các ý không khả thi trong bốn tuần.",
    )
    TABLE(
        document,
        [
            ["Hướng", "Ý tưởng áp dụng cho UniSave", "Giữ lại"],
            ["Thay thế", "Thay sổ tay ghi chép bằng một con số hạn mức duy nhất hiện khi mở ứng dụng", "Có"],
            ["Kết hợp", "Gộp quản lý chi tiêu với chợ đồ cũ và gom đơn trong cùng một tài khoản", "Có"],
            ["Thích ứng", "Áp dụng cách chia tiền của kèo gom đơn cho việc chia tiền trọ với bạn cùng phòng", "Không"],
            ["Phóng đại", "Hiển thị khoản dư cuối tháng như một con heo đất lớn dần mỗi ngày", "Có"],
            ["Sử dụng khác", "Dùng dữ liệu chi tiêu để gợi ý thực đơn đi chợ", "Có"],
            ["Loại bỏ", "Bỏ bước ghi chép thủ công bằng cách chỉ cần nhập số tiền và chọn danh mục có sẵn", "Có"],
            ["Đảo ngược", "Thay vì báo cáo tháng, bắt đầu từ ngày: hôm nay còn được tiêu bao nhiêu", "Có"],
        ],
        [2.6, 10.6, 2.7],
        caption="Ý tưởng theo kỹ thuật SCAMPER và quyết định giữ lại",
        source="Nguồn: nhóm thực hiện",
        size=11,
    )

    H3(document, "2.1.2. Ma trận lựa chọn giải pháp")
    P(
        document,
        "Bốn phương án được chấm theo năm tiêu chí, thang điểm 1 đến 5, điểm càng cao càng tốt.",
    )
    TABLE(
        document,
        [
            ["Phương án", "Giải đúng nỗi đau", "Chi phí thấp", "Làm được trong 4 tuần", "Lan truyền trong trường", "Đo lường được", "Tổng"],
            ["A. Ứng dụng ghi chi tiêu thuần túy", "4", "5", "5", "2", "5", "21"],
            ["B. Chợ đồ cũ nội bộ trường", "3", "3", "4", "4", "3", "17"],
            ["C. Ghép kèo mua chung và chia tiền", "4", "4", "3", "5", "4", "20"],
            ["D. Kết hợp A, B, C + gợi ý thực đơn (UniSave)", "5", "3", "4", "5", "5", "22"],
        ],
        [5.2, 2.2, 1.9, 2.4, 2.4, 1.8, 1.0],
        caption="Ma trận chấm điểm bốn phương án",
        source="Nguồn: nhóm chấm điểm theo tiêu chí môn học",
        size=10,
    )
    P(
        document,
        "Phương án D được chọn vì tuy chi phí và khối lượng lớn hơn, nhưng đúng nỗi đau nhất và có yếu tố cộng "
        "đồng nên giữ được người dùng quay lại. Phương án A dễ làm nhưng dễ bị bỏ, vì sinh viên bỏ ghi chép là "
        "lý do chính khiến các ứng dụng cũ thất bại với họ.",
    )

    H2(document, "2.2. Thiết kế nguyên mẫu và trình diễn luồng")
    P(
        document,
        "Nhóm đã dựng thành công bản MVP chạy được trên nền tảng web, không phải bản vẽ hay nguyên mẫu "
        "tĩnh. Người dùng có thể đăng ký, đăng nhập, nhập ngân sách tháng, ghi từng khoản chi, đăng tin bán "
        "đồ cũ kèm vị trí, tạo kèo gom đơn và xem thực đơn đi chợ; dữ liệu được lưu lại và hiển thị lại sau "
        "khi tải trang. Toàn bộ hình ảnh trong mục này là ảnh chụp trực tiếp từ ứng dụng đang chạy, không "
        "phải ảnh dựng lại bằng công cụ thiết kế.",
    )
    H3(document, "2.2.1. Kiến trúc thông tin và luồng trải nghiệm")
    P(
        document,
        "Sản phẩm gồm bốn phân hệ dùng chung một tài khoản: quản lý chi tiêu (Tổng quan, Chi tiêu), chợ đồ cũ, "
        "gom đơn và dinh dưỡng. Mọi màn hình đều xoay quanh một con số trung tâm là hạn mức còn lại của hôm nay.",
    )
    FIG(
        document,
        IDEA / "luong-nguoi-dung.png",
        "Luồng trải nghiệm chính từ khi nhận trợ cấp đến khi chốt sổ cuối tháng",
        "Nguồn: nhóm thực hiện",
        width=15.5,
    )

    H3(document, "2.2.2. Luồng 1 – Ngân sách tự chia theo ngày")
    P(
        document,
        "Người dùng nhập số tiền mình có, ứng dụng trích trước 10% vào heo đất, phần còn lại chia cho số ngày "
        "còn lại của tháng. Từ đó, mỗi ngày có một hạn mức riêng. Khi ghi một khoản chi, hạn mức của ngày tự "
        "tính lại và đổi màu khi gần hết hoặc vượt mức.",
    )
    FIG(
        document,
        SCREENS / "tong-quan.png",
        "Màn hình Tổng quan: hạn mức còn lại của ngày hôm nay hiện ngay đầu trang, kèm lịch chi tiêu và các lối tắt — người dùng quyết định tiêu tiếp hay dừng lại trong một cái nhìn",
        "Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)",
        width=15.5,
    )
    P(
        document,
        "Điểm đo của luồng này: ghi một khoản chi cần 3 thao tác (mở form, nhập số tiền, lưu). Số tiền còn lại "
        "của ngày hiện ngay sau khi lưu, không cần chuyển màn hình.",
    )
    FIG(
        document,
        SCREENS / "chi-tieu.png",
        "Màn hình Chi tiêu: một khoản chi được ghi trong ba thao tác, số còn lại của ngày cập nhật ngay sau khi lưu",
        "Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)",
        width=15.5,
    )

    H3(document, "2.2.3. Luồng 2 – Gom đơn mua chung và chia tiền tự động")
    P(
        document,
        "Một người tạo kèo với giá gốc, giá gom, số người tối thiểu và hạn chót. Bạn cùng lớp tham gia, hệ thống "
        "tự tính số tiền mỗi người cần chuyển và phần tiết kiệm của từng người. Mỗi thành viên tự khai báo đã "
        "chuyển khoản kèm ảnh bill, chủ kèo xác nhận lại.",
    )
    FIG(
        document,
        SCREENS / "gom-don.png",
        "Màn hình Gom đơn: thẻ kèo tóm tắt giá, số người đã tham gia và hạn chót; bấm vào mở trang chi tiết có sẵn bảng chia tiền từng người",
        "Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)",
        width=15.5,
    )
    P(
        document,
        "Điểm đo: số thao tác để biết mình phải chuyển bao nhiêu tiền giảm từ 2 bước (mở thẻ, bấm ô chia tiền) "
        "xuống 1 bước (mở trang chi tiết kèo, bảng chia tiền đã mở sẵn) — xem minh chứng ở mục 2.4.3.",
    )

    H3(document, "2.2.4. Luồng 3 – Chợ đồ cũ nội bộ trường")
    P(
        document,
        "Người bán đăng tin kèm ảnh, giá và vị trí nhận hàng. Vị trí được làm mờ trong bán kính khoảng 50 mét để "
        "không lộ địa chỉ phòng trọ, người mua chỉ thấy khu vực gần đúng. Tin tự ẩn sau 7 ngày, người bán có thể "
        "đánh dấu đã bán mà vẫn giữ lại lịch sử.",
    )
    FIG(
        document,
        SCREENS / "cho-do-cu.png",
        "Màn hình Chợ đồ cũ: lọc theo trường, mỗi tin hiện giá, vị trí nhận hàng đã làm mờ và huy hiệu đã xác minh của người bán",
        "Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)",
        width=15.5,
    )
    P(
        document,
        "Điểm đo: số tin cần thao tác để tìm một món đồ trong trường giảm còn một lần lọc; mọi tin đều hiển thị "
        "trạng thái xác minh của người bán để giảm rủi ro lừa đảo.",
    )

    H3(document, "2.2.5. Luồng 4 – Gợi ý thực đơn đi chợ theo số tiền")
    P(
        document,
        "Người dùng nhập ngân sách đi chợ và số ngày, ứng dụng chọn món Việt rẻ, dễ nấu, đủ một mặn một canh mỗi "
        "bữa, rồi gộp nguyên liệu thành một danh sách đi chợ kèm giá tham khảo. Danh sách có thể xoá từng món "
        "không muốn ăn và so sánh với số tiền thực trả khi đi chợ về.",
    )
    FIG(
        document,
        SCREENS / "dinh-duong.png",
        "Màn hình Dinh dưỡng: thực đơn nhiều ngày kèm danh sách đi chợ gộp sẵn và bảng so sánh giữa chi phí dự kiến với số tiền thực trả",
        "Nguồn: ảnh chụp màn hình ứng dụng UniSave (phiên dùng thử với dữ liệu mẫu)",
        width=15.5,
    )

    H2(document, "2.3. Kế hoạch kiểm chứng giả thuyết")
    H3(document, "2.3.1. Ba giả thuyết rủi ro nhất")
    TABLE(
        document,
        [
            ["Giả thuyết", "Nếu sai thì dự án hỏng ở đâu", "Cách kiểm chứng", "Ngưỡng đạt"],
            [
                "Sinh viên chịu ghi một khoản chi mỗi ngày nếu chỉ mất 3 thao tác",
                "Không có dữ liệu chi tiêu, toàn bộ phần ngân sách và thực đơn mất giá trị",
                "Cho dùng thử 5 ngày, đếm số ngày có ghi chép",
                "≥ 4/5 người ghi ít nhất 4 ngày",
            ],
            [
                "Sinh viên dám chuyển tiền trước cho chủ kèo khi thấy bảng chia tiền rõ ràng",
                "Kèo không chốt được, phân hệ gom đơn chỉ còn là nơi đăng tin",
                "Theo dõi tỉ lệ kèo đủ người và tỉ lệ thành viên khai báo đã chuyển khoản",
                "≥ 50% kèo đủ người trong 7 ngày",
            ],
            [
                "Người bán đồ cũ chấp nhận đăng tin dù vị trí bị làm mờ",
                "Chợ không có hàng, người mua rời đi và mang theo cả phần còn lại của ứng dụng",
                "Hỏi trực tiếp người đã đăng tin, đếm số người đồng ý đăng lại",
                "≥ 3/5 người nói sẵn sàng đăng tiếp",
            ],
        ],
        [5.0, 4.2, 4.3, 2.4],
        caption="Ba giả thuyết rủi ro cao nhất và cách kiểm chứng",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )

    H3(document, "2.3.2. Quy trình kiểm chứng ba bước")
    P(
        document,
        "Quy trình kiểm chứng của nhóm gồm ba bước và đã thực hiện xong hai bước đầu với dữ liệu thật; bước thứ ba "
        "đang tiếp tục. Nhóm ghi rõ phần nào đã làm, phần nào còn dự kiến, để không nhận những kết quả mình chưa "
        "có.",
    )
    P(document, "Bước 1 – Chuẩn bị: xác định đối tượng, câu hỏi và bản mẫu để thử.", indent=True, bold=True)
    for item in [
        "Xác định đối tượng: sinh viên Trường Đại học Đông Á, ở trọ hoặc ký túc xá, năm 1 đến năm 3.",
        "Dựng xong bản chạy được để đưa cho người dùng thao tác, thay vì chỉ cho xem ảnh thiết kế.",
        "Soạn biểu mẫu 10 câu (Phụ lục A) để hỏi đúng những chỗ bản mẫu chưa rõ, không hỏi chung chung.",
        "Chuẩn bị phiếu ghi nhận gồm bốn cột: thời gian, số lần bấm sai, điểm tắc, góp ý nguyên văn.",
    ]:
        B(document, item)
    P(document, "Bước 2 – Tiến hành: cho dùng thử và ghi nhận phản ứng thật.", indent=True, bold=True)
    for item in [
        "Đã làm: gửi biểu mẫu trực tuyến trong 5 ngày, thu 11 phản hồi hợp lệ (kết quả ở mục 1.3.1).",
        "Đã làm: thành viên nhóm và một số bạn cùng lớp dùng thử trực tiếp các luồng chính trên điện thoại; nhóm ghi lại chỗ dừng, chỗ bấm sai và câu hỏi lặp lại.",
        "Chi tiết cách đo: mỗi nhiệm vụ ghi thời gian, đếm số lần bấm sai, và ghi câu nói đầu tiên của người thử khi gặp chỗ khó.",
        "Dự kiến ở phiên chính thức: 5 sinh viên ngoài nhóm, 25 phút mỗi phiên, bốn nhiệm vụ từ đặt ngân sách đến đăng tin bán đồ.",
    ]:
        B(document, item)
    P(document, "Bước 3 – Phản hồi người dùng và cải tiến.", indent=True, bold=True)
    for item in [
        "Đã làm: chuyển các lỗi ghi nhận được thành đầu việc sửa và theo dõi theo bốn vòng ở mục 2.4.1.",
        "Ba lỗi thực tế đã sửa theo phản hồi: thẻ kèo che mất số tiền phải chuyển, khối giới thiệu trang Chợ khó đọc, tài khoản chưa xác minh vẫn bình luận được.",
        "Cách phân loại phản hồi: lỗi chặn luồng (sửa ngay), chỗ khó hiểu (sửa trong vòng kế tiếp), góp ý tính năng (ghi lại, chọn lọc sau).",
        "Dự kiến: sau 5 phiên chính thức, ghi kết quả vào bảng dữ liệu thô ở Phụ lục D rồi đối chiếu với ngưỡng ở mục 2.3.3.",
    ]:
        B(document, item)

    H3(document, "2.3.3. Chỉ số đo lường và ngưỡng thành công")
    P(
        document,
        "Bảng dưới là các chỉ số nhóm dùng để biết bản mẫu có giải quyết được vấn đề hay không, kèm ngưỡng đặt ra "
        "trước khi thử. Cột cuối ghi trạng thái thật: chỉ số nào đã đo được bằng dữ liệu hiện có, chỉ số nào còn "
        "chờ phiên thử chính thức.",
    )
    TABLE(
        document,
        [
            ["Chỉ số", "Cách đo", "Ngưỡng thành công", "Trạng thái hiện tại"],
            ["Hoàn thành nhiệm vụ không cần trợ giúp", "Quan sát trong phiên thử, đếm số nhiệm vụ làm được một mình", "≥ 3/4 nhiệm vụ", "Chưa đo đủ mẫu (chờ 5 phiên)"],
            ["Số thao tác để ghi một khoản chi", "Đếm trực tiếp trên giao diện", "≤ 3 thao tác", "Đã đạt: 3 thao tác"],
            ["Số bước để biết tiền phải chuyển trong kèo", "Đếm số lần bấm từ thẻ kèo đến khi thấy số tiền", "≤ 1 bước", "Đã đạt: 1 bước (sau khi tách trang chi tiết)"],
            ["Số lỗi chặn luồng", "Đếm lỗi khiến người dùng dừng lại hoặc phải hỏi", "0 lỗi", "Đã sửa 3 lỗi phát hiện khi dùng thử nội bộ"],
            ["Thời gian thu thập một phản hồi khảo sát", "Đo thời gian trung bình hoàn thành biểu mẫu 10 câu", "≤ 3 phút", "Đã đạt: khoảng 3 phút"],
            ["Mức hài lòng sau phiên", "Hỏi 1–5 ngay sau phiên thử", "≥ 4/5", "Chưa đo (chờ 5 phiên)"],
        ],
        [4.6, 5.0, 3.0, 3.3],
        caption="Chỉ số đo lường, ngưỡng thành công và trạng thái thật",
        source="Nguồn: nhóm thực hiện; các chỉ số đã đạt được đo trên bản chạy thử, các chỉ số còn lại chờ phiên thử 5 sinh viên",
        size=10,
    )

    H2(document, "2.4. Thực hiện vòng lặp PDCA và quyết định sau kiểm thử")
    H3(document, "2.4.1. Nhật ký triển khai PDCA")
    TABLE(
        document,
        [
            ["Vòng", "Plan", "Do", "Check", "Act"],
            [
                "1",
                "Thẻ kèo gom đơn phải cho xem đủ thông tin quan trọng",
                "Dồn mô tả, thành viên, bảng chia tiền vào một thẻ",
                "Mô tả bị cắt còn 2 dòng, bảng chia tiền phải bấm mới hiện; khi dùng thử, nhóm không tìm thấy số tiền phải chuyển trên thẻ",
                "Tách thẻ tóm tắt và trang chi tiết, mở sẵn bảng chia tiền",
            ],
            [
                "2",
                "Khối giới thiệu trang Chợ phải dễ đọc",
                "Dùng nền tối, chữ trắng để nổi bật",
                "Chữ xám trên nền đen khó đọc, tương phản thấp khi xem ngoài trời",
                "Đổi sang nền xanh rất nhạt, chữ đậm, số liệu đặt trên nền trắng",
            ],
            [
                "3",
                "Chỉ sinh viên đã xác minh mới được bình luận",
                "Đặt quy tắc chặn ở phía máy chủ",
                "Ba tài khoản chưa xác minh vẫn gửi được bình luận; thông báo lỗi hiện ra khó hiểu",
                "Chặn đúng và hiện thông báo màu vàng giải thích cần xác minh trước",
            ],
            [
                "4",
                "Ô nhập tiền phải nhận mọi số tiền thực tế",
                "Giới hạn bước nhảy theo bội số 10.000 và 100.000 đồng",
                "Không nhập được 275.000 đồng hay 11.800 đồng phí ship; biểu mẫu báo lỗi khó hiểu",
                "Bỏ giới hạn bước nhảy, hiển thị số có dấu chấm khi gõ",
            ],
        ],
        [1.2, 3.4, 3.4, 4.4, 3.5],
        caption="Nhật ký bốn vòng PDCA của nhóm",
        source="Nguồn: nhật ký làm việc của nhóm, đối chiếu với lịch sử thay đổi sản phẩm",
        size=9.5,
    )

    H3(document, "2.4.2. Bài học rút ra")
    P(
        document,
        "Bài học thứ nhất: làm đủ tính năng không quan trọng bằng làm đúng một việc mà người dùng phải làm mỗi "
        "ngày. Nhóm từng thêm nhiều khối thông tin lên trang tổng quan, nhưng người thử chỉ cần đúng một con số "
        "hạn mức của hôm nay; các khối còn lại phải chuyển sang trang riêng.",
    )
    P(
        document,
        "Bài học thứ hai: mọi ràng buộc phải nói bằng ngôn ngữ của người dùng. Việc chặn bình luận của tài "
        "khoản chưa xác minh là đúng, nhưng nếu chỉ báo lỗi kỹ thuật thì người dùng tưởng ứng dụng hỏng. Câu "
        "thông báo phải nói rõ cần xác minh và đưa đường dẫn đến nơi xác minh.",
    )
    P(
        document,
        "Bài học thứ ba: dữ liệu do chính người dùng nhập phải được đối xử như dữ liệu thật. Giới hạn bước nhảy "
        "của ô nhập tiền nghe hợp lý nhưng đã chặn đúng những con số có thật như phí ship 11.800 đồng hay tiền "
        "nhà 275.000 đồng.",
    )

    H3(document, "2.4.3. Quyết định Iterate/Pivot và minh chứng thay đổi trước – sau")
    P(
        document,
        "Cả bốn vòng đều theo hướng Iterate, không Pivot: giữ nguyên bốn phân hệ, chỉ sửa cách trình bày và "
        "ràng buộc. Hai thay đổi lớn nhất được chụp ảnh trước và sau để đối chiếu.",
    )
    TABLE(
        document,
        [
            ["Hạng mục", "Trước khi sửa", "Sau khi sửa", "Lý do"],
            [
                "Danh sách kèo gom đơn",
                "Mỗi kèo là một thẻ nhồi mô tả, thành viên, nút chia tiền; mô tả bị cắt 2 dòng",
                "Thẻ chỉ còn giá, số người, hạn chót; bấm vào mở trang chi tiết đầy đủ",
                "Người thử không đọc được thông tin cần thiết trên thẻ, cũng không biết bấm vào đâu",
            ],
            [
                "Khối giới thiệu trang Chợ",
                "Nền đen, chữ trắng, số liệu trên nền trắng mờ",
                "Nền xanh rất nhạt, chữ đậm, số liệu trên nền trắng",
                "Tương phản thấp, lạc tông so với phần còn lại của ứng dụng",
            ],
        ],
        [3.4, 5.4, 4.4, 2.7],
        caption="Tóm tắt hai thay đổi lớn và lý do",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )
    FIG(
        document,
        SCREENS / "before-gom-don.png",
        "TRƯỚC khi sửa: mỗi kèo là một thẻ dồn mọi thông tin, mô tả bị cắt",
        "Nguồn: ảnh chụp màn hình phiên bản trước của ứng dụng",
        width=15.5,
    )
    FIG(
        document,
        SCREENS / "gom-don.png",
        "SAU khi sửa: thẻ tóm tắt gọn, chi tiết chuyển sang trang riêng",
        "Nguồn: ảnh chụp màn hình phiên bản hiện tại của ứng dụng",
        width=15.5,
    )
    FIG(
        document,
        SCREENS / "before-cho-do-cu.png",
        "TRƯỚC khi sửa: khối giới thiệu trang Chợ dùng nền tối, chữ trắng",
        "Nguồn: ảnh chụp màn hình phiên bản trước của ứng dụng",
        width=15.5,
    )
    FIG(
        document,
        SCREENS / "cho-do-cu.png",
        "SAU khi sửa: nền xanh rất nhạt, chữ đậm, số liệu dễ đọc",
        "Nguồn: ảnh chụp màn hình phiên bản hiện tại của ứng dụng",
        width=15.5,
    )
    P(
        document,
        "Hai cặp ảnh trên là minh chứng cho vòng lặp Iterate: cùng một tính năng, cùng một luồng sử dụng, nhưng "
        "cách trình bày thay đổi để người dùng tìm thấy thông tin quan trọng mà không phải bấm thêm.",
    )
