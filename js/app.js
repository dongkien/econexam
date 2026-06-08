/* ============================================================
   LOGIC CHÍNH — TRÌNH TẠO ĐỀ THI KẾT THÚC HỌC PHẦN
   Dữ liệu môn lấy từ js/subjects.js (sinh từ file Excel).
   Chạy hoàn toàn trong trình duyệt.
   ============================================================ */
(function () {
  "use strict";
  const el = (id) => document.getElementById(id);
  const subjectInput = el("subjectInput");
  const suggestBox = el("subjectSuggest");
  const structureInfo = el("structureInfo");
  const questionForms = el("questionForms");

  let currentCode = null;
  let slotsCache = { TN: [], TL: [] }; // các "chỗ" câu hỏi sinh ra từ ma trận
  let activeIdx = -1;                  // mục đang được chọn bằng phím mũi tên
  let curMatches = [];                 // danh sách gợi ý hiện tại

  const SUBJECT_LIST = Object.values(SUBJECTS).sort((a, b) => a.code.localeCompare(b.code));

  // Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu/hoa-thường
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

  // Bậc học theo chữ số ĐẦU của cụm 3 chữ số trong mã học phần:
  //   < 6: Đại học | = 6: Thạc sĩ | >= 7: Tiến sĩ
  function eduLevel(code) {
    const m = String(code).match(/\d{3}/);
    if (!m) return "—";
    const d = +m[0][0];
    if (d < 6) return "Bậc Đại học";
    if (d === 6) return "Bậc Thạc sĩ";
    return "Bậc Tiến sĩ";
  }

  // ---- Lọc & hiển thị gợi ý ----
  function showSuggest(query) {
    const q = norm(query.trim());
    curMatches = q
      ? SUBJECT_LIST.filter((s) => norm(s.code).includes(q) || norm(s.name).includes(q) || norm(s.program).includes(q))
      : SUBJECT_LIST.slice();
    activeIdx = -1;
    if (!curMatches.length) {
      suggestBox.innerHTML = `<li class="sg-empty">Không tìm thấy học phần phù hợp</li>`;
      suggestBox.classList.remove("hidden");
      return;
    }
    suggestBox.innerHTML = curMatches
      .map((s, i) => `<li data-i="${i}"><span class="sg-code">${s.code}</span><span class="sg-name">${s.name}</span><span class="sg-prog">${s.program}</span></li>`)
      .join("");
    suggestBox.classList.remove("hidden");
  }

  function hideSuggest() { suggestBox.classList.add("hidden"); }

  function setActive(i) {
    const items = suggestBox.querySelectorAll("li[data-i]");
    activeIdx = i;
    items.forEach((li, idx) => li.classList.toggle("active", idx === i));
    if (items[i]) items[i].scrollIntoView({ block: "nearest" });
  }

  // ---- Sinh các "chỗ" câu hỏi từ ma trận ----
  function buildSlots(subject) {
    const slots = { TN: [], TL: [] };
    subject.matrix.forEach((cell) => {
      for (let i = 0; i < cell.sl; i++) {
        slots[cell.type].push({ level: cell.level, content: cell.content, points: cell.d });
      }
    });
    return slots;
  }

  // ---- Bảng cấu trúc + tóm tắt ----
  function renderStructure(s) {
    let rows = "";
    s.matrix.forEach((c, i) => {
      rows += `<tr>
        <td>${i + 1}</td>
        <td style="text-align:left">${c.content}</td>
        <td>${TYPE_LABELS[c.type]}</td>
        <td>${c.level}</td>
        <td>${c.sl}</td>
        <td>${c.d}</td>
        <td>${(c.sl * c.d).toFixed(2)}</td>
      </tr>`;
    });

    const warn = [];
    if (!s.filled)
      warn.push(`<div class="banner warn">⚠️ Học phần này <strong>chưa được điền cấu trúc câu hỏi</strong> trong file Excel. Bạn vẫn có thể nhập đề thủ công ở dưới.</div>`);
    if (s.needsReview)
      warn.push(`<div class="banner warn">⚠️ Tổng điểm theo file = <strong>${s.computedTotal}</strong> (khác 10). Cột "Đ" trong file gốc có thể ghi tổng điểm thay vì điểm mỗi câu — nên kiểm tra lại.</div>`);

    structureInfo.innerHTML = `
      <div class="meta-pills">
        <span class="pill">🎓 ${eduLevel(s.code)}</span>
        <span class="pill">${s.program}</span>
        <span class="pill">${s.language}</span>
        <span class="pill">⏱️ ${s.duration}</span>
        <span class="pill">📝 ${s.totalQ.TN} câu TN · ${s.totalQ.TL} câu tự luận</span>
        <span class="pill">${s.credits} tín chỉ</span>
      </div>
      ${warn.join("")}
      ${s.matrix.length ? `<table>
        <thead><tr><th>#</th><th>Nội dung</th><th>Loại</th><th>Cấp độ</th><th>SL</th><th>Đ/câu</th><th>Tổng</th></tr></thead>
        <tbody>${rows}
          <tr class="total-row"><td colspan="4">TỔNG</td>
            <td>${s.totalQ.TN + s.totalQ.TL}</td><td>—</td><td>${s.computedTotal}</td></tr>
        </tbody></table>` : ""}
    `;
    structureInfo.classList.remove("hidden");
  }

  // ---- Sinh ô nhập câu hỏi ----
  function renderQuestionForms(s) {
    questionForms.innerHTML = "";
    slotsCache = buildSlots(s);

    if (slotsCache.TN.length === 0 && slotsCache.TL.length === 0) {
      questionForms.innerHTML = `<p class="empty-note">Chưa có cấu trúc câu hỏi cho học phần này. (Bạn có thể bổ sung trong file <code>js/subjects.js</code>.)</p>`;
      return;
    }

    if (slotsCache.TN.length) {
      questionForms.appendChild(buildSectionBlock("TN", "PHẦN I. TRẮC NGHIỆM", slotsCache.TN));
    }
    if (slotsCache.TL.length) {
      questionForms.appendChild(buildSectionBlock("TL", "PHẦN II. TỰ LUẬN", slotsCache.TL));
    }
  }

  function buildSectionBlock(type, title, slots) {
    const block = document.createElement("div");
    block.className = "section-block";
    block.dataset.type = type;
    const totalPts = slots.reduce((a, b) => a + b.points, 0);
    block.innerHTML = `<h3>${title}</h3>
      <p class="section-meta">${slots.length} câu · ${TYPE_LABELS[type]} · tổng ${totalPts.toFixed(2)} điểm</p>`;
    slots.forEach((slot, i) => block.appendChild(buildQuestionItem(type, i, slot)));
    return block;
  }

  function buildQuestionItem(type, idx, slot) {
    const item = document.createElement("div");
    item.className = "question-item";
    item.dataset.type = type;
    item.dataset.idx = idx;

    let optionsHtml = "";
    if (type === "TN") {
      optionsHtml = `<div class="q-options">
        ${["A", "B", "C", "D"].map((L) => `
          <div class="q-option"><span>${L}.</span>
          <input type="text" class="opt" data-opt="${L}" placeholder="Lựa chọn ${L}" /></div>`).join("")}
      </div>`;
    }

    item.innerHTML = `
      <div class="q-head">
        <span class="q-label">Câu ${idx + 1}</span>
        <span class="q-badge">${slot.level}</span>
        <span class="q-badge alt">${slot.points} đ</span>
        <span class="q-content" title="${slot.content}">${slot.content}</span>
      </div>
      <textarea class="q-text" rows="2" placeholder="Nội dung câu hỏi..."></textarea>
      ${optionsHtml}
    `;
    return item;
  }

  // ---- Thu thập câu hỏi ----
  function collect(type) {
    const out = [];
    questionForms.querySelectorAll(`.question-item[data-type="${type}"]`).forEach((item, i) => {
      const text = item.querySelector(".q-text").value.trim();
      const opts = {};
      item.querySelectorAll(".opt").forEach((o) => (opts[o.dataset.opt] = o.value.trim()));
      out.push({ text, opts, slot: (type === "TN" ? slotsCache.TN : slotsCache.TL)[i] });
    });
    return out;
  }

  /* ---- Nạp câu hỏi từ văn bản / file ---- */
  function parseText(raw) {
    return raw.replace(/\r/g, "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((block) => {
      const lines = block.split("\n");
      const textLines = [], opts = {};
      lines.forEach((line) => {
        const m = line.match(/^\s*([A-Da-d])[.).]\s*(.*)$/);
        if (m) opts[m[1].toUpperCase()] = m[2].trim();
        else textLines.push(line.trim());
      });
      return { text: textLines.join(" ").trim(), opts };
    });
  }

  function distribute(parsed) {
    // Đổ lần lượt vào TN trước rồi TL
    const items = questionForms.querySelectorAll(".question-item");
    let n = 0;
    items.forEach((item, i) => {
      if (i >= parsed.length) return;
      const q = parsed[i];
      item.querySelector(".q-text").value = q.text || "";
      item.querySelectorAll(".opt").forEach((o) => (o.value = (q.opts && q.opts[o.dataset.opt]) || ""));
      n++;
    });
    return n;
  }

  function loadRaw(raw, isJson) {
    let parsed;
    try { parsed = isJson ? JSON.parse(raw) : parseText(raw); }
    catch (e) { alert("Không đọc được dữ liệu: " + e.message); return; }
    if (!Array.isArray(parsed)) { alert("JSON phải là một mảng câu hỏi."); return; }
    alert(`Đã nạp ${distribute(parsed)} câu.`);
  }

  /* ---- Xuất .docx theo mẫu FTU ---- */
  function exportDocx() {
    if (!currentCode) return;
    const s = SUBJECTS[currentCode];
    const mcqs = collect("TN");
    const essays = collect("TL");
    const variant = el("variantSelect").value;
    const doc = window.buildFtuExamDoc(s, mcqs, essays, { variant });
    window.docx.Packer.toBlob(doc).then((blob) => {
      const fileName = `De-thi-${currentCode}-${variant === "backup" ? "DuPhong" : "ChinhThuc"}.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      el("exportStatus").textContent = "✓ Đã tạo: " + fileName;
    }).catch((e) => alert("Lỗi tạo file Word: " + e.message));
  }

  function downloadTemplate(ev) {
    ev.preventDefault();
    const sample = `Câu hỏi trắc nghiệm mẫu: Thủ đô Việt Nam là?
A. Hà Nội
B. Đà Nẵng
C. Huế
D. TP. Hồ Chí Minh

Câu hỏi tự luận mẫu: Trình bày vai trò của Marketing số.`;
    const blob = new Blob([sample], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "mau-cau-hoi.txt"; a.click();
  }

  // ---- Chọn một môn (từ gợi ý) ----
  function selectSubject(code) {
    currentCode = code;
    const s = SUBJECTS[code];
    subjectInput.value = `${s.code} — ${s.name}`;
    hideSuggest();
    renderStructure(s); renderQuestionForms(s);
    ["step-questions", "step-export"].forEach((id) => el(id).classList.remove("hidden"));
    el("exportStatus").textContent = "";
  }

  function clearSelection() {
    currentCode = null;
    structureInfo.classList.add("hidden");
    ["step-questions", "step-export"].forEach((id) => el(id).classList.add("hidden"));
  }

  // ---- Sự kiện combobox ----
  subjectInput.addEventListener("input", function () {
    clearSelection();
    showSuggest(this.value);
  });
  subjectInput.addEventListener("focus", function () { showSuggest(this.value); });
  subjectInput.addEventListener("blur", function () { setTimeout(hideSuggest, 150); });
  subjectInput.addEventListener("keydown", function (e) {
    if (suggestBox.classList.contains("hidden") || !curMatches.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((activeIdx + 1) % curMatches.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((activeIdx - 1 + curMatches.length) % curMatches.length); }
    else if (e.key === "Enter") { e.preventDefault(); selectSubject(curMatches[activeIdx >= 0 ? activeIdx : 0].code); }
    else if (e.key === "Escape") { hideSuggest(); }
  });
  suggestBox.addEventListener("mousedown", function (e) {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    e.preventDefault();
    selectSubject(curMatches[+li.dataset.i].code);
  });

  el("exportBtn").addEventListener("click", exportDocx);
  el("downloadTemplate").addEventListener("click", downloadTemplate);
  el("loadPasteBtn").addEventListener("click", function () {
    const raw = el("pasteArea").value.trim();
    if (!raw) { alert("Ô dán đang trống."); return; }
    loadRaw(raw, false);
  });
  el("fileUpload").addEventListener("change", function (ev) {
    const file = ev.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (e) => loadRaw(e.target.result, file.name.toLowerCase().endsWith(".json"));
    r.readAsText(file, "utf-8");
  });
})();
