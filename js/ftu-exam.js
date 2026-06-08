/* ============================================================
   BỘ TẠO ĐỀ THI THEO MẪU CHÍNH THỨC FTU (vẽ lại bằng docx.js)
   Hỗ trợ 2 dạng đề:
     • Có trắc nghiệm + tự luận  -> sinh viên làm vào đề (có bảng đáp án, ô điểm)
     • Chỉ tự luận               -> sinh viên làm ra giấy thi riêng (gọn, không ô điểm)
   Tự chọn VN/EN theo subject.language; tự điền tên môn, mã môn, thời gian, điểm/câu;
   bảng đáp án tự khớp số câu trắc nghiệm.
   Dùng được ở trình duyệt (window.docx) và Node (require('docx')).
   ============================================================ */
(function () {
  "use strict";

  const PAGE = { width: 12240, height: 15840, top: 270, bottom: 630, left: 1080, right: 540 };
  const PRINT_W = 10620;
  const FONT = "Times New Roman";
  const SZ = 24;
  const UNDERLINE = "_________________________";
  const UNDERLINE2 = "__________________________________";
  // Tạo chuỗi dấu chấm (…) với số lượng đã đo để vừa khít khổ giấy, không tràn dòng.
  const D = (n) => "…".repeat(n);

  function fmt(n) {
    if (n === null || n === undefined || n === "") return "";
    const r = Math.round(n * 100) / 100;
    return r.toString();
  }

  const TEXT = {
    vi: {
      uni: "TRƯỜNG ĐẠI HỌC NGOẠI THƯƠNG",
      school: "Viện Kinh tế và Kinh doanh quốc tế",
      dept: "BỘ MÔN Kinh tế và Quản lý",
      title: "ĐỀ THI KẾT THÚC HỌC PHẦN",
      examLabel: { official: "ĐỀ THI CHÍNH THỨC", backup: "ĐỀ THI DỰ PHÒNG" },
      meta: (d) => [
        "Giai đoạn:…   Học kỳ:…   Năm học: 202…-202…",
        "Hệ: " + D(9) + "   Khóa: " + D(8),
        "Ngày thi: " + D(9) + "   Ca thi: " + D(6),
        `Thời gian làm bài: ${d} phút (không kể thời gian phát đề)`
      ],
      invig: ["Cán bộ COI THI 1: ", D(13) + "   ", "Cán bộ COI THI 2: ", D(13)],
      info0: ["Họ tên SV: " + D(12) + " MSV: " + D(12) + " Ngày sinh: …/…/……",
              "Lớp hành chính: " + D(9) + " Lớp tín chỉ: Mã học phần " + D(9) + " Mã đề: (Nếu có)"],
      info1: [["Điểm TRẮC NGHIỆM: " + D(2) + "đ   TỰ LUẬN: " + D(2) + "đ   ", false], ["TỔNG ĐIỂM", true], [": " + D(2) + "đ   Bằng chữ: " + D(6), false]],
      info2: [["GV CHẤM THI 1", true], [": " + D(13) + "  ", false], ["GV CHẤM THI 2", true], [": " + D(13), false]],
      secA: (p) => [["PHẦN A: TRẮC NGHIỆM ", false], [`(${p} điểm)`, true],
                    [" – Chọn đáp án đúng nhất rồi điền CHỮ HOA (A/B/C/D) vào ô tương ứng", false]],
      noteA: "(Lưu ý: Sinh viên BẮT BUỘC điền chữ in HOA. Nếu điền sai thì BỎ QUA, không gạch xóa trong ô).",
      gridQ: "Câu", gridA: "Chọn",
      q: "Câu ",
      secB: (p) => `PHẦN B. TỰ LUẬN (${p} điểm). Trả lời các câu hỏi dưới đây dưới hình thức một bài luận để vận dụng kiến thức đã học, phân tích một vấn đề hoặc giải quyết một tình huống`,
      essayEndPts: (p) => ` (${p} điểm)`,                       // mẫu có TN: điểm ở cuối câu
      essayQ: (n, p) => `Câu ${n} (${p} điểm): `,               // mẫu chỉ tự luận: điểm ngay sau số câu
      end: "Hết",
      note1pre: (m, e) => `Ghi chú: - Đề thi gồm có ${m} câu trắc nghiệm, ${e} câu tự luận, `,
      note1unit: " trang.",
      noteEssay: (e) => `Ghi chú: - Đề thi gồm có ${e} câu tự luận; Thí sinh không được sử dụng tài liệu trong khi thi.`,
      note2: "- Thí sinh không được sử dụng tài liệu.",
      note3: "- Cán bộ coi thi không giải thích gì thêm.",
      sign: ["DUYỆT ĐỀ THI", "TRƯỞNG BỘ MÔN", "(ký, ghi rõ họ tên)", "", "", "TS. Đỗ Ngọc Kiên"],
      blank: "…………."
    },
    en: {
      uni: "FOREIGN TRADE UNIVERSITY",
      school: "School of Economics & International Business",
      dept: "Department of Economics and Governance",
      title: "FINAL EXAM PAPER",
      examLabel: { official: "OFFICIAL EXAM PAPER", backup: "BACK-UP EXAM PAPER" },
      meta: (d) => [
        "Phase:…   Semester:…   Academic year: 202…-202…",
        "Full/Part time: " + D(6) + "   Intake: " + D(6),
        "Exam date: " + D(8) + "   Time: " + D(6),
        `Duration: ${d} minutes`
      ],
      invig: ["Invigilator 1: ", D(15) + "   ", "Invigilator 2: ", D(15)],
      info0: ["Student name: " + D(12) + " Student ID: " + D(12) + " DOB: …/…/……",
              "Administrative Class: " + D(9) + " Course Class: " + D(9) + " Exam Code: if any"],
      info1: [["MCQ Mark: " + D(2) + "   ESSAY Mark: " + D(2) + "   ", false], ["TOTAL MARK", true], [": " + D(2) + "   In words: " + D(11), false]],
      info2: [["EXAMINER 1", true], [": " + D(14) + "  ", false], ["EXAMINER 2", true], [": " + D(14), false]],
      secA: (p) => [["SECTION A: MULTIPLE CHOICE ", false], [`(${p} Points)`, true],
                    [" – Choose the best answer and write the corresponding capital letter (A/B/C/D) in the appropriate box.", false]],
      noteA: "(Note: Use CAPITAL LETTERS only. Do not erase or cross out your answer).",
      gridQ: "Question", gridA: "Answer",
      q: "Question ",
      secB: (p) => `SECTION B. ESSAY (${p} Points). Answer the following questions in essay form. Apply the knowledge you have learned to analyze issues or solve given situations.`,
      essayEndPts: (p) => ` (${p} points)`,
      essayQ: (n, p) => `Question ${n} (${p} points): `,
      end: "End of test",
      note1pre: (m, e) => `Note: - This paper contains ${m} MCQs, ${e} essay questions, `,
      note1unit: " pages.",
      noteEssay: (e) => `Note: - This paper contains ${e} questions; Students are NOT allowed to use materials during the examination.`,
      note2: "- Students must not use any material during the examination.",
      note3: "- Invigilators will not provide further explanation.",
      sign: ["APPROVED BY", "HEAD OF DEPARTMENT", "", "", "", "Do Ngoc Kien, Ph.D"],
      blank: "…………."
    }
  };

  function _build(D, subject, mcqs, essays, opts) {
    opts = opts || {};
    const variant = opts.variant === "backup" ? "backup" : "official";
    const {
      Document, Paragraph, TextRun, Table, TableRow, TableCell, Footer,
      WidthType, BorderStyle, AlignmentType, VerticalAlign, ShadingType, PageNumber
    } = D;
    const L = subject.language === "Tiếng Anh" ? TEXT.en : TEXT.vi;
    const hasMCQ = mcqs.length > 0;
    const footerLabel = variant === "backup" ? "BACK-UP EXAM PAPER" : "OFFICIAL EXAM PAPER";

    const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const LINE = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
    const NO_B = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };
    const GRID_B = { top: LINE, bottom: LINE, left: LINE, right: LINE, insideHorizontal: LINE, insideVertical: LINE };
    const GRAY = { fill: "E6E6E6", type: ShadingType.CLEAR, color: "auto" }; // nền xám nhạt

    const run = (text, o = {}) => new TextRun({ text, bold: !!o.b, italics: !!o.i, size: o.size || SZ, font: FONT });
    const par = (children, o = {}) => new Paragraph({
      alignment: o.align, spacing: { after: o.after != null ? o.after : 0, before: o.before || 0, line: 240 },
      children: Array.isArray(children) ? children : [children]
    });
    const cellPars = (lines, o = {}) => lines.map((ln) =>
      new Paragraph({ alignment: o.align, spacing: { after: 0, line: 240 }, children: [run(ln, o)] }));

    const dur = (String(subject.duration).match(/\d+/) || ["60"])[0];
    const mcqPts = fmt(mcqs.reduce((a, q) => a + (q.slot ? q.slot.points : 0), 0));
    const essayPts = fmt(essays.reduce((a, q) => a + (q.slot ? q.slot.points : 0), 0));

    const children = [];

    /* ---- Bảng tiêu đề (2 cột, không viền) ---- */
    // Cột phải: mẫu có TN dùng 1 dòng trống; mẫu chỉ tự luận dùng 1 dòng gạch dưới.
    const rightSpacer = hasMCQ ? par([run("")]) : par([run(UNDERLINE2)], { align: AlignmentType.CENTER });
    // Ô "ĐỀ THI CHÍNH THỨC / DỰ PHÒNG" — bảng 1 ô đóng khung 4 cạnh, căn giữa, đặt ngay dưới dòng Bộ môn.
    const examBox = new Table({
      alignment: AlignmentType.CENTER,
      width: { size: 3600, type: WidthType.DXA }, columnWidths: [3600], borders: GRID_B,
      rows: [new TableRow({
        children: [new TableCell({
          width: { size: 3600, type: WidthType.DXA }, borders: GRID_B,
          margins: { top: 20, bottom: 20, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 }, children: [run(L.examLabel[variant], { b: true })] })]
        })]
      })]
    });
    children.push(new Table({
      width: { size: 10890, type: WidthType.DXA }, columnWidths: [4900, 5990], borders: NO_B,
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 4900, type: WidthType.DXA }, borders: NO_B, verticalAlign: VerticalAlign.TOP, shading: GRAY,
            children: [
              ...cellPars([L.uni], { align: AlignmentType.CENTER, b: true }),
              ...cellPars([L.school, L.dept], { align: AlignmentType.CENTER }),
              examBox,
              ...cellPars([UNDERLINE], { align: AlignmentType.CENTER })
            ]
          }),
          new TableCell({
            width: { size: 5990, type: WidthType.DXA }, borders: NO_B, verticalAlign: VerticalAlign.TOP, shading: GRAY,
            children: [
              ...cellPars([L.title], { align: AlignmentType.CENTER, b: true }),
              ...cellPars([`${subject.name} (${subject.code})`], { align: AlignmentType.CENTER, b: true }),
              rightSpacer,
              ...cellPars(L.meta(dur), { align: AlignmentType.CENTER })
            ]
          })
        ]
      })]
    }));

    if (hasMCQ) {
      /* ===== DẠNG ĐỀ CÓ TRẮC NGHIỆM + TỰ LUẬN ===== */
      children.push(par([run(L.invig[0], { b: true }), run(L.invig[1]), run(L.invig[2], { b: true }), run(L.invig[3])], { before: 60 }));

      const infoRow = (p, shade) => new TableRow({ children: [new TableCell({ width: { size: PRINT_W, type: WidthType.DXA }, borders: GRID_B, shading: shade ? GRAY : undefined, children: p })] });
      const segPar = (segs) => new Paragraph({ spacing: { after: 0, line: 240 }, children: segs.map((s) => run(s[0], { b: s[1] })) });
      children.push(new Table({
        width: { size: PRINT_W, type: WidthType.DXA }, columnWidths: [PRINT_W], borders: GRID_B,
        rows: [infoRow(cellPars(L.info0), true), infoRow([segPar(L.info1)]), infoRow([segPar(L.info2)])]
      }));

      children.push(par(L.secA(mcqPts).map(([t, ital]) => run(t, { b: true, i: ital })), { before: 120 }));
      children.push(par(run(L.noteA, { b: true, i: true })));

      const N = mcqs.length, labelW = 800, colW = Math.floor((PRINT_W - labelW) / N);
      const colWidths = [labelW, ...Array(N).fill(colW)];
      const headCells = [L.gridQ, ...mcqs.map((_, i) => String(i + 1))].map((t, ci) =>
        new TableCell({ width: { size: colWidths[ci], type: WidthType.DXA }, borders: GRID_B, verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 }, children: [run(t, { b: true })] })] }));
      const ansCells = [L.gridA, ...mcqs.map(() => "")].map((t, ci) =>
        new TableCell({ width: { size: colWidths[ci], type: WidthType.DXA }, borders: GRID_B,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 }, children: [run(t, { b: ci === 0 })] })] }));
      children.push(new Table({ width: { size: PRINT_W, type: WidthType.DXA }, columnWidths: colWidths, borders: GRID_B,
        rows: [new TableRow({ children: headCells }), new TableRow({ children: ansCells })] }));

      mcqs.forEach((q, i) => {
        children.push(par([run(`${L.q}${i + 1}: `, { b: true }), run(q.text || L.blank)], { before: 60 }));
        ["A", "B", "C", "D"].forEach((opt) => children.push(par(run(`${opt}. ${(q.opts && q.opts[opt]) || L.blank}`))));
      });

      children.push(par(run(L.secB(essayPts), { b: true }), { before: 120 }));
      essays.forEach((q, i) => {
        children.push(par([run(`${L.q}${i + 1}: `, { b: true }), run(q.text || L.blank),
          run(L.essayEndPts(q.slot ? fmt(q.slot.points) : ""))], { before: 60 }));
      });
    } else {
      /* ===== DẠNG ĐỀ CHỈ TỰ LUẬN (làm ra giấy thi riêng) ===== */
      essays.forEach((q, i) => {
        children.push(par([
          run(L.essayQ(i + 1, q.slot ? fmt(q.slot.points) : ""), { b: true }),
          run(q.text || L.blank)
        ], { before: 120 }));
      });
    }

    /* ---- Hết + ghi chú ---- */
    const dash = "--------------------------------------";
    children.push(par([run(dash, { b: true }), run(L.end, { i: true }), run(dash, { b: true })], { align: AlignmentType.CENTER, before: 160 }));
    if (hasMCQ) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 },
        children: [
          run(L.note1pre(mcqs.length, essays.length), { i: true }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], italics: true, size: SZ, font: FONT }),
          run(L.note1unit, { i: true })
        ]
      }));
      children.push(par(run(L.note2, { i: true }), { align: AlignmentType.CENTER }));
      children.push(par(run(L.note3, { i: true }), { align: AlignmentType.CENTER }));
    } else {
      children.push(par(run(L.noteEssay(essays.length), { i: true }), { align: AlignmentType.CENTER }));
      children.push(par(run(L.note3, { i: true }), { align: AlignmentType.CENTER }));
    }

    /* ---- Bảng ký duyệt (không viền, ô phải) ---- */
    children.push(new Table({
      width: { size: 10610, type: WidthType.DXA }, columnWidths: [5305, 5305], borders: NO_B,
      rows: [new TableRow({
        children: [
          new TableCell({ width: { size: 5305, type: WidthType.DXA }, borders: NO_B, children: [par([run("")])] }),
          new TableCell({ width: { size: 5305, type: WidthType.DXA }, borders: NO_B, children: cellPars(L.sign, { align: AlignmentType.CENTER }) })
        ]
      })]
    }));

    return new Document({
      features: { updateFields: true }, // để Word tự cập nhật số trang (NUMPAGES) khi mở file
      styles: { default: { document: { run: { font: FONT, size: SZ }, paragraph: { spacing: { after: 0, line: 240 } } } } },
      sections: [{
        properties: { page: { size: { width: PAGE.width, height: PAGE.height }, margin: { top: PAGE.top, right: PAGE.right, bottom: PAGE.bottom, left: PAGE.left } } },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: footerLabel, bold: true, size: SZ, font: FONT })] })]
          })
        },
        children
      }]
    });
  }

  if (typeof window !== "undefined") window.buildFtuExamDoc = (s, m, e, o) => _build(window.docx, s, m, e, o);
  if (typeof module !== "undefined" && module.exports) module.exports = _build;
})();
