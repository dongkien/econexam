/* ============================================================
   DỮ LIỆU CẤU TRÚC ĐỀ THI — TỰ ĐỘNG SINH TỪ FILE EXCEL
   "Cấu trúc đề thi - BM KTQL.xlsx"  (Bộ môn Kinh tế & Quản lý)
   ------------------------------------------------------------
   Điểm mỗi câu (d) đã được CHUẨN HOÁ theo cột % của file:
       d = (% của nhóm × 10) / số câu trong nhóm   => tổng luôn = 10.
   Quy ước mã học phần:
     ABC123 -> Tiêu chuẩn | ABCH123 -> CLC/ĐHNN (tiếng Việt)
     ABCE123 -> Chất lượng cao (tiếng Anh) | ABC123E -> Tiên tiến (tiếng Anh)
   Mỗi ô ma trận: { content, level, type(TN/TL), sl=số câu, d=điểm MỖI câu }
   ============================================================ */

const LEVELS = ["Nhớ","Hiểu","Vận dụng","Phân tích","Đánh giá","Sáng tạo"];
const TYPE_LABELS = { TN: "Trắc nghiệm", TL: "Tự luận" };

const EXAM_HEADER_DEFAULTS = {
  schoolName: "TRƯỜNG ĐẠI HỌC NGOẠI THƯƠNG",
  institute: "VIỆN KINH TẾ & KINH DOANH QUỐC TẾ",
  department: "BỘ MÔN KINH TẾ & QUẢN LÝ",
  examTitle: "ĐỀ THI KẾT THÚC HỌC PHẦN",
  schoolYear: "NĂM HỌC 20.... - 20....",
  examCode: ""
};

const SUBJECTS = {
 "TMA315": {
  "code": "TMA315",
  "name": "QUẢN LÝ DỰ ÁN ĐẦU TƯ QUỐC TẾ",
  "program": "Tiêu chuẩn",
  "language": "Tiếng Việt",
  "credits": "03",
  "duration": "60 phút",
  "matrix": [
   {
    "content": "Chương 3",
    "level": "Phân tích",
    "type": "TL",
    "sl": 1,
    "d": 6.0
   },
   {
    "content": "Chương 4",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 1,
    "d": 1.0
   },
   {
    "content": "Chương 5",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 1,
    "d": 1.0
   },
   {
    "content": "Chương 6",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 1,
    "d": 2.0
   }
  ],
  "totalQ": {
   "TN": 0,
   "TL": 4
  },
  "computedTotal": 10.0,
  "filled": true,
  "needsReview": false
 },
 "DTU310": {
  "code": "DTU310",
  "name": "ĐẦU TƯ QUỐC TẾ",
  "program": "Tiêu chuẩn",
  "language": "Tiếng Việt",
  "credits": "03",
  "duration": "60 phút",
  "matrix": [
   {
    "content": "Giải thích lý thuyết, hiện tượng về đầu tư quốc tế (chọn Chương 1-8)",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 2,
    "d": 3.0
   },
   {
    "content": "Phân tích 1 vấn đề chuyển sâu về đầu tư quốc tế (chọn Chương 1-8)",
    "level": "Phân tích",
    "type": "TL",
    "sl": 1,
    "d": 4.0
   }
  ],
  "totalQ": {
   "TN": 0,
   "TL": 3
  },
  "computedTotal": 10.0,
  "filled": true,
  "needsReview": false
 },
 "KTE311": {
  "code": "KTE311",
  "name": "KINH TẾ ĐẦU TƯ",
  "program": "Tiêu chuẩn",
  "language": "Tiếng Việt",
  "credits": "03",
  "duration": "60 phút",
  "matrix": [
   {
    "content": "Chương 1,2,3,6 (CLO1)",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 2,
    "d": 3.0
   },
   {
    "content": "Chương 4,5 (CLO2)",
    "level": "Phân tích",
    "type": "TL",
    "sl": 1,
    "d": 4.0
   }
  ],
  "totalQ": {
   "TN": 0,
   "TL": 3
  },
  "computedTotal": 10.0,
  "filled": true,
  "needsReview": false
 },
 "DTU301": {
  "code": "DTU301",
  "name": "Nguyên lý quản lý kinh tế",
  "program": "Tiêu chuẩn",
  "language": "Tiếng Việt",
  "credits": "03",
  "duration": "60 phút",
  "matrix": [
   {
    "content": "Kiểm tra việc nhớ và hiểu kiến thức QLKT bằng trắc nghiệm, rải đều các chương từ chương 1 đến chương 6 (Có thể chọn trắc nghiệm hoặc tự luận)",
    "level": "Nhớ",
    "type": "TN",
    "sl": 20,
    "d": 0.2
   },
   {
    "content": "Vận dụng và/hoặc Phân tích một vấn đề chuyên sâu về quản lý kinh tế (Chọn từ chương IV đến chương VI: ngắn hạn, dài hạn hoặc nền kinh tế mở)",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 1,
    "d": 3.0
   },
   {
    "content": "Vận dụng và/hoặc Phân tích một vấn đề chuyên sâu về quản lý kinh tế (Chọn từ chương IV đến chương VI: ngắn hạn, dài hạn hoặc nền kinh tế mở)",
    "level": "Phân tích",
    "type": "TL",
    "sl": 1,
    "d": 3.0
   }
  ],
  "totalQ": {
   "TN": 20,
   "TL": 2
  },
  "computedTotal": 10.0,
  "filled": true,
  "needsReview": false
 },
 "KTE301E": {
  "code": "KTE301E",
  "name": "Tư tưởng và thể chế kinh tế hiện đại",
  "program": "Tiên tiến",
  "language": "Tiếng Anh",
  "credits": "03",
  "duration": "60 phút",
  "matrix": [
   {
    "content": "Kiểm tra việc nhớ và hiểu kiến thức QLKT bằng trắc nghiệm, rải đều các chương từ chương 1 đến chương 6 (Có thể chọn trắc nghiệm hoặc tự luận)",
    "level": "Nhớ",
    "type": "TN",
    "sl": 20,
    "d": 0.2
   },
   {
    "content": "Vận dụng và/hoặc Phân tích một vấn đề chuyên sâu về quản lý kinh tế (Chọn từ chương IV đến chương VI: ngắn hạn, dài hạn hoặc nền kinh tế mở)",
    "level": "Vận dụng",
    "type": "TL",
    "sl": 4,
    "d": 1.5
   }
  ],
  "totalQ": {
   "TN": 20,
   "TL": 4
  },
  "computedTotal": 10.0,
  "filled": true,
  "needsReview": false
 }
};
