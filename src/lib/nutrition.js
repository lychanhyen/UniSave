/**
 * Dữ liệu dinh dưỡng: nguyên liệu theo giá tham khảo Bách Hoá Xanh và 100 món Việt
 * rẻ, dễ nấu, đủ đạm - rau - tinh bột.
 *
 * Giá là giá tham khảo (đơn vị VND) để dự toán đi chợ một lần; người dùng sửa được
 * ngay trong trang Dinh dưỡng nếu giá thực tế khác.
 *
 * Quy ước: `items` ghi [mã nguyên liệu, số lượng theo đơn vị mua]. Ví dụ
 * ['thitHeo', 0.15] nghĩa là 0,15 kg thịt heo.
 */

export const INGREDIENTS = {
  /* ------------------------------- Tinh bột ------------------------------- */
  gao: { name: 'Gạo tẻ', unit: 'kg', price: 18000, group: 'Tinh bột' },
  gaote: { name: 'Gạo tẻ', unit: 'kg', price: 18000, group: 'Tinh bột' },
  gaoNep: { name: 'Gạo nếp', unit: 'kg', price: 24000, group: 'Tinh bột' },
  miGoi: { name: 'Mì gói', unit: 'gói', price: 4000, group: 'Tinh bột' },
  bun: { name: 'Bún tươi', unit: 'kg', price: 20000, group: 'Tinh bột' },
  pho: { name: 'Bánh phở', unit: 'kg', price: 22000, group: 'Tinh bột' },
  banhMi: { name: 'Bánh mì', unit: 'ổ', price: 5000, group: 'Tinh bột' },
  khoaiTay: { name: 'Khoai tây', unit: 'kg', price: 30000, group: 'Tinh bột' },
  khoaiLang: { name: 'Khoai lang', unit: 'kg', price: 25000, group: 'Tinh bột' },
  bap: { name: 'Bắp Mỹ', unit: 'trái', price: 12000, group: 'Tinh bột' },

  /* --------------------------------- Đạm --------------------------------- */
  trung: { name: 'Trứng gà', unit: 'quả', price: 3200, group: 'Đạm' },
  thitHeo: { name: 'Thịt heo nạc dăm', unit: 'kg', price: 120000, group: 'Đạm' },
  baChi: { name: 'Thịt ba chỉ', unit: 'kg', price: 130000, group: 'Đạm' },
  suon: { name: 'Sườn non', unit: 'kg', price: 150000, group: 'Đạm' },
  thitBo: { name: 'Thịt bò', unit: 'kg', price: 280000, group: 'Đạm' },
  ucGa: { name: 'Ức gà', unit: 'kg', price: 90000, group: 'Đạm' },
  duiGa: { name: 'Đùi gà', unit: 'kg', price: 85000, group: 'Đạm' },
  caBas: { name: 'Cá basa phi lê', unit: 'kg', price: 70000, group: 'Đạm' },
  caRo: { name: 'Cá rô phi', unit: 'kg', price: 60000, group: 'Đạm' },
  caNuc: { name: 'Cá nục', unit: 'kg', price: 70000, group: 'Đạm' },
  caLoc: { name: 'Cá lóc', unit: 'kg', price: 95000, group: 'Đạm' },
  tom: { name: 'Tôm sú', unit: 'kg', price: 220000, group: 'Đạm' },
  muc: { name: 'Mực ống', unit: 'kg', price: 180000, group: 'Đạm' },
  dauHu: { name: 'Đậu hũ', unit: 'miếng', price: 5000, group: 'Đạm' },
  tauHuKy: { name: 'Tàu hũ ky', unit: 'gói', price: 18000, group: 'Đạm' },
  dauXanh: { name: 'Đậu xanh', unit: 'kg', price: 42000, group: 'Đạm' },
  dauDen: { name: 'Đậu đen', unit: 'kg', price: 45000, group: 'Đạm' },
  lac: { name: 'Đậu phộng', unit: 'kg', price: 60000, group: 'Đạm' },

  /* --------------------------------- Rau --------------------------------- */
  rauMuong: { name: 'Rau muống', unit: 'bó', price: 12000, group: 'Rau củ' },
  caiXanh: { name: 'Cải xanh', unit: 'bó', price: 15000, group: 'Rau củ' },
  caiNgong: { name: 'Cải ngọt', unit: 'bó', price: 15000, group: 'Rau củ' },
  caiThao: { name: 'Cải thảo', unit: 'cây', price: 20000, group: 'Rau củ' },
  bapCai: { name: 'Bắp cải', unit: 'cái', price: 20000, group: 'Rau củ' },
  bongCai: { name: 'Bông cải xanh', unit: 'cái', price: 35000, group: 'Rau củ' },
  caRot: { name: 'Cà rốt', unit: 'kg', price: 25000, group: 'Rau củ' },
  caChua: { name: 'Cà chua', unit: 'kg', price: 25000, group: 'Rau củ' },
  duaLeo: { name: 'Dưa leo', unit: 'kg', price: 20000, group: 'Rau củ' },
  biDao: { name: 'Bí đao', unit: 'kg', price: 15000, group: 'Rau củ' },
  biDo: { name: 'Bí đỏ', unit: 'kg', price: 20000, group: 'Rau củ' },
  muop: { name: 'Mướp', unit: 'kg', price: 18000, group: 'Rau củ' },
  dauQue: { name: 'Đậu que', unit: 'kg', price: 30000, group: 'Rau củ' },
  dauBap: { name: 'Đậu bắp', unit: 'kg', price: 25000, group: 'Rau củ' },
  caiCuc: { name: 'Cải cúc', unit: 'bó', price: 12000, group: 'Rau củ' },
  rauNgot: { name: 'Rau ngót', unit: 'bó', price: 10000, group: 'Rau củ' },
  mongToi: { name: 'Mồng tơi', unit: 'bó', price: 10000, group: 'Rau củ' },
  ray: { name: 'Rau răm', unit: 'bó', price: 8000, group: 'Rau củ' },
  ngo: { name: 'Ngò', unit: 'bó', price: 8000, group: 'Rau củ' },
  hanhLa: { name: 'Hành lá', unit: 'bó', price: 10000, group: 'Rau củ' },
  hanhTay: { name: 'Hành tím', unit: 'kg', price: 45000, group: 'Rau củ' },
  toi: { name: 'Tỏi', unit: 'kg', price: 60000, group: 'Rau củ' },
  gung: { name: 'Gừng', unit: 'kg', price: 50000, group: 'Rau củ' },
  sa: { name: 'Sả', unit: 'bó', price: 10000, group: 'Rau củ' },
  ot: { name: 'Ớt', unit: 'kg', price: 30000, group: 'Rau củ' },
  namKimCham: { name: 'Nấm kim châm', unit: 'gói', price: 15000, group: 'Rau củ' },
  namRom: { name: 'Nấm rơm', unit: 'gói', price: 20000, group: 'Rau củ' },
  giaDo: { name: 'Giá đỗ', unit: 'kg', price: 15000, group: 'Rau củ' },
  chuoi: { name: 'Chuối', unit: 'nải', price: 25000, group: 'Trái cây' },
  cam: { name: 'Cam', unit: 'kg', price: 30000, group: 'Trái cây' },
  duDu: { name: 'Đu đủ', unit: 'kg', price: 20000, group: 'Trái cây' },
  tao: { name: 'Táo', unit: 'kg', price: 50000, group: 'Trái cây' },

  /* ------------------------------ Gia vị ------------------------------ */
  dauAn: { name: 'Dầu ăn', unit: 'lít', price: 45000, group: 'Gia vị' },
  nuocMam: { name: 'Nước mắm', unit: 'chai', price: 30000, group: 'Gia vị' },
  nuocTuong: { name: 'Nước tương', unit: 'chai', price: 22000, group: 'Gia vị' },
  duong: { name: 'Đường', unit: 'kg', price: 20000, group: 'Gia vị' },
  muoi: { name: 'Muối', unit: 'kg', price: 8000, group: 'Gia vị' },
  tieu: { name: 'Tiêu', unit: 'gói', price: 15000, group: 'Gia vị' },
  botNgot: { name: 'Bột ngọt', unit: 'gói', price: 12000, group: 'Gia vị' },
  me: { name: 'Me chua', unit: 'gói', price: 10000, group: 'Gia vị' },
};

/**
 * 100 món Việt rẻ, dễ nấu. Mỗi món: thời gian nấu, năng lượng và đạm cho 1 người
 * ăn (ước tính), nguyên liệu và cách làm ngắn.
 */
export const DISHES = [
  // ------------------------------- Canh -------------------------------
  { id: 'canh-bi-dao-tom', name: 'Canh bí đao nấu tôm', minutes: 20, kcal: 190, protein: 16, tags: ['canh'], items: [['biDao', 0.2], ['tom', 0.05], ['hanhLa', 0.2]], steps: 'Bí đao gọt vỏ thái miếng, xào tôm với hành rồi đổ nước nấu 10 phút, nêm nếm, rắc hành lá.' },
  { id: 'canh-cai-thit', name: 'Canh cải xanh thịt băm', minutes: 15, kcal: 210, protein: 18, tags: ['canh'], items: [['caiXanh', 0.5], ['thitHeo', 0.08], ['hanhLa', 0.2]], steps: 'Thịt băm ướp tiêu, viên tròn thả vào nước sôi, cho cải xanh vào nấu 5 phút.' },
  { id: 'canh-chua-ca', name: 'Canh chua cá basa', minutes: 30, kcal: 280, protein: 24, tags: ['canh', 'chua'], items: [['caBas', 0.15], ['caChua', 0.1], ['giaDo', 0.1], ['me', 0.2], ['ngo', 0.2]], steps: 'Nấu nước me, cho cá vào nấu chín, thêm cà chua và giá đỗ, nêm chua ngọt.' },
  { id: 'canh-rau-ngot', name: 'Canh rau ngót thịt băm', minutes: 15, kcal: 180, protein: 15, tags: ['canh'], items: [['rauNgot', 0.5], ['thitHeo', 0.06]], steps: 'Nước sôi cho thịt băm vào, vớt bọt rồi cho rau ngót, nấu 3 phút.' },
  { id: 'canh-mong-toi', name: 'Canh mồng tơi tép', minutes: 15, kcal: 160, protein: 12, tags: ['canh'], items: [['mongToi', 0.5], ['tom', 0.04]], steps: 'Tép rang sơ, đổ nước nấu sôi rồi cho mồng tơi vào, nêm vừa ăn.' },
  { id: 'canh-muop', name: 'Canh mướp nấu tôm', minutes: 20, kcal: 170, protein: 14, tags: ['canh'], items: [['muop', 0.2], ['tom', 0.05], ['hanhLa', 0.2]], steps: 'Mướp thái lát, xào tôm rồi nấu cùng 10 phút.' },
  { id: 'canh-bi-do', name: 'Canh bí đỏ thịt băm', minutes: 25, kcal: 220, protein: 16, tags: ['canh'], items: [['biDo', 0.2], ['thitHeo', 0.07]], steps: 'Bí đỏ thái khối, nấu mềm cùng thịt băm, nêm muối tiêu.' },
  { id: 'canh-cai-thao', name: 'Canh cải thảo thịt băm', minutes: 20, kcal: 200, protein: 17, tags: ['canh'], items: [['caiThao', 0.5], ['thitHeo', 0.07]], steps: 'Xào thịt băm với hành, thêm nước và cải thảo nấu 8 phút.' },
  { id: 'canh-dau-hu', name: 'Canh đậu hũ hẹ', minutes: 15, kcal: 190, protein: 15, tags: ['canh', 'chay'], items: [['dauHu', 1], ['caiCuc', 0.4]], steps: 'Đậu hũ cắt miếng, nấu nước sôi cùng rau, nêm nước tương.' },
  { id: 'canh-chua-ca-loc', name: 'Canh chua cá lóc', minutes: 35, kcal: 300, protein: 27, tags: ['canh', 'chua'], items: [['caLoc', 0.2], ['caChua', 0.1], ['dauBap', 0.1], ['me', 0.2]], steps: 'Cá lóc rửa sạch nấu với nước me, thêm cà chua đậu bắp, nêm vừa chua cay.' },
  { id: 'canh-khoai-tay', name: 'Canh khoai tây xương', minutes: 40, kcal: 260, protein: 18, tags: ['canh'], items: [['suon', 0.12], ['khoaiTay', 0.15], ['caRot', 0.08]], steps: 'Hầm sườn 20 phút, thêm khoai tây cà rốt nấu mềm.' },
  { id: 'canh-cai-ngong', name: 'Canh cải ngọt nấu tôm khô', minutes: 15, kcal: 150, protein: 12, tags: ['canh'], items: [['caiNgong', 0.5], ['tom', 0.03]], steps: 'Tôm khô rửa sạch nấu nước dùng, cho cải ngọt vào.' },
  { id: 'canh-dau-que', name: 'Canh đậu que thịt băm', minutes: 20, kcal: 200, protein: 16, tags: ['canh'], items: [['dauQue', 0.2], ['thitHeo', 0.07]], steps: 'Đậu que cắt khúc, nấu cùng thịt băm đã xào sơ.' },
  { id: 'canh-cai-cuc', name: 'Canh cải cúc thịt băm', minutes: 15, kcal: 170, protein: 15, tags: ['canh'], items: [['caiCuc', 0.5], ['thitHeo', 0.06]], steps: 'Nước sôi thả thịt băm, vớt bọt, cho cải cúc nấu 3 phút.' },
  { id: 'canh-nam', name: 'Canh nấm rơm thịt băm', minutes: 20, kcal: 190, protein: 16, tags: ['canh'], items: [['namRom', 0.5], ['thitHeo', 0.07], ['hanhLa', 0.2]], steps: 'Nấm rơm rửa sạch, nấu cùng thịt băm, nêm tiêu.' },

  // ------------------------------- Xào -------------------------------
  { id: 'xao-rau-muong', name: 'Rau muống xào tỏi', minutes: 10, kcal: 110, protein: 4, tags: ['xao', 'chay'], items: [['rauMuong', 0.7], ['toi', 0.02]], steps: 'Phi tỏi vàng, cho rau muống vào xào lửa lớn 2 phút, nêm nước mắm.' },
  { id: 'xao-cai-thit', name: 'Cải xanh xào thịt bò', minutes: 15, kcal: 260, protein: 24, tags: ['xao'], items: [['caiXanh', 0.5], ['thitBo', 0.1], ['toi', 0.02]], steps: 'Bò thái lát ướp tiêu, xào nhanh với tỏi rồi cho cải vào đảo đều.' },
  { id: 'xao-bi-do-tom', name: 'Bí đỏ xào tôm', minutes: 20, kcal: 210, protein: 16, tags: ['xao'], items: [['biDo', 0.25], ['tom', 0.05]], steps: 'Bí đỏ thái mỏng xào với tôm đến khi mềm.' },
  { id: 'xao-dau-que', name: 'Đậu que xào thịt băm', minutes: 15, kcal: 230, protein: 18, tags: ['xao'], items: [['dauQue', 0.25], ['thitHeo', 0.08], ['toi', 0.02]], steps: 'Thịt băm xào săn, cho đậu que vào xào 5 phút.' },
  { id: 'xao-bap-cai', name: 'Bắp cải xào thịt băm', minutes: 15, kcal: 200, protein: 16, tags: ['xao'], items: [['bapCai', 0.3], ['thitHeo', 0.07]], steps: 'Bắp cải thái sợi, xào lửa lớn với thịt băm.' },
  { id: 'xao-gia-do', name: 'Giá đỗ xào hẹ', minutes: 10, kcal: 120, protein: 7, tags: ['xao', 'chay'], items: [['giaDo', 0.25], ['hanhLa', 0.3]], steps: 'Xào giá đỗ lửa lớn 2 phút, thêm hẹ và nêm nếm.' },
  { id: 'xao-khoai-tay', name: 'Khoai tây xào thịt bò', minutes: 20, kcal: 300, protein: 22, tags: ['xao'], items: [['khoaiTay', 0.2], ['thitBo', 0.1]], steps: 'Khoai chiên sơ rồi xào cùng bò thái lát.' },
  { id: 'xao-muc', name: 'Mực xào cần tây', minutes: 20, kcal: 220, protein: 28, tags: ['xao'], items: [['muc', 0.15], ['caiNgong', 0.3], ['toi', 0.02]], steps: 'Mực khứa, xào nhanh với tỏi và rau cần 3 phút.' },
  { id: 'xao-uc-ga', name: 'Ức gà xào sả ớt', minutes: 20, kcal: 250, protein: 30, tags: ['xao'], items: [['ucGa', 0.15], ['sa', 0.2], ['ot', 0.01]], steps: 'Gà thái miếng ướp sả ớt, xào đến chín vàng.' },
  { id: 'xao-bong-cai', name: 'Bông cải xào tôm', minutes: 20, kcal: 200, protein: 20, tags: ['xao'], items: [['bongCai', 0.4], ['tom', 0.05]], steps: 'Bông cải chần sơ, xào cùng tôm và tỏi.' },
  { id: 'xao-ca-rot', name: 'Cà rốt xào trứng', minutes: 15, kcal: 210, protein: 12, tags: ['xao'], items: [['caRot', 0.15], ['trung', 2]], steps: 'Cà rốt thái sợi xào mềm, đập trứng vào đảo đều.' },
  { id: 'xao-dau-hu', name: 'Đậu hũ xào nấm', minutes: 20, kcal: 220, protein: 18, tags: ['xao', 'chay'], items: [['dauHu', 2], ['namKimCham', 0.5]], steps: 'Đậu hũ chiên sơ, xào cùng nấm và nước tương.' },
  { id: 'xao-rau-cu', name: 'Rau củ xào thập cẩm', minutes: 20, kcal: 180, protein: 6, tags: ['xao', 'chay'], items: [['caRot', 0.1], ['bapCai', 0.2], ['dauQue', 0.1]], steps: 'Xào lần lượt rau củ từ cứng tới mềm, nêm vừa ăn.' },
  { id: 'xao-thit-chua-ngot', name: 'Thịt heo xào chua ngọt', minutes: 25, kcal: 320, protein: 22, tags: ['xao'], items: [['thitHeo', 0.12], ['caChua', 0.1], ['duaLeo', 0.1]], steps: 'Thịt ướp rồi xào, thêm cà chua dưa leo và nước sốt chua ngọt.' },
  { id: 'xao-mong-toi', name: 'Mồng tơi xào tỏi', minutes: 10, kcal: 100, protein: 4, tags: ['xao', 'chay'], items: [['mongToi', 0.7], ['toi', 0.02]], steps: 'Phi tỏi, xào mồng tơi lửa lớn, nêm nước mắm.' },

  // ------------------------------- Kho -------------------------------
  { id: 'kho-thit-trung', name: 'Thịt kho trứng', minutes: 45, kcal: 420, protein: 26, tags: ['kho'], items: [['baChi', 0.15], ['trung', 2], ['nuocMam', 0.05]], steps: 'Thịt thái miếng ướp nước mắm đường, kho 30 phút rồi cho trứng vào.' },
  { id: 'kho-ca-basa', name: 'Cá basa kho tộ', minutes: 30, kcal: 280, protein: 26, tags: ['kho'], items: [['caBas', 0.18], ['nuocMam', 0.05], ['ot', 0.01]], steps: 'Cá ướp nước mắm tiêu 15 phút, kho lửa nhỏ đến khi nước sánh.' },
  { id: 'kho-ca-nuc', name: 'Cá nục kho tiêu', minutes: 30, kcal: 300, protein: 28, tags: ['kho'], items: [['caNuc', 0.18], ['tieu', 0.2], ['nuocMam', 0.05]], steps: 'Cá rửa sạch, kho với nước mắm đường và nhiều tiêu.' },
  { id: 'kho-ga-gung', name: 'Gà kho gừng', minutes: 40, kcal: 340, protein: 30, tags: ['kho'], items: [['duiGa', 0.2], ['gung', 0.03], ['nuocMam', 0.04]], steps: 'Gà thái miếng ướp gừng nước mắm, kho 25 phút.' },
  { id: 'kho-dau-hu', name: 'Đậu hũ kho nấm', minutes: 25, kcal: 230, protein: 18, tags: ['kho', 'chay'], items: [['dauHu', 2], ['namRom', 0.4], ['nuocTuong', 0.05]], steps: 'Đậu hũ chiên, kho cùng nấm với nước tương đường.' },
  { id: 'kho-suon', name: 'Sườn kho mặn ngọt', minutes: 45, kcal: 400, protein: 26, tags: ['kho'], items: [['suon', 0.18], ['nuocMam', 0.05], ['duong', 0.02]], steps: 'Sườn chần sơ, ướp rồi kho lửa nhỏ 30 phút.' },
  { id: 'kho-tom', name: 'Tôm kho tộ', minutes: 25, kcal: 260, protein: 30, tags: ['kho'], items: [['tom', 0.12], ['nuocMam', 0.04], ['ot', 0.01]], steps: 'Tôm cắt râu, kho với nước mắm và chút đường.' },
  { id: 'kho-muc', name: 'Mực kho tiêu', minutes: 30, kcal: 250, protein: 30, tags: ['kho'], items: [['muc', 0.15], ['tieu', 0.2], ['nuocMam', 0.04]], steps: 'Mực làm sạch, kho cùng tiêu và nước mắm đến khi săn lại.' },
  { id: 'kho-ca-ro', name: 'Cá rô phi kho nghệ', minutes: 30, kcal: 270, protein: 26, tags: ['kho'], items: [['caRo', 0.18], ['gung', 0.02], ['nuocMam', 0.04]], steps: 'Cá ướp nghệ gừng, kho lửa nhỏ đến khi thấm.' },
  { id: 'kho-dau-que', name: 'Đậu que kho thịt', minutes: 30, kcal: 260, protein: 18, tags: ['kho'], items: [['dauQue', 0.2], ['thitHeo', 0.1]], steps: 'Thịt kho trước 15 phút rồi cho đậu que vào kho tiếp.' },
  { id: 'kho-trung', name: 'Trứng kho nước tương', minutes: 25, kcal: 220, protein: 16, tags: ['kho'], items: [['trung', 3], ['nuocTuong', 0.05]], steps: 'Trứng luộc bóc vỏ, kho với nước tương đường 15 phút.' },
  { id: 'kho-dui-ga', name: 'Đùi gà kho tiêu', minutes: 35, kcal: 330, protein: 28, tags: ['kho'], items: [['duiGa', 0.2], ['tieu', 0.2], ['nuocMam', 0.04]], steps: 'Gà khứa vài đường, ướp rồi kho đến khi nước sánh.' },

  // ---------------------------- Luộc / hấp ----------------------------
  { id: 'luoc-thit', name: 'Thịt heo luộc chấm mắm', minutes: 25, kcal: 280, protein: 26, tags: ['luoc'], items: [['baChi', 0.15], ['rauMuong', 0.5]], steps: 'Luộc thịt 20 phút, vớt ra thái lát, luộc rau cùng nước.' },
  { id: 'luoc-ga', name: 'Gà luộc lá chanh', minutes: 30, kcal: 300, protein: 30, tags: ['luoc'], items: [['duiGa', 0.2]], steps: 'Luộc gà với gừng hành 25 phút, chặt miếng chấm muối tiêu.' },
  { id: 'hap-ca', name: 'Cá basa hấp gừng', minutes: 20, kcal: 240, protein: 26, tags: ['hap'], items: [['caBas', 0.18], ['gung', 0.03], ['hanhLa', 0.2]], steps: 'Cá ướp gừng, hấp 12 phút, rưới nước mắm.' },
  { id: 'hap-tom', name: 'Tôm hấp sả', minutes: 15, kcal: 200, protein: 28, tags: ['hap'], items: [['tom', 0.12], ['sa', 0.2]], steps: 'Tôm rửa sạch, hấp cùng sả 8 phút.' },
  { id: 'luoc-rau-muong', name: 'Rau muống luộc', minutes: 10, kcal: 80, protein: 3, tags: ['luoc', 'chay'], items: [['rauMuong', 0.7]], steps: 'Luộc rau 2 phút, vớt ra ăn với nước mắm tỏi.' },
  { id: 'luoc-bap-cai', name: 'Bắp cải luộc chấm trứng', minutes: 15, kcal: 150, protein: 10, tags: ['luoc'], items: [['bapCai', 0.3], ['trung', 1]], steps: 'Luộc bắp cải thái lá, ăn cùng trứng luộc.' },
  { id: 'hap-dau-hu', name: 'Đậu hũ hấp tôm', minutes: 20, kcal: 210, protein: 20, tags: ['hap'], items: [['dauHu', 2], ['tom', 0.05]], steps: 'Đậu hũ cắt khối, đặt tôm lên, hấp 12 phút.' },
  { id: 'luoc-khoai', name: 'Khoai lang luộc', minutes: 20, kcal: 200, protein: 4, tags: ['luoc', 'chay'], items: [['khoaiLang', 0.25]], steps: 'Rửa sạch luộc 15 phút, ăn nóng.' },
  { id: 'hap-bi-do', name: 'Bí đỏ hấp', minutes: 20, kcal: 160, protein: 3, tags: ['hap', 'chay'], items: [['biDo', 0.25]], steps: 'Bí gọt vỏ thái miếng, hấp 15 phút.' },
  { id: 'luoc-cai-thao', name: 'Cải thảo luộc thịt', minutes: 25, kcal: 240, protein: 20, tags: ['luoc'], items: [['caiThao', 0.4], ['thitHeo', 0.1]], steps: 'Luộc thịt rồi dùng nước luộc cải thảo.' },
  { id: 'hap-muc', name: 'Mực hấp gừng', minutes: 20, kcal: 210, protein: 28, tags: ['hap'], items: [['muc', 0.15], ['gung', 0.03]], steps: 'Mực làm sạch, hấp cùng gừng 10 phút.' },
  { id: 'luoc-trung', name: 'Trứng luộc rau củ', minutes: 15, kcal: 220, protein: 15, tags: ['luoc'], items: [['trung', 2], ['caRot', 0.1]], steps: 'Luộc trứng và cà rốt 10 phút, ăn kèm muối tiêu.' },

  // ------------------------------ Chiên ------------------------------
  { id: 'chien-trung', name: 'Trứng chiên hành', minutes: 10, kcal: 240, protein: 16, tags: ['chien'], items: [['trung', 2], ['hanhLa', 0.2]], steps: 'Đập trứng, thêm hành lá, chiên vàng hai mặt.' },
  { id: 'chien-ca-basa', name: 'Cá basa chiên giòn', minutes: 20, kcal: 320, protein: 26, tags: ['chien'], items: [['caBas', 0.18], ['dauAn', 0.05]], steps: 'Cá ướp tiêu muối, chiên ngập dầu đến vàng.' },
  { id: 'chien-dau-hu', name: 'Đậu hũ chiên sả', minutes: 20, kcal: 250, protein: 18, tags: ['chien', 'chay'], items: [['dauHu', 2], ['sa', 0.2]], steps: 'Đậu hũ thái miếng chiên vàng, xóc với sả rang.' },
  { id: 'chien-ga', name: 'Gà chiên nước mắm', minutes: 30, kcal: 380, protein: 30, tags: ['chien'], items: [['duiGa', 0.2], ['nuocMam', 0.04]], steps: 'Gà chiên vàng rồi áo nước mắm đường sền sệt.' },
  { id: 'chien-ca-nuc', name: 'Cá nục chiên', minutes: 20, kcal: 310, protein: 28, tags: ['chien'], items: [['caNuc', 0.18], ['dauAn', 0.05]], steps: 'Cá khứa, ướp muối tiêu rồi chiên giòn.' },
  { id: 'chien-trung-thit', name: 'Trứng chiên thịt băm', minutes: 15, kcal: 300, protein: 22, tags: ['chien'], items: [['trung', 2], ['thitHeo', 0.06]], steps: 'Thịt băm xào sơ, đổ trứng vào chiên chín.' },
  { id: 'chien-khoai', name: 'Khoai tây chiên', minutes: 20, kcal: 280, protein: 4, tags: ['chien'], items: [['khoaiTay', 0.2], ['dauAn', 0.05]], steps: 'Khoai thái que, chiên ngập dầu đến vàng.' },
  { id: 'chien-dau-que', name: 'Đậu que chiên trứng', minutes: 20, kcal: 260, protein: 15, tags: ['chien'], items: [['dauQue', 0.15], ['trung', 2]], steps: 'Đậu que chần sơ rồi chiên cùng trứng.' },
  { id: 'chien-tom', name: 'Tôm chiên bột', minutes: 25, kcal: 290, protein: 24, tags: ['chien'], items: [['tom', 0.12], ['dauAn', 0.05]], steps: 'Tôm lăn bột chiên vàng, ăn kèm rau sống.' },
  { id: 'chien-cha-ca', name: 'Chả cá chiên', minutes: 20, kcal: 260, protein: 24, tags: ['chien'], items: [['caBas', 0.15], ['trung', 1]], steps: 'Cá xay trộn trứng và tiêu, nặn miếng chiên vàng.' },
  { id: 'chien-suon', name: 'Sườn chiên mắm', minutes: 30, kcal: 420, protein: 26, tags: ['chien'], items: [['suon', 0.15], ['nuocMam', 0.04]], steps: 'Sườn hầm sơ rồi chiên, áo nước mắm đường.' },
  { id: 'chien-cam', name: 'Bí đỏ chiên trứng', minutes: 20, kcal: 230, protein: 12, tags: ['chien'], items: [['biDo', 0.2], ['trung', 2]], steps: 'Bí thái lát, lăn bột, chiên với trứng.' },

  // --------------------------- Cháo / Mì / Bún ---------------------------
  { id: 'chao-ga', name: 'Cháo gà đậu xanh', minutes: 40, kcal: 280, protein: 22, tags: ['chao'], items: [['gao', 0.08], ['duiGa', 0.12], ['dauXanh', 0.03]], steps: 'Nấu cháo với đậu xanh, gần chín cho gà đã xé vào.' },
  { id: 'chao-ca', name: 'Cháo cá lóc', minutes: 40, kcal: 260, protein: 24, tags: ['chao'], items: [['gao', 0.08], ['caLoc', 0.15], ['hanhLa', 0.2]], steps: 'Nấu cháo trắng rồi cho cá lóc đã gỡ xương vào.' },
  { id: 'chao-thit', name: 'Cháo thịt băm', minutes: 35, kcal: 250, protein: 18, tags: ['chao'], items: [['gao', 0.08], ['thitHeo', 0.07]], steps: 'Nấu cháo, thêm thịt băm đã xào vào, nêm nếm.' },
  { id: 'chao-dau-den', name: 'Cháo đậu đen', minutes: 45, kcal: 220, protein: 10, tags: ['chao', 'chay'], items: [['gao', 0.07], ['dauDen', 0.05]], steps: 'Ngâm đậu đen 3 tiếng, nấu cháo cùng gạo đến mềm.' },
  { id: 'mi-tron', name: 'Mì gói trộn trứng', minutes: 10, kcal: 380, protein: 15, tags: ['mi'], items: [['miGoi', 1], ['trung', 1], ['hanhLa', 0.2]], steps: 'Luộc mì, trộn gói gia vị, thêm trứng luộc.' },
  { id: 'mi-xao', name: 'Mì xào rau củ', minutes: 15, kcal: 400, protein: 12, tags: ['mi'], items: [['miGoi', 1], ['bapCai', 0.2], ['caRot', 0.1]], steps: 'Mì luộc sơ, xào cùng rau củ và nêm nếm.' },
  { id: 'bun-rieu', name: 'Bún riêu cua', minutes: 40, kcal: 320, protein: 20, tags: ['bun'], items: [['bun', 0.25], ['tom', 0.06], ['caChua', 0.1]], steps: 'Nấu nước riêu từ tôm giã, thêm cà chua, chan với bún.' },
  { id: 'bun-thit', name: 'Bún thịt nướng', minutes: 35, kcal: 420, protein: 24, tags: ['bun'], items: [['bun', 0.25], ['thitHeo', 0.12], ['rauMuong', 0.3]], steps: 'Thịt ướp sả nướng, bày cùng bún và rau sống.' },
  { id: 'pho-bo', name: 'Phở bò nhanh', minutes: 25, kcal: 400, protein: 26, tags: ['pho'], items: [['pho', 0.25], ['thitBo', 0.1], ['hanhLa', 0.2]], steps: 'Nấu nước dùng gừng hành, trụng phở và bò tái.' },
  { id: 'pho-ga', name: 'Phở gà', minutes: 35, kcal: 380, protein: 25, tags: ['pho'], items: [['pho', 0.25], ['duiGa', 0.12], ['hanhLa', 0.2]], steps: 'Nấu nước dùng từ gà, xé thịt chan với phở.' },

  // --------------------------- Món trứng / đậu ---------------------------
  { id: 'trung-hap', name: 'Trứng hấp thịt băm', minutes: 20, kcal: 260, protein: 22, tags: ['hap'], items: [['trung', 2], ['thitHeo', 0.06]], steps: 'Đánh trứng với thịt băm, hấp 12 phút.' },
  { id: 'dau-hu-sot-ca', name: 'Đậu hũ sốt cà', minutes: 25, kcal: 240, protein: 18, tags: ['chay'], items: [['dauHu', 2], ['caChua', 0.15]], steps: 'Đậu hũ chiên, sốt cà chua nêm chua ngọt rồi rim.' },
  { id: 'dau-hu-nhoi-thit', name: 'Đậu hũ nhồi thịt', minutes: 30, kcal: 300, protein: 24, tags: [], items: [['dauHu', 2], ['thitHeo', 0.08]], steps: 'Đậu hũ khoét giữa nhồi thịt, đem hấp hoặc chiên.' },
  { id: 'trung-sot-ca', name: 'Trứng sốt cà chua', minutes: 20, kcal: 250, protein: 16, tags: ['chien'], items: [['trung', 2], ['caChua', 0.15]], steps: 'Trứng chiên áo, sốt cà chua rồi rim 5 phút.' },
  { id: 'dau-xanh-ham', name: 'Đậu xanh hầm dừa', minutes: 40, kcal: 260, protein: 12, tags: ['chay'], items: [['dauXanh', 0.08], ['duong', 0.03]], steps: 'Đậu xanh nấu nhừ, thêm đường và chút nước cốt dừa.' },
  { id: 'tau-hu-ky', name: 'Tàu hũ ky chiên sả', minutes: 20, kcal: 260, protein: 20, tags: ['chien', 'chay'], items: [['tauHuKy', 1], ['sa', 0.2]], steps: 'Ngâm tàu hũ ky mềm, chiên vàng cùng sả.' },
  { id: 'dau-hu-hap', name: 'Đậu hũ hấp nấm hương', minutes: 20, kcal: 200, protein: 17, tags: ['hap', 'chay'], items: [['dauHu', 2], ['namKimCham', 0.4]], steps: 'Đậu hũ hấp cùng nấm, rưới nước tương.' },
  { id: 'trung-chung', name: 'Trứng chưng thịt', minutes: 25, kcal: 270, protein: 24, tags: ['hap'], items: [['trung', 2], ['thitHeo', 0.07]], steps: 'Trộn trứng thịt băm, chưng cách thủy 15 phút.' },

  // ------------------------------- Khác -------------------------------
  { id: 'goi-rau', name: 'Gỏi rau muống tôm', minutes: 20, kcal: 180, protein: 16, tags: ['goi'], items: [['rauMuong', 0.4], ['tom', 0.06]], steps: 'Rau muống chẻ sợi, trộn tôm luộc với nước mắm chua ngọt.' },
  { id: 'goi-dua', name: 'Gỏi dưa leo', minutes: 15, kcal: 120, protein: 5, tags: ['goi', 'chay'], items: [['duaLeo', 0.2], ['lac', 0.03]], steps: 'Dưa leo thái lát, trộn nước mắm đường và đậu phộng rang.' },
  { id: 'salad-cai', name: 'Nộm cải xanh', minutes: 15, kcal: 130, protein: 6, tags: ['goi', 'chay'], items: [['caiXanh', 0.3], ['lac', 0.02]], steps: 'Cải thái sợi muối sơ, trộn chua ngọt, rắc đậu phộng.' },
  { id: 'trung-op-la', name: 'Trứng ốp la bánh mì', minutes: 10, kcal: 380, protein: 16, tags: ['sang'], items: [['trung', 2], ['banhMi', 1], ['duaLeo', 0.05]], steps: 'Chiên trứng ốp la, ăn kèm bánh mì và dưa leo.' },
  { id: 'banh-mi-trung', name: 'Bánh mì trứng', minutes: 10, kcal: 350, protein: 15, tags: ['sang'], items: [['banhMi', 1], ['trung', 1], ['hanhLa', 0.1]], steps: 'Kẹp trứng chiên hành vào bánh mì.' },
  { id: 'bap-luoc', name: 'Bắp luộc', minutes: 20, kcal: 180, protein: 5, tags: ['sang', 'chay'], items: [['bap', 1]], steps: 'Luộc bắp 15 phút, ăn nóng.' },
  { id: 'khoai-lang-nuong', name: 'Khoai lang hấp', minutes: 25, kcal: 190, protein: 4, tags: ['sang', 'chay'], items: [['khoaiLang', 0.25]], steps: 'Hấp khoai lang 20 phút.' },
  { id: 'sua-chuoi', name: 'Sinh tố chuối', minutes: 5, kcal: 220, protein: 6, tags: ['sang'], items: [['chuoi', 0.3], ['duong', 0.02]], steps: 'Xay chuối với nước và chút đường.' },
  { id: 'trung-xao-cai', name: 'Trứng xào cải', minutes: 15, kcal: 230, protein: 16, tags: ['xao'], items: [['trung', 2], ['caiXanh', 0.3]], steps: 'Xào cải xanh rồi đổ trứng vào đảo đều.' },
  { id: 'ca-hap-xiu', name: 'Cá hấp xì dầu', minutes: 25, kcal: 240, protein: 26, tags: ['hap'], items: [['caRo', 0.18], ['nuocTuong', 0.04], ['gung', 0.02]], steps: 'Cá hấp 12 phút, rưới xì dầu và gừng phi.' },
  { id: 'thit-nuong', name: 'Thịt heo nướng sả', minutes: 30, kcal: 340, protein: 24, tags: ['nuong'], items: [['thitHeo', 0.12], ['sa', 0.2]], steps: 'Thịt ướp sả mật ong, nướng hoặc áp chảo vàng.' },
  { id: 'ga-nuong', name: 'Gà nướng muối ớt', minutes: 35, kcal: 360, protein: 30, tags: ['nuong'], items: [['duiGa', 0.2], ['ot', 0.01]], steps: 'Gà ướp muối ớt, nướng vừa chín.' },
  { id: 'ca-nuong', name: 'Cá nục nướng giấy bạc', minutes: 25, kcal: 300, protein: 28, tags: ['nuong'], items: [['caNuc', 0.18], ['hanhLa', 0.2]], steps: 'Cá ướp gia vị, gói giấy bạc nướng 15 phút.' },
  { id: 'dau-hu-nuong', name: 'Đậu hũ nướng sa tế', minutes: 20, kcal: 210, protein: 18, tags: ['nuong', 'chay'], items: [['dauHu', 2], ['ot', 0.01]], steps: 'Đậu hũ ướp sa tế, nướng hoặc áp chảo.' },
  { id: 'rau-hap', name: 'Rau củ hấp', minutes: 20, kcal: 140, protein: 5, tags: ['hap', 'chay'], items: [['bongCai', 0.2], ['caRot', 0.1], ['dauQue', 0.1]], steps: 'Hấp rau củ 12 phút, chấm nước mắm chua ngọt.' },
  { id: 'chao-yen', name: 'Cháo yến mạch trứng', minutes: 15, kcal: 240, protein: 14, tags: ['sang'], items: [['gao', 0.05], ['trung', 1], ['chuoi', 0.2]], steps: 'Nấu gạo nhừ, thêm trứng và chuối thái lát.' },
  { id: 'bun-tron', name: 'Bún trộn chay', minutes: 20, kcal: 350, protein: 12, tags: ['bun', 'chay'], items: [['bun', 0.25], ['caRot', 0.08], ['duaLeo', 0.1], ['lac', 0.02]], steps: 'Bún trộn rau củ thái sợi, nước trộn chua ngọt.' },
  { id: 'com-tam', name: 'Cơm tấm sườn nướng', minutes: 35, kcal: 480, protein: 26, tags: ['com'], items: [['gao', 0.1], ['suon', 0.15], ['duaLeo', 0.05]], steps: 'Sườn ướp nướng, ăn kèm cơm và dưa leo.' },
  { id: 'com-ga', name: 'Cơm gà xé', minutes: 35, kcal: 460, protein: 28, tags: ['com'], items: [['gao', 0.1], ['duiGa', 0.15]], steps: 'Gà luộc xé, trộn cơm với nước mắm chanh.' },
  { id: 'com-chien', name: 'Cơm chiên trứng', minutes: 15, kcal: 420, protein: 14, tags: ['com'], items: [['gao', 0.1], ['trung', 2], ['hanhLa', 0.2]], steps: 'Cơm nguội chiên với trứng và hành lá.' },
  { id: 'com-chien-thit', name: 'Cơm chiên thịt băm', minutes: 20, kcal: 460, protein: 20, tags: ['com'], items: [['gao', 0.1], ['thitHeo', 0.07], ['trung', 1]], steps: 'Xào thịt băm rồi cho cơm trứng vào chiên.' },
  { id: 'canh-chua-tom', name: 'Canh chua tôm nấm', minutes: 25, kcal: 210, protein: 18, tags: ['canh', 'chua'], items: [['tom', 0.07], ['namKimCham', 0.4], ['me', 0.15]], steps: 'Nấu nước me, thả tôm và nấm, nêm chua cay.' },
  { id: 'canh-bi-dao-thit', name: 'Canh bí đao thịt băm', minutes: 25, kcal: 200, protein: 17, tags: ['canh'], items: [['biDao', 0.2], ['thitHeo', 0.07]], steps: 'Bí đao nấu cùng thịt băm 15 phút.' },
  { id: 'thit-ram', name: 'Thịt ram mặn ngọt', minutes: 40, kcal: 380, protein: 26, tags: ['kho'], items: [['baChi', 0.15], ['nuocMam', 0.04], ['duong', 0.02]], steps: 'Thịt thái miếng ram lửa nhỏ đến khi săn vàng.' },
  { id: 'ga-kho-sa', name: 'Gà kho sả ớt', minutes: 35, kcal: 350, protein: 28, tags: ['kho'], items: [['duiGa', 0.2], ['sa', 0.2], ['ot', 0.01]], steps: 'Gà ướp sả ớt rồi kho lửa nhỏ 25 phút.' },
  { id: 'ca-kho-to', name: 'Cá lóc kho tộ', minutes: 35, kcal: 310, protein: 28, tags: ['kho'], items: [['caLoc', 0.18], ['nuocMam', 0.04]], steps: 'Cá lóc khứa, ướp rồi kho tộ với tiêu.' },
  { id: 'dau-bap-luoc', name: 'Đậu bắp luộc', minutes: 10, kcal: 90, protein: 4, tags: ['luoc', 'chay'], items: [['dauBap', 0.2]], steps: 'Luộc đậu bắp 5 phút, chấm nước mắm tỏi.' },
  { id: 'muop-xao', name: 'Mướp xào tôm khô', minutes: 15, kcal: 160, protein: 10, tags: ['xao'], items: [['muop', 0.25], ['tom', 0.04]], steps: 'Xào mướp với tôm khô, nêm vừa ăn.' },
  { id: 'rau-cu-luoc', name: 'Rau củ luộc chấm kho quẹt', minutes: 20, kcal: 170, protein: 5, tags: ['luoc', 'chay'], items: [['caiXanh', 0.3], ['caRot', 0.1], ['biDao', 0.15]], steps: 'Luộc rau củ, pha nước chấm mặn ngọt.' },
  { id: 'trung-cuon', name: 'Trứng cuộn rau', minutes: 15, kcal: 240, protein: 17, tags: ['chien'], items: [['trung', 2], ['caRot', 0.05], ['hanhLa', 0.2]], steps: 'Đánh trứng với rau thái nhỏ, tráng mỏng rồi cuộn.' },
  { id: 'ca-sot-ca', name: 'Cá basa sốt cà', minutes: 30, kcal: 290, protein: 26, tags: ['kho'], items: [['caBas', 0.18], ['caChua', 0.15]], steps: 'Cá chiên sơ, sốt cà chua rim 10 phút.' },
  { id: 'uc-ga-ap-chao', name: 'Ức gà áp chảo', minutes: 20, kcal: 240, protein: 32, tags: ['chien'], items: [['ucGa', 0.15], ['dauAn', 0.02]], steps: 'Ức gà ướp tiêu, áp chảo mỗi mặt 4 phút.' },
  { id: 'thit-bo-xao', name: 'Bò xào hành tây', minutes: 20, kcal: 320, protein: 26, tags: ['xao'], items: [['thitBo', 0.12], ['hanhTay', 0.05]], steps: 'Bò thái lát xào nhanh với hành tây và tiêu.' },
  { id: 'dau-hu-chien-sa', name: 'Đậu hũ chiên sả ớt', minutes: 20, kcal: 250, protein: 18, tags: ['chien', 'chay'], items: [['dauHu', 2], ['sa', 0.2], ['ot', 0.01]], steps: 'Đậu hũ chiên vàng, xóc sả ớt rang.' },
  { id: 'com-nep-xoi', name: 'Xôi đậu phộng', minutes: 40, kcal: 400, protein: 12, tags: ['sang', 'chay'], items: [['gaoNep', 0.1], ['lac', 0.03]], steps: 'Ngâm nếp, đồ chín cùng đậu phộng.' },
  { id: 'banh-mi-thit', name: 'Bánh mì thịt nướng', minutes: 25, kcal: 420, protein: 20, tags: ['sang'], items: [['banhMi', 1], ['thitHeo', 0.08], ['duaLeo', 0.05]], steps: 'Thịt nướng kẹp bánh mì cùng dưa leo.' },
  { id: 'chao-tom', name: 'Cháo tôm bí đỏ', minutes: 35, kcal: 250, protein: 20, tags: ['chao'], items: [['gao', 0.07], ['tom', 0.06], ['biDo', 0.1]], steps: 'Nấu cháo với bí đỏ, thêm tôm đã xào chín.' },
  { id: 'canh-rua', name: 'Canh rong biển đậu hũ', minutes: 20, kcal: 160, protein: 12, tags: ['canh', 'chay'], items: [['dauHu', 1], ['caiCuc', 0.3]], steps: 'Nấu nước sôi cho đậu hũ và rau vào, nêm nhẹ.' },
];

/** Tính tiền nguyên liệu cho một món (đã nhân số người). */
export function priceOf(key, prices = {}) {
  const override = Number(prices?.[key]);
  if (Number.isFinite(override) && override > 0) return override;
  return INGREDIENTS[key]?.price || 0;
}

export function dishCost(dish, people = 1, prices = {}) {
  return dish.items.reduce((sum, [key, qty]) => {
    if (!INGREDIENTS[key]) return sum;
    return sum + priceOf(key, prices) * qty * people;
  }, 0);
}

export const MEAL_TAG_LABEL = {
  canh: 'Canh',
  xao: 'Món xào',
  kho: 'Món kho',
  luoc: 'Luộc',
  hap: 'Hấp',
  chien: 'Chiên',
  chao: 'Cháo',
  mi: 'Mì',
  bun: 'Bún',
  pho: 'Phở',
  com: 'Cơm',
  goi: 'Gỏi',
  sang: 'Bữa sáng',
  nuong: 'Nướng',
  chay: 'Món chay',
  chua: 'Vị chua',
};

/* ------------------------------------------------------------------------- */
/*                            Lập thực đơn & đi chợ                           */
/* ------------------------------------------------------------------------- */

export const DAY_PRESETS = [3, 5, 7, 10, 14];

/** Làm tròn số lượng mua cho dễ đi chợ (kg chẵn 100g, còn lại mua nguyên đơn vị). */
const UNIT_STEP = {
  kg: 0.1,
  'lít': 0.1,
  bó: 1,
  'cái': 1,
  'cây': 1,
  'miếng': 1,
  'quả': 1,
  'gói': 1,
  'chai': 1,
  'trái': 1,
  'nải': 1,
  'ổ': 1,
};

export function roundPurchase(qty, unit) {
  const step = UNIT_STEP[unit] || 1;
  const rounded = Math.ceil(qty / step) * step;
  return Number(rounded.toFixed(2));
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

function shuffle(list, seed) {
  const random = seededRandom(seed);
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

const PROTEIN_GROUPS = {
  thitHeo: 'heo',
  baChi: 'heo',
  suon: 'heo',
  thitBo: 'bo',
  ucGa: 'ga',
  duiGa: 'ga',
  caBas: 'ca',
  caRo: 'ca',
  caNuc: 'ca',
  caLoc: 'ca',
  tom: 'hai-san',
  muc: 'hai-san',
  trung: 'trung',
  dauHu: 'dau',
  tauHuKy: 'dau',
  dauXanh: 'dau',
  dauDen: 'dau',
};

/** Nhóm đạm chính của món, để thực đơn không lặp thịt mỗi ngày. */
function proteinGroup(dish) {
  for (const [key] of dish.items) {
    const group = PROTEIN_GROUPS[key];
    if (group) return group;
  }
  return 'khac';
}

/**
 * Lập thực đơn: chọn `days` món, không lặp nhóm đạm liên tiếp, tổng tiền nằm
 * trong ngân sách, rồi gộp nguyên liệu thành một danh sách đi chợ duy nhất.
 */
/** Món mặn: có đạm, không phải canh, không phải bữa sáng. */
export function isMainDish(dish) {
  const savory = ['kho', 'xao', 'chien', 'hap', 'luoc', 'nuong'];
  if (dish.tags.includes('canh')) return false;
  if (dish.tags.includes('sang')) return false;
  if (!dish.tags.some((tag) => savory.includes(tag))) return false;
  return dish.protein >= 10;
}

/** Món canh. */
export function isSoupDish(dish) {
  return dish.tags.includes('canh');
}

/** Định lượng từng nguyên liệu của món cho số người ăn. */
export function dishIngredients(dish, people = 1, prices = {}) {
  return dish.items.map(([key, qty]) => {
    const ingredient = INGREDIENTS[key];
    const amount = qty * people;
    return {
      key,
      name: ingredient.name,
      unit: ingredient.unit,
      amount,
      display: formatAmount(amount, ingredient.unit),
      cost: priceOf(key, prices) * amount,
    };
  });
}

/** Đổi số lượng sang đơn vị dễ đọc khi nấu: kg → g, lít → ml. */
function formatAmount(amount, unit) {
  if (unit === 'kg') return `${Math.round(amount * 1000)}g`;
  if (unit === 'lít') return `${Math.round(amount * 1000)}ml`;
  if (amount >= 1) return `${Number(amount.toFixed(1))} ${unit}`;
  return `${Math.round(amount * 100) / 100} ${unit}`;
}

/** Các bước nấu: sơ chế (kèm định lượng) → cách làm → hoàn thiện. */
export function recipeSteps(dish, people = 1) {
  const prep = dishIngredients(dish, people)
    .map((item) => `${item.name} ${item.display}`)
    .join(', ');
  return [
    `Sơ chế: chuẩn bị ${prep}. Rửa sạch, cắt miếng vừa ăn.`,
    dish.steps,
    `Nấu khoảng ${dish.minutes} phút. Nêm nếm vừa ăn, tắt bếp và dọn ra đĩa.`,
  ];
}

function withCost(list, people, prices) {
  return list.map((dish) => ({
    ...dish,
    cost: dishCost(dish, people, prices),
    group: proteinGroup(dish),
  }));
}

/**
 * Chọn danh sách món: xoay vòng theo nhóm đạm để bữa ăn không lặp,
 * thiếu món thì lặp lại từ đầu danh sách đã sắp theo giá.
 */
function pickRotating(pool, count, seed) {
  if (!pool.length) return [];
  const shuffled = shuffle(pool, seed).sort((a, b) => a.cost - b.cost);
  const buckets = new Map();
  for (const dish of shuffled) {
    const key = dish.group || 'khac';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(dish);
  }
  const queues = [...buckets.values()];
  const picked = [];
  let round = 0;
  while (picked.length < count) {
    let progressed = false;
    for (const queue of queues) {
      if (!queue[round]) continue;
      picked.push(queue[round]);
      progressed = true;
      if (picked.length >= count) break;
    }
    if (!progressed) break;
    round += 1;
  }
  let index = 0;
  while (picked.length < count && shuffled.length) {
    picked.push(shuffled[index % shuffled.length]);
    index += 1;
  }
  return picked;
}

/**
 * Lập thực đơn 2 bữa mỗi ngày (trưa và tối), mỗi bữa 1 món mặn + 1 món canh.
 * Tổng tiền nguyên liệu nằm trong ngân sách; nguyên liệu gộp thành một lần đi chợ.
 */
export function buildMealPlan({ days = 7, budget = 700000, people = 1, seed = 0, prices = {} }) {
  const safeDays = Math.max(1, Math.min(14, Number(days) || 7));
  const safePeople = Math.max(1, Math.min(6, Number(people) || 1));
  const safeBudget = Math.max(100000, Number(budget) || 700000);
  const perDayBudget = safeBudget / safeDays;
  const needed = safeDays * 2; // 2 bữa mỗi ngày

  const mains = withCost(DISHES.filter(isMainDish), safePeople, prices);
  const soups = withCost(DISHES.filter(isSoupDish), safePeople, prices);

  // Chia tiền mỗi ngày: món mặn ~ 2/3, canh ~ 1/3 để bữa ăn cân đối.
  const mainBudget = perDayBudget * 0.6;
  const soupBudget = perDayBudget * 0.3;

  const affordableMains = mains.filter((dish) => dish.cost <= mainBudget);
  const affordableSoups = soups.filter((dish) => dish.cost <= soupBudget);

  const mainPicks = pickRotating(
    affordableMains.length >= needed ? affordableMains : mains,
    needed,
    seed * 7 + 1
  );
  const soupPicks = pickRotating(
    affordableSoups.length >= needed ? affordableSoups : soups,
    needed,
    seed * 11 + 3
  );

  const meals = [];
  for (let index = 0; index < safeDays; index += 1) {
    meals.push({
      day: index + 1,
      lunch: { main: mainPicks[index * 2], soup: soupPicks[index * 2] },
      dinner: { main: mainPicks[index * 2 + 1], soup: soupPicks[index * 2 + 1] },
    });
  }

  // Mọi món được nấu trong kế hoạch (giữ thứ tự để hiển thị và tính tiền).
  const allDishes = meals.flatMap((meal) => [
    meal.lunch.main,
    meal.lunch.soup,
    meal.dinner.main,
    meal.dinner.soup,
  ]);

  // Vượt ngân sách: đổi món mặn đắt nhất sang món mặn rẻ hơn chưa dùng.
  let total = allDishes.reduce((sum, dish) => sum + dish.cost, 0);
  let guard = 0;
  while (total > safeBudget && guard < 60) {
    guard += 1;
    const worst = [...allDishes].filter(Boolean).sort((a, b) => b.cost - a.cost)[0];
    if (!worst) break;
    const replacement = mains
      .filter((dish) => dish.cost < worst.cost && !allDishes.includes(dish))
      .sort((a, b) => a.cost - b.cost)[0];
    if (!replacement) break;
    const position = allDishes.indexOf(worst);
    allDishes[position] = replacement;
    total = allDishes.reduce((sum, dish) => sum + dish.cost, 0);
  }

  // Gộp nguyên liệu: cộng cả gạo cho 2 bữa mỗi ngày.
  const RICE_PER_PERSON_DAY = 0.2;
  const quantities = new Map([['gao', RICE_PER_PERSON_DAY * safeDays * safePeople]]);
  for (const dish of allDishes) {
    if (!dish) continue;
    for (const [key, qty] of dish.items) {
      quantities.set(key, (quantities.get(key) || 0) + qty * safePeople);
    }
  }

  const shopping = [...quantities.entries()]
    .map(([key, qty]) => {
      const ingredient = INGREDIENTS[key];
      const buyQty = roundPurchase(qty, ingredient.unit);
      return {
        key,
        name: ingredient.name,
        unit: ingredient.unit,
        group: ingredient.group,
        qty: buyQty,
        pricePerUnit: priceOf(key, prices),
        cost: buyQty * priceOf(key, prices),
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group) || b.cost - a.cost);

  const estimate = shopping.reduce((sum, item) => sum + item.cost, 0);
  const riceKcal = RICE_PER_PERSON_DAY * safeDays * safePeople * 3500;
  const riceProtein = RICE_PER_PERSON_DAY * safeDays * safePeople * 70;
  const kcalTotal = allDishes.reduce((sum, dish) => sum + (dish?.kcal || 0), 0) * safePeople + riceKcal;
  const proteinTotal =
    allDishes.reduce((sum, dish) => sum + (dish?.protein || 0), 0) * safePeople + riceProtein;

  return {
    days: safeDays,
    people: safePeople,
    budget: safeBudget,
    perDayBudget,
    meals,
    dishCount: allDishes.filter(Boolean).length,
    shopping,
    estimate,
    dishCostTotal: Math.round(total),
    kcalPerDay: Math.round(kcalTotal / safeDays),
    proteinPerDay: Math.round(proteinTotal / safeDays),
    withinBudget: estimate <= safeBudget,
    savedAmount: Math.max(0, safeBudget - estimate),
  };
}

/** So sánh tiền thực mua với dự toán. */
export function compareShopping(estimate, actual) {
  const spent = Number(actual);
  if (!Number.isFinite(spent) || spent <= 0) return null;
  const diff = estimate - spent;
  return {
    spent,
    estimate,
    diff,
    percent: estimate > 0 ? Math.round((Math.abs(diff) / estimate) * 100) : 0,
    cheaper: diff > 0,
    cheaperAmount: Math.max(0, diff),
    overAmount: Math.max(0, -diff),
  };
}