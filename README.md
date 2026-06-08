# Trình tạo đề thi cuối kỳ

Công cụ web giúp giáo viên: chọn môn → xem cấu trúc đề thi định sẵn → nhập/upload câu hỏi → xuất ra đề thi **.docx** đúng mẫu.

Chạy **hoàn toàn trong trình duyệt**, không cần server, phù hợp đăng miễn phí trên GitHub Pages.

## Dùng thử trên máy
Mở trực tiếp file `index.html` bằng trình duyệt là chạy được ngay.

## Thêm / sửa môn học
Mở file [`js/subjects.js`](js/subjects.js) và sửa biến `SUBJECTS`. Mỗi môn khai báo:
- `duration`: thời gian làm bài (phút)
- `sections`: các phần, mỗi phần gồm:
  - `name`: tên phần
  - `type`: `"mcq"` (trắc nghiệm 4 lựa chọn), `"truefalse"` (đúng/sai), `"short"` (trả lời ngắn), `"essay"` (tự luận)
  - `pointsPerQuestion`: điểm mỗi câu
  - `difficulty`: số câu theo mức `{ NB, TH, VD, VDC }`

## Nạp câu hỏi nhanh
- **File `.txt`**: mỗi câu cách nhau một dòng trống; dòng bắt đầu bằng `A.` `B.` `C.` `D.` là lựa chọn.
- **File `.json`**: mảng `[{ "text": "...", "opts": { "A": "...", "B": "..." } }, ...]`.
- Hoặc dán trực tiếp vào ô rồi bấm **Nạp**.

## Đăng lên GitHub Pages
1. Tạo repository trên GitHub và đẩy thư mục này lên (nhánh `main`).
2. Vào **Settings → Pages → Build and deployment → Source: Deploy from a branch**, chọn nhánh `main`, thư mục `/ (root)`.
3. Sau ~1 phút, web sẽ chạy tại `https://<tên-tài-khoản>.github.io/<tên-repo>/`.
