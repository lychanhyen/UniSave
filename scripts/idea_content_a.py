"""Nội dung tài liệu Thiết kế ý tưởng UniSave — phần khung, PHẦN I và CÂU 1."""

from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Pt

from idea_docx_helpers import (
    B,
    FIG,
    H1,
    H2,
    H3,
    IDEA,
    LEAD,
    NOTE,
    P,
    PAGE_BREAK,
    SCREENS,
    TABLE,
    TEXT_WIDTH,
    set_run,
)


def cover(document):
    for _ in range(2):
        document.add_paragraph()

    for text, size in (
        ("TRƯỜNG ĐẠI HỌC ĐÔNG Á", 14),
        ("KHOA CÔNG NGHỆ THÔNG TIN", 14),
    ):
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.first_line_indent = Cm(0)
        set_run(paragraph.add_run(text), size=size, bold=True)

    for _ in range(3):
        document.add_paragraph()

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    set_run(paragraph.add_run("BÁO CÁO THIẾT KẾ Ý TƯỞNG SẢN PHẨM"), size=15, bold=True)

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    paragraph.paragraph_format.space_before = Pt(10)
    set_run(
        paragraph.add_run("UNISAVE\nNỀN TẢNG QUẢN LÝ TÀI CHÍNH\nVÀ CHỢ ĐỒ CŨ DÀNH CHO SINH VIÊN"),
        size=19,
        bold=True,
    )

    for _ in range(3):
        document.add_paragraph()

    TABLE(
        document,
        [
            ["Thông tin", "Nội dung"],
            ["Nhóm thực hiện", "Nhóm 04"],
            ["Thành viên", "[Họ tên] – [MSSV] – [Vai trò]\n[Họ tên] – [MSSV] – [Vai trò]\n[Họ tên] – [MSSV] – [Vai trò]"],
            ["Lớp", "[Lớp]"],
            ["Giảng viên hướng dẫn", "[Họ tên giảng viên]"],
            ["Ngày hoàn thành", "Tháng 11 năm 2026"],
        ],
        [5.0, 10.9],
        size=12,
    )

    for _ in range(2):
        document.add_paragraph()

    paragraph = document.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    paragraph.paragraph_format.first_line_indent = Cm(0)
    set_run(paragraph.add_run("TP. Hồ Chí Minh, tháng 11 năm 2026"), size=13, bold=True)


def loi_cam_on(document):
    H1(document, "LỜI CẢM ƠN")
    P(
        document,
        "Trong quá trình thực hiện bài tập thiết kế ý tưởng, nhóm nhận được góp ý của giảng viên phụ trách "
        "môn học, của các bạn trong lớp và của những sinh viên đã dành thời gian thử nghiệm sản phẩm. Những "
        "góp ý đó giúp nhóm bỏ những ý tưởng nghe hợp lý nhưng không ai cần, và giữ lại những việc nhỏ nhưng "
        "giải quyết đúng nỗi lo hằng ngày của sinh viên.",
    )
    P(
        document,
        "Sản phẩm và báo cáo vẫn còn thiếu sót, đặc biệt ở phần số liệu thị trường và dữ liệu kiểm thử. Nhóm "
        "ghi rõ nguồn và cách ước lượng ở từng bảng để người đọc biết chỗ nào là số liệu đã kiểm chứng, chỗ "
        "nào là ước tính của nhóm. Nhóm mong nhận được nhận xét của giảng viên để hoàn thiện hơn.",
    )


def muc_luc(document, anchors):
    H1(document, "MỤC LỤC")
    anchors["toc"] = document.add_paragraph()


def danh_muc_viet_tat(document):
    H1(document, "DANH MỤC VIẾT TẮT")
    TABLE(
        document,
        [
            ["Viết tắt", "Nghĩa đầy đủ"],
            ["POV", "Point of View – tuyên bố vấn đề từ góc nhìn người dùng"],
            ["UVP", "Unique Value Proposition – giá trị đề xuất độc đáo"],
            ["MVP", "Minimum Viable Product – sản phẩm khả dụng tối thiểu"],
            ["TAM – SAM – SOM", "Tổng thị trường – thị trường phục vụ được – thị trường mục tiêu năm đầu"],
            ["SWOT / TOWS", "Phân tích điểm mạnh, điểm yếu, cơ hội, thách thức và các chiến lược kết hợp"],
            ["BMC", "Business Model Canvas – mô hình kinh doanh 9 khối"],
            ["PDCA", "Plan – Do – Check – Act, vòng lặp cải tiến"],
            ["A – A – E – N", "Acknowledge – Answer – Evidence – Next Step, khung trả lời phản biện"],
            ["SV / KTX", "Sinh viên / ký túc xá"],
        ],
        [3.6, 12.3],
        size=11,
    )


def danh_muc_bang_hinh(document, anchors):
    H1(document, "DANH MỤC BẢNG BIỂU & HÌNH ẢNH")
    anchors["tables"] = document.add_paragraph()
    anchors["figures"] = document.add_paragraph()


def phan_i(document):
    H1(document, "PHẦN I: GIỚI THIỆU TỔNG QUAN DỰ ÁN")

    H2(document, "I.1. Tên dự án và thông tin nhóm thực hiện")
    P(
        document,
        "UniSave là ứng dụng web giúp sinh viên Việt Nam biết mình còn tiêu được bao nhiêu trong ngày, mua "
        "bán đồ cũ trong cùng trường, gom đơn mua chung có chia tiền tự động và gợi ý thực đơn đi chợ theo số "
        "tiền đang có. Sản phẩm hướng tới nhóm sinh viên sống xa nhà, nhận trợ cấp theo tháng và phải tự lo "
        "toàn bộ chi tiêu sinh hoạt.",
    )
    TABLE(
        document,
        [
            ["Họ và tên", "MSSV", "Vai trò trong nhóm", "Phần đảm nhận"],
            ["[Họ tên]", "[MSSV]", "Nhóm trưởng", "Điều phối, tổng hợp báo cáo, phỏng vấn người dùng"],
            ["[Họ tên]", "[MSSV]", "Thành viên", "Thiết kế giao diện, dựng nguyên mẫu"],
            ["[Họ tên]", "[MSSV]", "Thành viên", "Khảo sát, tổng hợp dữ liệu kiểm thử"],
        ],
        [4.6, 2.8, 3.6, 4.9],
        caption="Phân công trong nhóm",
        source="Nguồn: nhóm thực hiện",
    )

    H2(document, "I.2. Lý do chọn đề tài")
    P(
        document,
        "Sinh viên sống xa nhà thường nhận một khoản tiền cố định từ gia đình theo tháng hoặc theo đợt. Khoản "
        "tiền đó phải trả cho tiền trọ, ăn uống, sách vở, đi lại và cả những khoản phát sinh không báo trước "
        "như ốm, hỏng xe, đám cưới bạn cùng lớp. Vì không ai theo dõi hộ, sinh viên chỉ biết mình đã tiêu quá "
        "tay khi trong ví còn vài chục nghìn mà tháng chưa hết.",
    )
    P(
        document,
        "Trong lúc trao đổi với các bạn trong trường, nhóm nhận thấy nỗi lo lớn nhất không phải là kiếm thêm "
        "tiền, mà là không biết tiền đang đi đâu và không dám nhìn vào con số thật. Nỗi lo đó lặp lại mỗi "
        "tháng, kèm theo tâm lý ngại ghi chép vì cho rằng ghi chép mất thời gian và mau bỏ.",
    )
    P(
        document,
        "Bên cạnh đó, hai nhu cầu khác cũng rất phổ biến trong trường: mua bán đồ cũ (giáo trình, quần áo, đồ "
        "điện) và mua chung để được giá sỉ. Cả hai đang diễn ra rải rác trên nhóm mạng xã hội, người mua không "
        "kiểm chứng được người bán, còn việc chia tiền mua chung thì tính tay bằng tin nhắn nên hay nhầm.",
    )
    P(
        document,
        "Vì vậy nhóm chọn xây dựng một sản phẩm giải quyết cả ba việc trên trong một tài khoản sinh viên: quản "
        "lý chi tiêu, mua bán đồ cũ và gom đơn. Điểm chung của cả ba là đều bắt đầu từ một câu hỏi rất cụ thể "
        "mà sinh viên phải trả lời mỗi ngày: hôm nay mình còn tiêu được bao nhiêu.",
    )

    H2(document, "I.3. Tóm tắt mục tiêu dự án theo tiến trình thiết kế")
    TABLE(
        document,
        [
            ["Giai đoạn", "Việc nhóm đã làm", "Sản phẩm đầu ra"],
            ["Đồng cảm", "Trao đổi với sinh viên trong trường, quan sát cách các bạn ghi chép và mua bán đồ cũ", "Ghi chép phỏng vấn, bảng hỏi khảo sát"],
            ["Xác định vấn đề", "Gom các câu trả lời thành 5 vấn đề lặp lại nhiều nhất, viết POV và chân dung người dùng", "POV, Persona, danh sách 5 vấn đề"],
            ["Tạo ý tưởng", "Đề xuất 12 ý tưởng, chấm điểm và chọn 4 hướng khả thi", "Bảng SCAMPER, ma trận chọn giải pháp"],
            ["Dựng nguyên mẫu", "Thiết kế luồng và dựng ứng dụng chạy được cho 4 phân hệ chính", "Ứng dụng web dùng được, wireframe"],
            ["Kiểm chứng", "Cho dùng thử, ghi nhận lỗi, sửa theo từng vòng", "Nhật ký PDCA, ảnh trước và sau khi sửa"],
        ],
        [3.2, 7.4, 5.3],
        caption="Mục tiêu và sản phẩm đầu ra theo từng giai đoạn",
        source="Nguồn: nhóm thực hiện",
    )


def cau_1(document):
    H1(document, "CÂU 1: TỪ VẤN ĐỀ ĐẾN GIÁ TRỊ NGƯỜI DÙNG (1,5 ĐIỂM)")

    H2(document, "1.1. Phân khúc người dùng mục tiêu và bối cảnh phát sinh vấn đề")
    H3(document, "1.1.1. Đối tượng người dùng")
    P(
        document,
        "Nhóm tập trung vào sinh viên năm nhất đến năm ba, sống ở trọ hoặc ký túc xá, cách nhà trên 50 km. "
        "Thu nhập hằng tháng của nhóm này chủ yếu đến từ trợ cấp của gia đình, khoảng 2 đến 5 triệu đồng, cộng "
        "thêm thu nhập không đều từ làm thêm. Các bạn dùng điện thoại thông minh hằng ngày, quen mua sắm qua "
        "mạng xã hội và sẵn sàng dùng công cụ miễn phí nếu đăng nhập nhanh.",
    )
    P(
        document,
        "Điểm chung của nhóm này là tự quản lý tiền lần đầu, chưa có thói quen ghi chép, và chịu áp lực tâm lý "
        "khi thấy bạn bè chi tiêu thoải mái hơn mình. Đây cũng là nhóm có nhu cầu mua bán đồ cũ cao nhất vì đồ "
        "dùng chỉ cần trong một học kỳ.",
    )

    H3(document, "1.1.2. Bối cảnh thực tế phát sinh các rủi ro tài chính")
    P(
        document,
        "Tiền trợ cấp về theo đợt nên tuần đầu tháng thường dư dả, còn tuần cuối tháng phải cắt bữa. Chi phí "
        "ăn uống chiếm phần lớn tổng chi vì sinh viên ăn ngoài gần như mọi bữa. Các chương trình khuyến mãi, "
        "freeship và trả góp 0 đồng xuất hiện liên tục trên điện thoại, biến việc mua sắm bốc đồng thành phản "
        "xạ khó cưỡng.",
    )
    P(
        document,
        "Khi cần tiết kiệm, sinh viên thường chọn cách mua chung để được giá sỉ hoặc mua lại đồ cũ. Nhưng cả "
        "hai cách này đều phát sinh vấn đề mới: chia tiền mua chung phải tính tay, dễ sai và dễ mất lòng; còn "
        "mua bán đồ cũ qua nhóm mạng xã hội thì không biết người bán có thật là sinh viên hay không.",
    )

    H2(document, "1.2. Phân tích 5 vấn đề cốt lõi bằng khung 5W1H và nhu cầu người dùng")
    P(
        document,
        "Năm vấn đề dưới đây được chọn vì xuất hiện lặp lại trong phần lớn các cuộc trao đổi, không phải vì "
        "chúng nghe hợp lý. Mỗi dòng ghi rõ ai gặp, khi nào, ở đâu, vì sao và nhu cầu thật phía sau.",
    )
    TABLE(
        document,
        [
            ["Vấn đề", "Ai – khi nào – ở đâu (Who/When/Where)", "Vì sao xảy ra (Why)", "Nhu cầu thật và cách giải quyết (How)"],
            [
                "1. Không biết lập kế hoạch chi tiêu tháng",
                "Sinh viên năm nhất, ngay khi nhận đợt trợ cấp đầu tiên, ở phòng trọ",
                "Chưa từng tự quản tiền, không biết chia khoản cố định và khoản phát sinh",
                "Cần một con số cụ thể cho hôm nay thay vì một kế hoạch dài dòng",
            ],
            [
                "2. Chi phí ăn uống hằng ngày cao",
                "Sinh viên ở trọ, mỗi bữa trưa và tối, quanh trường hoặc KTX",
                "Ăn ngoài thường xuyên vì không biết nấu và sợ tốn thời gian đi chợ",
                "Cần gợi ý món rẻ, dễ nấu và danh sách đi chợ gộp sẵn",
            ],
            [
                "3. Mua sắm theo cảm xúc khi có khuyến mãi",
                "Sinh viên dùng mạng xã hội buổi tối, khi lướt điện thoại trước giờ ngủ",
                "Khuyến mãi liên tục, không có rào cản nào giữa ý muốn và cú bấm mua",
                "Cần nhìn thấy hậu quả của một khoản mua trước khi bấm",
            ],
            [
                "4. Chưa có thói quen tiết kiệm",
                "Sinh viên nhận tiền theo đợt, cuối mỗi đợt, tại phòng trọ",
                "Tiết kiệm bị coi là việc phải làm sau khi tiêu, nên không bao giờ làm",
                "Cần tiết kiệm tự động, không phụ thuộc vào ý chí từng ngày",
            ],
            [
                "5. Khó cân đối khi thu nhập hạn chế và có khoản đột xuất",
                "Sinh viên làm thêm, khi ốm hoặc hỏng xe, bất kỳ lúc nào trong tháng",
                "Khoản đột xuất lấy từ tiền ăn, làm sụp kế hoạch cả tháng",
                "Cần công cụ trải đều khoản đột xuất thay vì trừ thẳng vào bữa ăn",
            ],
        ],
        [3.3, 3.9, 4.2, 4.5],
        caption="Năm vấn đề cốt lõi phân tích theo 5W1H",
        source="Nguồn: nhóm tổng hợp từ ghi chép trao đổi với sinh viên (xem Phụ lục A)",
        size=10,
    )

    H2(document, "1.3. Bằng chứng thực tế và insight cốt lõi")
    H3(document, "1.3.1. Dữ liệu khảo sát và phỏng vấn")
    P(
        document,
        "Nhóm thu thập phản hồi qua bảng hỏi trực tuyến 10 câu (Phụ lục A) gửi trong nhóm lớp và nhóm KTX, "
        "kết hợp trao đổi trực tiếp với những bạn đồng ý nói chuyện lâu hơn. Bảng dưới là các chỉ số nhóm dùng "
        "để ra quyết định thiết kế.",
    )
    TABLE(
        document,
        [
            ["Chỉ số khảo sát", "Kết quả", "Ý nghĩa với thiết kế"],
            ["Không ghi lại khoản chi nào", "≈ 7/10 người được hỏi", "Ghi chép phải cực nhanh, nếu không sẽ bỏ"],
            ["Chỉ nhận ra đã tiêu quá tay vào cuối tháng", "≈ 8/10", "Cần hiển thị hạn mức còn lại của hôm nay, ngay khi mở ứng dụng"],
            ["Từng mua hoặc bán đồ cũ trong trường", "≈ 6/10", "Chợ nội bộ trường là nhu cầu thật, không phải ý tưởng thêm"],
            ["Từng góp tiền mua chung và phải tính tay", "≈ 4/10", "Chia tiền tự động giải quyết đúng điểm đau"],
            ["Sẵn sàng dùng công cụ miễn phí, đăng nhập nhanh", "≈ 9/10", "Không đặt rào cản trả phí ở giai đoạn đầu"],
            ["Lo lộ thông tin khi mua bán đồ cũ", "≈ 5/10", "Cần xác minh sinh viên và làm mờ vị trí"],
        ],
        [7.4, 3.8, 4.7],
        caption="Các chỉ số khảo sát dùng để ra quyết định thiết kế",
        source="Nguồn: nhóm tự ước lượng từ quan sát và trao đổi nhanh trong trường; cần thay bằng tỉ lệ chính thức khi có kết quả khảo sát đầy đủ",
        size=11,
    )
    NOTE(
        document,
        "Ghi chú phương pháp: các tỉ lệ trên là ước lượng của nhóm dựa trên quan sát trực tiếp và ghi chép "
        "trao đổi, chưa phải kết quả khảo sát định lượng đủ mẫu. Khi có kết quả khảo sát chính thức, thay số "
        "tương ứng và giữ nguyên cấu trúc bảng. Đường dẫn biểu mẫu khảo sát và ảnh chụp biểu mẫu đặt ở Phụ lục A.",
    )

    H3(document, "1.3.2. Insight quan trọng")
    P(
        document,
        "Insight thứ nhất là sinh viên không thiếu hiểu biết về tài chính, mà thiếu phản hồi tức thì. Ai cũng "
        "biết nên tiết kiệm, nhưng chỉ khi nhìn thấy con số còn lại của hôm nay giảm xuống thì hành vi mới đổi. "
        "Vì vậy thông tin quan trọng nhất trên màn hình đầu tiên không phải tổng chi cả tháng, mà là số tiền "
        "được tiêu trong ngày còn lại.",
    )
    P(
        document,
        "Insight thứ hai là tiết kiệm một mình rất khó duy trì, còn tiết kiệm cùng người khác thì dễ hơn nhiều. "
        "Sinh viên sẵn sàng đi chợ chung, mua chung, mua lại đồ cũ vì vừa rẻ vừa có lý do để không mua một mình. "
        "Điều này giải thích vì sao một ứng dụng quản lý chi tiêu thuần túy khó giữ chân người dùng, còn ứng "
        "dụng có yếu tố cộng đồng thì được mở thường xuyên.",
    )
    P(
        document,
        "Từ hai insight trên, nhóm rút ra nguyên tắc thiết kế: mọi màn hình phải trả lời được một câu hỏi tiền "
        "bạc cụ thể trong dưới ba giây, và mỗi hành động tiết kiệm nên gắn với một người khác để tăng động lực.",
    )

    H2(document, "1.4. Tuyên bố vấn đề (POV), chân dung người dùng và giá trị đề xuất (UVP)")
    H3(document, "1.4.1. Tuyên bố POV")
    P(
        document,
        "Sinh viên sống xa nhà, nhận trợ cấp theo tháng và không có thói quen ghi chép, cần biết ngay khi mở "
        "điện thoại hôm nay mình còn được tiêu bao nhiêu, vì nỗi sợ lớn nhất của họ là những ngày cuối tháng "
        "phải vay bạn cùng phòng trong khi không nhớ tiền đã đi đâu.",
    )
    LEAD(
        document,
        "“Những ngày cuối tháng, mình không dám mở ví, cũng không nhớ tiền đã đi đâu.”",
    )

    H3(document, "1.4.2. Chân dung người dùng điển hình")
    TABLE(
        document,
        [
            ["Thuộc tính", "Nội dung"],
            ["Họ tên (đại diện)", "Nguyễn Hoàng Anh"],
            ["Tuổi, năm học", "19 tuổi, sinh viên năm nhất"],
            ["Nơi ở, trường", "Phòng trọ cách trường 3 km, TP. Hồ Chí Minh"],
            ["Thu nhập", "3,2 triệu đồng/tháng từ gia đình, thêm 500 nghìn khi làm thêm cuối tuần"],
            ["Mục tiêu", "Không phải vay tiền vào cuối tháng; để dành 500 nghìn mỗi tháng"],
            ["Nỗi đau", "Không nhớ đã tiêu gì; thấy tiền biến mất sau mỗi lần lướt mạng xã hội"],
            ["Hành vi", "Ghi chú bằng ảnh chụp màn hình chuyển khoản; mua chung với bạn cùng phòng; mua giáo trình cũ"],
            ["Câu nói thường gặp", "“Thôi tháng này coi như bỏ, tháng sau làm lại.”"],
            ["Điều khiến bạn ấy ở lại", "Mở ứng dụng ra là thấy con số, không phải làm bài tập thêm"],
        ],
        [4.4, 11.5],
        caption="Chân dung người dùng điển hình",
        source="Nguồn: nhóm tổng hợp từ ghi chép trao đổi (nhân vật đại diện, không phải một cá nhân cụ thể)",
    )

    H3(document, "1.4.3. Giá trị đề xuất độc đáo (UVP)")
    P(
        document,
        "Vấn đề của sinh viên không phải là thiếu ứng dụng quản lý chi tiêu, mà là các ứng dụng đó bắt họ làm "
        "một việc mà họ không duy trì được: ghi chép đều đặn và đọc báo cáo dài. Insight rút ra từ phần khảo "
        "sát là người dùng chỉ hành động khi thông tin đến đúng lúc và ở dạng một con số duy nhất, đồng thời "
        "họ tiết kiệm tốt hơn khi việc tiết kiệm gắn với người khác. Nhu cầu thật vì thế không phải là một "
        "cuốn sổ chi tiêu điện tử, mà là một nơi trả lời tức thì câu hỏi hôm nay còn tiêu được bao nhiêu, và "
        "biến việc tiết kiệm thành hoạt động chung: gom đơn với bạn cùng lớp, mua lại đồ cũ trong trường, chia "
        "tiền minh bạch. Giá trị mà UniSave mang lại là đặt toàn bộ vòng tiền của một sinh viên vào đúng một "
        "tài khoản: từ lúc nhận trợ cấp, chia hạn mức theo ngày, ghi một khoản chi trong ba thao tác, gom đơn "
        "để giảm chi phí, cho đến khi phần dư cuối tháng tự chảy vào heo đất.",
    )
    LEAD(
        document,
        "UniSave giúp sinh viên biết mình còn tiêu được bao nhiêu ngay khi mở ứng dụng, và tiết kiệm hiệu quả "
        "hơn nhờ gom đơn cùng bạn học — tất cả trong một tài khoản sinh viên đã xác minh.",
    )
