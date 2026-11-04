import { RECIPES_BATCH_1 } from './recipes-batch1.js';
import { RECIPES_BATCH_2 } from './recipes-batch2.js';
import { RECIPES_BATCH_3 } from './recipes-batch3.js';

/**
 * Công thức viết tay cho 30 món phổ biến nhất.
 *
 * Khác với phần "cách nấu" tự sinh: ở đây có định lượng gia vị cụ thể (thìa canh,
 * thìa cà phê), thời gian từng bước và mẹo thực tế. Liều lượng tính cho 1 người ăn,
 * nhân theo số người khi nấu.
 *
 * Quy ước: 1 thìa canh ≈ 15ml, 1 thìa cà phê ≈ 5ml. Nước mắm loại 30 độ đạm.
 */
const CORE_RECIPES = {
  /* --------------------------------- Canh --------------------------------- */
  'canh-cai-thit': {
    prepMinutes: 10,
    cookMinutes: 15,
    seasoning: [
      'Nước mắm 1 thìa canh',
      'Muối 1/3 thìa cà phê',
      'Tiêu 1/4 thìa cà phê',
      'Hành tím 1 củ băm',
      'Dầu ăn 1 thìa cà phê',
    ],
    steps: [
      'Thịt nạc dăm 80g rửa sạch, băm nhuyễn. Ướp với 1/3 thìa cà phê muối, 1/4 thìa cà phê tiêu, 1 củ hành tím băm trong 10 phút.',
      'Cải xanh 300g nhặt bỏ lá sâu, rửa 2–3 nước, cắt khúc 4–5cm.',
      'Bắc nồi, cho 1 thìa cà phê dầu ăn, xào thịt băm 2 phút cho săn rồi thêm 700ml nước.',
      'Đun sôi, vớt bọt, cho cải vào nấu 3–4 phút đến khi cải chín nhưng vẫn xanh.',
      'Nêm 1 thìa canh nước mắm, khuấy đều, nếm lại. Tắt bếp, rắc tiêu.',
    ],
    tip: 'Cho cải vào sau cùng để không dai. Canh ăn với cơm nên hơi mặn hơn một chút.',
  },
  'canh-rau-ngot': {
    prepMinutes: 8,
    cookMinutes: 7,
    seasoning: ['Nước mắm 2/3 thìa canh', 'Muối 1/4 thìa cà phê', 'Hành tím 1 củ băm'],
    steps: [
      'Thịt băm 60g ướp 1/4 thìa cà phê muối và hành tím băm.',
      'Rau ngót 250g tuốt lá (bỏ cành già), rửa sạch, vò nhẹ cho mềm.',
      'Đun 600ml nước sôi, thả thịt băm từng viên nhỏ, hớt bọt.',
      'Cho rau ngót vào nấu 2–3 phút, nêm 2/3 thìa canh nước mắm rồi tắt bếp.',
    ],
    tip: 'Rau ngót quá chín sẽ mất vị ngọt; nêm nước mắm sau khi rau chín để giữ màu xanh.',
  },
  'canh-mong-toi': {
    prepMinutes: 8,
    cookMinutes: 7,
    seasoning: ['Nước mắm 2/3 thìa canh', 'Muối 1/3 thìa cà phê', 'Dầu ăn 1 thìa cà phê'],
    steps: [
      'Tép tươi 40g rửa sạch, ướp chút muối.',
      'Mồng tơi 250g nhặt lá, rửa sạch, để ráo.',
      'Phi dầu với hành tím băm, xào tép 1 phút cho thơm.',
      'Thêm 600ml nước, đun sôi rồi cho mồng tơi vào, nấu 2 phút.',
      'Nêm 2/3 thìa canh nước mắm và 1/3 thìa cà phê muối, tắt bếp.',
    ],
    tip: 'Mồng tơi rất nhanh chín, chỉ nấu 2 phút để không bị nhão.',
  },
  'canh-bi-dao-tom': {
    prepMinutes: 10,
    cookMinutes: 15,
    seasoning: [
      'Nước mắm 1 thìa canh',
      'Đường 1/2 thìa cà phê',
      'Muối 1/3 thìa cà phê',
      'Hành lá 2 nhánh',
      'Dầu ăn 1 thìa cà phê',
    ],
    steps: [
      'Tôm 50g bóc vỏ, bỏ chỉ lưng, ướp 1/3 thìa cà phê muối.',
      'Bí đao 200g gọt vỏ, bỏ ruột, thái miếng dày 5mm.',
      'Xào tôm với 1 thìa cà phê dầu 1 phút, thêm 700ml nước đun sôi.',
      'Cho bí đao vào nấu 8–10 phút đến khi bí trong.',
      'Nêm nước mắm, đường vừa ăn; tắt bếp, rắc hành lá cắt nhỏ.',
    ],
    tip: 'Bí đao chín khi miếng bí trong nhẹ. Không nấu quá lâu vì bí sẽ mất vị ngọt.',
  },
  'canh-chua-ca': {
    prepMinutes: 15,
    cookMinutes: 20,
    seasoning: [
      'Nước mắm 2 thìa canh',
      'Đường 1 thìa canh',
      'Muối 1/3 thìa cà phê',
      'Me chua 1 gói (hoặc 2 thìa canh nước cốt me)',
      'Tỏi 2 tép băm',
      'Dầu ăn 1 thìa canh',
    ],
    steps: [
      'Cá basa 150g rửa với muối và gừng để khử mùi, cắt khúc.',
      'Cà chua 100g cắt múi cau; giá đỗ 100g rửa sạch; ngò 2 nhánh rửa sạch.',
      'Phi tỏi với dầu, cho cà chua vào xào mềm 3 phút cho ra màu.',
      'Thêm 800ml nước, nước me, 1 thìa canh đường; đun sôi rồi thả cá.',
      'Nấu 8 phút, cho giá đỗ vào 1 phút, nêm nước mắm vừa chua ngọt.',
      'Rắc ngò và vài lát ớt, tắt bếp.',
    ],
    tip: 'Cho cá vào nước đang sôi để cá không tanh. Nếm lại: vị chua trước, mặn sau, ngọt cuối.',
  },
  'canh-muop': {
    prepMinutes: 8,
    cookMinutes: 12,
    seasoning: ['Nước mắm 2/3 thìa canh', 'Muối 1/3 thìa cà phê', 'Hành lá 2 nhánh'],
    steps: [
      'Tôm 50g bóc vỏ, ướp muối. Mướp 200g gọt vỏ, cắt miếng chéo.',
      'Xào tôm với chút dầu 1 phút, thêm 600ml nước đun sôi.',
      'Cho mướp vào nấu 5–6 phút đến khi mướp trong và chín mềm.',
      'Nêm 2/3 thìa canh nước mắm, rắc hành lá.',
    ],
    tip: 'Mướp chín rất nhanh và ra nước; nấu lửa vừa để mướp không bị bở.',
  },
  'canh-bi-do': {
    prepMinutes: 10,
    cookMinutes: 18,
    seasoning: ['Nước mắm 2/3 thìa canh', 'Muối 1/3 thìa cà phê', 'Tiêu 1/4 thìa cà phê'],
    steps: [
      'Thịt băm 70g ướp muối, tiêu trong 5 phút.',
      'Bí đỏ 200g gọt vỏ, thái khối 2cm.',
      'Đun 700ml nước sôi, cho bí vào nấu 10 phút cho mềm.',
      'Cho thịt băm vào, dùng muôi tán nhẹ cho bí hơi nát để canh sánh tự nhiên.',
      'Nêm 2/3 thìa canh nước mắm, tắt bếp, rắc tiêu.',
    ],
    tip: 'Tán nhẹ bí giúp canh ngọt và sánh mà không cần thêm bột năng.',
  },
  'canh-cai-thao': {
    prepMinutes: 10,
    cookMinutes: 12,
    seasoning: ['Nước mắm 1 thìa canh', 'Muối 1/3 thìa cà phê', 'Hành tím 1 củ băm'],
    steps: [
      'Thịt băm 70g ướp muối và hành tím băm trong 5 phút.',
      'Cải thảo 300g cắt khúc 4cm, rửa sạch.',
      'Xào thịt băm 2 phút cho săn, thêm 700ml nước đun sôi.',
      'Cho cải thảo vào nấu 5 phút, nêm nước mắm rồi tắt bếp.',
    ],
    tip: 'Cải thảo ra nước nên canh sẽ ngọt tự nhiên; thêm nước vừa ăn ngay từ đầu.',
  },

  /* ---------------------------------- Xào ---------------------------------- */
  'xao-rau-muong': {
    prepMinutes: 8,
    cookMinutes: 4,
    seasoning: ['Nước mắm 1 thìa canh', 'Tỏi 3 tép băm', 'Dầu ăn 1 thìa canh', 'Đường 1/2 thìa cà phê'],
    steps: [
      'Rau muống 350g nhặt lá và cọng non, rửa sạch, cắt khúc 5cm.',
      'Đun nóng 1 thìa canh dầu, phi tỏi 3 tép băm cho vàng thơm.',
      'Cho rau vào xào lửa thật lớn, đảo liên tục 2–3 phút.',
      'Nêm 1 thìa canh nước mắm và 1/2 thìa cà phê đường, đảo đều rồi tắt bếp ngay.',
    ],
    tip: 'Lửa lớn là yếu tố quyết định: rau xanh và giòn, không ra nước. Không nêm muối trước khi xào.',
  },
  'xao-cai-thit': {
    prepMinutes: 10,
    cookMinutes: 6,
    seasoning: [
      'Nước mắm 1 thìa canh',
      'Dầu hào 1 thìa cà phê (tuỳ chọn)',
      'Tiêu 1/4 thìa cà phê',
      'Tỏi 2 tép băm',
      'Dầu ăn 1 thìa canh',
    ],
    steps: [
      'Thịt bò 100g thái lát mỏng ngang thớ, ướp 1/2 thìa canh nước mắm, 1/4 thìa cà phê tiêu, 1/2 thìa cà phê dầu ăn trong 10 phút.',
      'Cải xanh 300g rửa sạch, cắt khúc 4cm, chần nước sôi 30 giây rồi vớt ra.',
      'Phi tỏi với dầu cho thơm, cho bò vào xào lửa lớn 1 phút, trút ra đĩa.',
      'Xào cải 2 phút, cho bò lại, nêm 1/2 thìa canh nước mắm và dầu hào, đảo đều.',
    ],
    tip: 'Xào bò riêng rồi trộn lại: bò vừa chín tới, không dai.',
  },
  'xao-dau-que': {
    prepMinutes: 10,
    cookMinutes: 8,
    seasoning: ['Nước mắm 1 thìa canh', 'Muối 1/3 thìa cà phê', 'Tỏi 2 tép băm', 'Dầu ăn 1 thìa canh'],
    steps: [
      'Đậu que 250g cắt bỏ hai đầu, cắt khúc 5cm, chần nước sôi 1 phút để bớt mùi hăng.',
      'Thịt băm 80g ướp 1/3 thìa cà phê muối và 1/2 thìa canh nước mắm.',
      'Xào thịt băm với tỏi 2 phút cho săn.',
      'Cho đậu que vào xào lửa lớn 4–5 phút, nêm 1/2 thìa canh nước mắm còn lại.',
    ],
    tip: 'Chần đậu trước giúp đậu chín đều và giữ màu xanh; xào lửa lớn để đậu không bị nhũn.',
  },
  'xao-bap-cai': {
    prepMinutes: 10,
    cookMinutes: 7,
    seasoning: ['Nước mắm 1 thìa canh', 'Đường 1/2 thìa cà phê', 'Tỏi 2 tép băm', 'Dầu ăn 1 thìa canh'],
    steps: [
      'Bắp cải 300g bỏ lõi, thái sợi 0,5cm, rửa sạch để ráo.',
      'Thịt băm 70g ướp chút nước mắm.',
      'Phi tỏi với dầu, xào thịt băm 2 phút.',
      'Cho bắp cải vào xào lửa lớn 3–4 phút, nêm nước mắm và đường, đảo đều.',
    ],
    tip: 'Để ráo bắp cải trước khi xào, nếu không món sẽ bị ướt và nhạt.',
  },
  'xao-khoai-tay': {
    prepMinutes: 15,
    cookMinutes: 12,
    seasoning: [
      'Nước mắm 1 thìa canh',
      'Dầu hào 1 thìa cà phê',
      'Tiêu 1/4 thìa cà phê',
      'Tỏi 2 tép băm',
      'Dầu ăn 2 thìa canh',
    ],
    steps: [
      'Khoai tây 200g gọt vỏ, thái que dày 0,5cm, ngâm nước muối 5 phút rồi để ráo.',
      'Thịt bò 100g thái mỏng, ướp tiêu và 1/2 thìa canh nước mắm trong 10 phút.',
      'Chiên khoai với 1,5 thìa canh dầu đến vàng cạnh, vớt ra đĩa có giấy thấm.',
      'Xào bò lửa lớn 1 phút với tỏi, cho khoai lại, nêm nước mắm và dầu hào, đảo đều.',
    ],
    tip: 'Ngâm khoai nước muối giúp khoai không thâm và bớt bột khi chiên.',
  },
  'xao-uc-ga': {
    prepMinutes: 12,
    cookMinutes: 8,
    seasoning: [
      'Nước mắm 1 thìa canh',
      'Đường 1/2 thìa cà phê',
      'Sả 2 cây băm nhuyễn',
      'Ớt 1 trái băm',
      'Tỏi 2 tép băm',
      'Dầu ăn 1 thìa canh',
    ],
    steps: [
      'Ức gà 150g thái miếng vừa ăn, ướp sả băm, tỏi, ớt, 1/2 thìa canh nước mắm và 1/2 thìa cà phê đường trong 15 phút.',
      'Đun nóng dầu, cho gà vào xào lửa lớn 4–5 phút.',
      'Khi gà săn vàng, nêm 1/2 thìa canh nước mắm còn lại, đảo đều 1 phút.',
      'Tắt bếp, rắc thêm sả băm sống nếu thích thơm nồng.',
    ],
    tip: 'Ức gà dễ khô: chỉ xào 5 phút trên lửa lớn và không đậy nắp.',
  },

  /* ---------------------------------- Kho ---------------------------------- */
  'kho-thit-trung': {
    prepMinutes: 10,
    cookMinutes: 40,
    seasoning: [
      'Nước mắm 3 thìa canh',
      'Đường 1,5 thìa canh',
      'Nước màu 1 thìa cà phê (hoặc 1 thìa canh đường thắng)',
      'Hành tím 2 củ băm',
      'Tiêu 1/2 thìa cà phê',
    ],
    steps: [
      'Thịt ba chỉ 150g cắt miếng 3cm, chần nước sôi 2 phút rồi rửa sạch để khử mùi.',
      'Ướp thịt với 2 thìa canh nước mắm, 1,5 thìa canh đường, nước màu, hành tím băm, 1/2 thìa cà phê tiêu trong 20 phút.',
      'Luộc 2 quả trứng 9 phút, bóc vỏ.',
      'Cho thịt vào nồi, đổ nước ngập mặt thịt, kho lửa nhỏ 25 phút.',
      'Cho trứng vào kho thêm 10 phút cho thấm, nêm 1 thìa canh nước mắm còn lại.',
    ],
    tip: 'Kho lửa nhỏ và không khuấy nhiều để thịt không nát; nước kho sánh là đạt.',
  },
  'kho-ca-basa': {
    prepMinutes: 15,
    cookMinutes: 25,
    seasoning: [
      'Nước mắm 3 thìa canh',
      'Đường 1 thìa canh',
      'Nước màu 1 thìa cà phê',
      'Tiêu 1/2 thìa cà phê',
      'Ớt 1 trái',
      'Hành tím 2 củ băm',
    ],
    steps: [
      'Cá basa 180g rửa với muối, cắt khúc 4cm, để thật ráo.',
      'Ướp cá với 2 thìa canh nước mắm, 1 thìa canh đường, nước màu, hành tím, tiêu trong 15 phút.',
      'Xếp cá vào nồi, thêm 100ml nước, ớt trái đập dập.',
      'Kho lửa nhỏ 20 phút, trở nhẹ một lần, nêm 1 thìa canh nước mắm còn lại.',
    ],
    tip: 'Không khuấy cá khi kho: chỉ nghiêng nồi. Cá basa mềm nên dễ nát.',
  },
  'kho-ga-gung': {
    prepMinutes: 12,
    cookMinutes: 30,
    seasoning: [
      'Nước mắm 2 thìa canh',
      'Đường 1 thìa canh',
      'Gừng 1 củ nhỏ (khoảng 20g) thái sợi',
      'Hành tím 2 củ băm',
      'Tiêu 1/2 thìa cà phê',
    ],
    steps: [
      'Đùi gà 200g chặt miếng vừa, chần qua nước sôi 1 phút rồi rửa sạch.',
      'Ướp gà với 1,5 thìa canh nước mắm, 1 thìa canh đường, gừng thái sợi, hành tím, tiêu trong 20 phút.',
      'Kho lửa nhỏ với 100ml nước trong 20 phút.',
      'Nêm 1/2 thìa canh nước mắm còn lại, kho thêm 5 phút cho sánh.',
    ],
    tip: 'Gừng vừa khử mùi gà vừa làm nước kho ấm; thái sợi để không gắt.',
  },
  'kho-suon': {
    prepMinutes: 10,
    cookMinutes: 35,
    seasoning: [
      'Nước mắm 2,5 thìa canh',
      'Đường 1,5 thìa canh',
      'Nước màu 1 thìa cà phê',
      'Hành tím 2 củ băm',
      'Tiêu 1/2 thìa cà phê',
    ],
    steps: [
      'Sườn non 180g chặt miếng 3cm, chần nước sôi 3 phút, rửa lại cho sạch bọt.',
      'Ướp sườn với 2 thìa canh nước mắm, đường, nước màu, hành tím, tiêu trong 20 phút.',
      'Cho sườn vào nồi, thêm 150ml nước, kho lửa nhỏ 25 phút.',
      'Nêm 1/2 thìa canh nước mắm còn lại rồi kho thêm 5 phút.',
    ],
    tip: 'Chần sườn kỹ giúp nước kho trong; hớt bọt ngay khi nước sôi.',
  },
  'kho-tom': {
    prepMinutes: 12,
    cookMinutes: 15,
    seasoning: ['Nước mắm 1,5 thìa canh', 'Đường 1 thìa cà phê', 'Nước màu 1/2 thìa cà phê', 'Tỏi 2 tép băm', 'Ớt 1 trái'],
    steps: [
      'Tôm 120g cắt râu, rút chỉ lưng (giữ nguyên vỏ cho ngọt).',
      'Ướp tôm với 1 thìa canh nước mắm, đường, nước màu, tỏi băm trong 10 phút.',
      'Cho tôm vào chảo, kho lửa vừa 8 phút, trở đều.',
      'Nêm 1/2 thìa canh nước mắm còn lại, thêm ớt, kho 2 phút.',
    ],
    tip: 'Giữ vỏ tôm khi kho để nước kho ngọt và đỏ đẹp; đừng kho quá lâu vì tôm sẽ khô.',
  },
  'kho-dau-hu': {
    prepMinutes: 10,
    cookMinutes: 18,
    seasoning: ['Nước tương 2 thìa canh', 'Đường 1 thìa cà phê', 'Hành tím 1 củ băm', 'Dầu ăn 2 thìa canh', 'Tiêu 1/4 thìa cà phê'],
    steps: [
      'Đậu hũ 2 miếng cắt đôi, chiên với 2 thìa canh dầu đến vàng hai mặt.',
      'Nấm rơm 200g rửa sạch, cắt chân.',
      'Phi hành tím, cho nấm vào xào 2 phút, thêm 150ml nước, nước tương, đường.',
      'Cho đậu hũ vào kho 8 phút lửa nhỏ, rắc tiêu.',
    ],
    tip: 'Chiên đậu trước khi kho để đậu không bị vỡ và thấm vị hơn.',
  },

  /* --------------------------- Chiên / hấp / luộc --------------------------- */
  'chien-trung': {
    prepMinutes: 3,
    cookMinutes: 5,
    seasoning: ['Nước mắm 1/2 thìa cà phê', 'Muối 1/4 thìa cà phê', 'Tiêu 1/4 thìa cà phê', 'Dầu ăn 1,5 thìa canh'],
    steps: [
      'Đập 2 quả trứng vào bát, thêm 1/2 thìa cà phê nước mắm, 1/4 thìa cà phê muối, tiêu và 2 nhánh hành lá cắt nhỏ.',
      'Đánh đều nhưng không tạo nhiều bọt để trứng không bị rỗ.',
      'Đun nóng 1,5 thìa canh dầu, đổ trứng vào, để lửa vừa 2 phút.',
      'Lật mặt, chiên thêm 1 phút rồi tắt bếp.',
    ],
    tip: 'Lửa vừa giúp trứng chín đều và không cháy viền; thích mỏng thì dùng chảo rộng.',
  },
  'chien-ca-basa': {
    prepMinutes: 12,
    cookMinutes: 10,
    seasoning: ['Muối 1/2 thìa cà phê', 'Tiêu 1/2 thìa cà phê', 'Nước mắm 1 thìa canh', 'Dầu ăn 3 thìa canh', 'Bột năng 1 thìa canh'],
    steps: [
      'Cá basa 180g rửa sạch, thấm thật khô, ướp 1/2 thìa cà phê muối, 1/2 thìa cà phê tiêu, 1 thìa canh nước mắm trong 15 phút.',
      'Lăn cá qua 1 thìa canh bột năng để khi chiên không bắn dầu.',
      'Đun 3 thìa canh dầu nóng, chiên cá lửa vừa 4 phút mỗi mặt đến vàng giòn.',
      'Vớt ra đĩa có giấy thấm dầu.',
    ],
    tip: 'Thấm khô cá là bước quan trọng nhất — càng khô càng giòn và ít bắn.',
  },
  'chien-ga': {
    prepMinutes: 15,
    cookMinutes: 20,
    seasoning: [
      'Nước mắm 2 thìa canh',
      'Đường 1 thìa canh',
      'Tỏi 3 tép băm',
      'Dầu ăn 4 thìa canh',
      'Tiêu 1/2 thìa cà phê',
    ],
    steps: [
      'Đùi gà 200g chặt miếng vừa, ướp 1 thìa canh nước mắm, 1/2 thìa cà phê tiêu, tỏi băm trong 20 phút.',
      'Đun 4 thìa canh dầu, chiên gà lửa vừa 8 phút mỗi mặt đến vàng.',
      'Pha 1 thìa canh nước mắm với 1 thìa canh đường và 2 thìa canh nước ấm.',
      'Đổ hỗn hợp vào chảo, đảo gà lửa lớn 2 phút cho áo đều, sánh lại là xong.',
    ],
    tip: 'Chiên chín rồi mới áo nước mắm đường: gà có lớp áo bóng, không bị cháy đường.',
  },
  'luoc-thit': {
    prepMinutes: 5,
    cookMinutes: 22,
    seasoning: ['Muối 1/2 thìa canh (cho nước luộc)', 'Gừng 1 nhánh nhỏ', 'Hành tím 2 củ'],
    steps: [
      'Thịt ba chỉ 150g rửa sạch, chà muối rồi rửa lại.',
      'Đun 1 lít nước với 1/2 thìa canh muối, gừng đập dập, hành tím nướng sơ.',
      'Cho thịt vào, luộc 20 phút lửa vừa, đậy nắp hở.',
      'Vớt thịt, ngâm nước đá 3 phút để thịt trắng và chắc, thái lát mỏng.',
      'Dùng nước luộc để luộc rau muống 2 phút.',
    ],
    tip: 'Ngâm nước đá giúp thịt dai chắc, thái không nát; nước luộc dùng lại nấu canh rất ngọt.',
  },
  'hap-ca': {
    prepMinutes: 12,
    cookMinutes: 12,
    seasoning: ['Nước mắm 1,5 thìa canh', 'Gừng 1 củ nhỏ thái sợi', 'Hành lá 3 nhánh', 'Dầu ăn 1 thìa canh', 'Tiêu 1/4 thìa cà phê'],
    steps: [
      'Cá basa 180g rửa sạch, khứa 2 đường trên thân, ướp 1 thìa canh nước mắm và gừng thái sợi 10 phút.',
      'Xếp cá vào đĩa sâu, rải hành lá dưới đáy.',
      'Đun nước sôi trong nồi hấp, hấp cá 10–12 phút.',
      'Đun nóng 1 thìa canh dầu với 1/2 thìa canh nước mắm còn lại, rưới lên cá, rắc tiêu.',
    ],
    tip: 'Nước phải sôi mạnh trước khi cho cá vào; hấp quá 12 phút cá sẽ khô.',
  },
  'luoc-rau-muong': {
    prepMinutes: 6,
    cookMinutes: 4,
    seasoning: ['Nước mắm 1 thìa canh', 'Đường 1/2 thìa cà phê', 'Tỏi 1 tép băm', 'Ớt 1/2 trái băm', 'Chanh 1/2 trái'],
    steps: [
      'Rau muống 350g nhặt, rửa sạch, cắt khúc 8cm.',
      'Đun 1 lít nước sôi, thêm chút muối, cho rau vào luộc 2–3 phút.',
      'Vớt rau ngay, xả nước lạnh để giữ màu xanh.',
      'Pha nước chấm: 1 thìa canh nước mắm, 1/2 thìa cà phê đường, 2 thìa canh nước ấm, tỏi ớt băm, 1/2 trái chanh.',
    ],
    tip: 'Luộc nhanh và xả lạnh giúp rau xanh giòn; nước chấm pha chua trước, ngọt sau.',
  },

  /* ----------------------------- Cơm / bún / cháo ---------------------------- */
  'com-chien': {
    prepMinutes: 8,
    cookMinutes: 8,
    seasoning: ['Nước mắm 1 thìa canh', 'Dầu ăn 2 thìa canh', 'Tiêu 1/4 thìa cà phê', 'Hành lá 2 nhánh'],
    steps: [
      'Cơm nguội 150g (1 chén)dùng tay xới tơi, tốt nhất để cơm qua đêm.',
      'Đập 2 quả trứng, đánh tan với 1/2 thìa canh nước mắm.',
      'Đun 2 thìa canh dầu thật nóng, đổ trứng vào đảo nhanh cho tơi.',
      'Cho cơm vào, đảo lửa lớn 3 phút cho hạt cơm khô và tách rời.',
      'Nêm 1/2 thìa canh nước mắm còn lại, rắc tiêu và hành lá, tắt bếp.',
    ],
    tip: 'Cơm nguội để qua đêm là yếu tố quyết định; cơm mới nấu sẽ bị dính và nhão.',
  },
  'com-tam': {
    prepMinutes: 20,
    cookMinutes: 15,
    seasoning: [
      'Nước mắm 3 thìa canh',
      'Đường 2 thìa canh',
      'Mật ong 1 thìa canh',
      'Tỏi 3 tép băm',
      'Sả 1 cây băm',
      'Dầu ăn 1 thìa canh',
    ],
    steps: [
      'Sườn non 150g chặt miếng, dần sơ cho mềm rồi ướp 1,5 thìa canh nước mắm, 1 thìa canh đường, mật ong, tỏi, sả, dầu ăn trong 20 phút.',
      'Nướng sườn ở 200°C khoảng 12–15 phút hoặc áp chảo 4 phút mỗi mặt.',
      'Pha nước mắm chua ngọt: 1,5 thìa canh nước mắm, 1 thìa canh đường, 3 thìa canh nước ấm, chanh.',
      'Nấu 100g gạo thành cơm, bày cùng sườn, dưa leo và nước mắm.',
    ],
    tip: 'Dần sườn bằng chày trước khi ướp giúp sườn mềm và thấm nhanh.',
  },
  'bun-thit': {
    prepMinutes: 20,
    cookMinutes: 15,
    seasoning: [
      'Nước mắm 3 thìa canh',
      'Đường 2 thìa canh',
      'Sả 2 cây băm',
      'Tỏi 3 tép băm',
      'Mật ong 1 thìa canh',
      'Dầu ăn 1 thìa canh',
    ],
    steps: [
      'Thịt heo 120g thái lát mỏng 0,5cm, ướp 1,5 thìa canh nước mắm, 1 thìa canh đường, sả, tỏi, mật ong, dầu ăn trong 20 phút.',
      'Nướng thịt 200°C khoảng 12 phút hoặc áp chảo 3 phút mỗi mặt.',
      'Pha nước mắm: 1,5 thìa canh nước mắm, 1 thìa canh đường, 4 thìa canh nước ấm, chanh, tỏi ớt băm.',
      'Trụng bún 250g qua nước sôi 30 giây, xếp ra tô cùng rau sống, thịt nướng, rắc đậu phộng rang.',
    ],
    tip: 'Thịt thái mỏng và ướp đủ 20 phút sẽ mềm, không dai khi nướng.',
  },
  'chao-ga': {
    prepMinutes: 10,
    cookMinutes: 45,
    seasoning: [
      'Muối 1/2 thìa cà phê',
      'Nước mắm 1 thìa canh',
      'Gừng 1 nhánh nhỏ',
      'Hành lá 2 nhánh',
      'Tiêu 1/4 thìa cà phê',
    ],
    steps: [
      'Ngâm 30g đậu xanh 2 tiếng cho mềm.',
      'Nấu 80g gạo với 1 lít nước và đậu xanh, đun sôi rồi hạ lửa nhỏ 35 phút, thỉnh thoảng khuấy để không dính đáy.',
      'Luộc đùi gà 120g với gừng 15 phút, vớt ra xé sợi, giữ nước luộc.',
      'Cho nước luộc gà vào cháo, nêm 1 thìa canh nước mắm, 1/2 thìa cà phê muối.',
      'Cho gà xé vào, rắc hành lá và tiêu trước khi ăn.',
    ],
    tip: 'Khuấy cháo theo một chiều và giữ lửa nhỏ để cháo sánh mịn, không vón cục.',
  },
};

/** Gộp công thức viết tay của cả bốn đợt (30 + 70 = 100 món). */
export const RECIPES = {
  ...CORE_RECIPES,
  ...RECIPES_BATCH_1,
  ...RECIPES_BATCH_2,
  ...RECIPES_BATCH_3,
};

export const DETAILED_RECIPE_COUNT = Object.keys(RECIPES).length;
