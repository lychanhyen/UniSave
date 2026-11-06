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

    H3(document, "2.3.2. Kịch bản thử nghiệm ba bước")
    P(
        document,
        "Phiên thử nghiệm được tổ chức theo ba bước cố định để kết quả giữa các phiên so sánh được với nhau. "
        "Nhóm không hướng dẫn trong lúc người thử thao tác, chỉ ghi lại điều quan sát được.",
    )
    P(document, "Bước 1 – Chuẩn bị: xác định mẫu, đối tượng và nhiệm vụ.", indent=True, bold=True)
    for item in [
        "Mẫu: 5 sinh viên ngoài nhóm (3 nam, 2 nữ), năm 1 đến năm 3, trong đó ít nhất 1 bạn ở ký túc xá.",
        "Đối tượng loại trừ: thành viên nhóm và người đã xem trước giao diện, để tránh kết quả bị lệch.",
        "Nhiệm vụ: bốn nhiệm vụ từ dễ đến khó, mỗi nhiệm vụ có tiêu chí hoàn thành rõ ràng.",
        "Vật dụng: điện thoại của chính người thử, phiếu ghi thời gian và bảng ghi nhận ở Phụ lục D.",
    ]:
        B(document, item)
    TABLE(
        document,
        [
            ["Nhiệm vụ", "Yêu cầu", "Tiêu chí hoàn thành"],
            ["1. Đặt ngân sách", "Nhập ngân sách tháng 3.000.000 đồng và cho biết hôm nay còn tiêu được bao nhiêu", "Đọc đúng con số hạn mức của ngày"],
            ["2. Ghi khoản chi", "Ghi một khoản 35.000 đồng cho bữa trưa", "Khoản chi xuất hiện trong danh sách, hạn mức ngày giảm tương ứng"],
            ["3. Tạo kèo gom đơn", "Tạo kèo 5 người và xem số tiền mình phải chuyển", "Đọc đúng số tiền phải chuyển trong bảng chia tiền"],
            ["4. Đăng tin bán đồ", "Đăng một tin bán giáo trình cũ kèm vị trí nhận hàng", "Tin hiện trong danh sách chợ với vị trí đã chọn"],
        ],
        [3.4, 7.0, 5.5],
        caption="Bốn nhiệm vụ và tiêu chí hoàn thành",
        source="Nguồn: nhóm thực hiện",
        size=10,
    )
    P(document, "Bước 2 – Tiến hành thử: đo thao tác thật, không gợi ý.", indent=True, bold=True)
    for item in [
        "Mỗi phiên 25 phút, tính từ lúc người thử cầm điện thoại; 2 phút đầu chỉ giới thiệu mục tiêu, không chỉ chỗ bấm.",
        "Nhóm ghi ba loại số liệu: thời gian từng nhiệm vụ, số lần bấm sai, và câu nói đầu tiên khi gặp chỗ khó.",
        "Nếu người thử dừng quá 60 giây ở một bước, nhóm ghi nhận là điểm tắc và chỉ trợ giúp khi họ chủ động hỏi.",
    ]:
        B(document, item)
    P(document, "Bước 3 – Thu phản hồi và chuyển thành việc sửa.", indent=True, bold=True)
    for item in [
        "Sau phiên, hỏi 4 câu ngắn: chỗ nào khó hiểu nhất, chỗ nào thừa, có dùng lại không, muốn thêm gì.",
        "Ghi nguyên văn góp ý vào bảng dữ liệu thô (Phụ lục D), không diễn giải lại theo ý nhóm.",
        "Phân loại phản hồi thành ba nhóm: lỗi chặn luồng, chỗ khó hiểu, và góp ý tính năng; hai nhóm đầu chuyển thành đầu việc sửa ở vòng PDCA kế tiếp.",
        "Đối chiếu với chỉ số ở mục 2.3.3 để quyết định sửa hay giữ nguyên thiết kế.",
    ]:
        B(document, item)

    H3(document, "2.3.3. Chỉ số đo lường và ngưỡng thành công")
    TABLE(
        document,
        [
            ["Chỉ số", "Cách đo", "Ngưỡng đạt", "Kết quả kiểm thử nội bộ"],
            ["Hoàn thành nhiệm vụ không trợ giúp", "Quan sát, đếm số nhiệm vụ làm được một mình", "≥ 3/4 nhiệm vụ", "4/4 ở lần thử thứ ba"],
            ["Số thao tác để ghi một khoản chi", "Đếm trên giao diện", "≤ 3", "3"],
            ["Số bước để biết tiền phải chuyển trong kèo", "Đếm trên giao diện", "≤ 1", "1 (sau khi sửa)"],
            ["Lỗi chặn luồng", "Đếm lỗi khiến người dùng dừng lại", "0", "0 sau khi sửa"],
            ["Mức hài lòng", "Hỏi 1–5 sau phiên", "≥ 4", "4 (tự đánh giá nội bộ)"],
        ],
        [5.0, 5.2, 2.6, 3.1],
        caption="Chỉ số đo lường và ngưỡng thành công",
        source="Nguồn: nhóm tự đo trên bản chạy thử; kết quả chính thức cập nhật từ Phụ lục D",
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
                "Mô tả bị cắt còn 2 dòng, bảng chia tiền phải bấm mới hiện; người thử không tìm thấy số tiền phải chuyển",
                "Tách thẻ tóm tắt và trang chi tiết, mở sẵn bảng chia tiền",
            ],
            [
                "2",
                "Khối giới thiệu trang Chợ phải dễ đọc",
                "Dùng nền tối, chữ trắng để nổi bật",
                "Chữ xám trên nền đen khó đọc, tương phản thấp ở màn hình ngoài trời",
                "Đổi sang nền xanh rất nhạt, chữ đậm, số liệu đặt trên nền trắng",
            ],
            [
                "3",
                "Chỉ sinh viên đã xác minh mới được bình luận",
                "Đặt quy tắc chặn ở phía máy chủ",
                "Ba tài khoản chưa xác minh vẫn gửi được bình luận, lỗi hiện ra khó hiểu với người dùng",
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
