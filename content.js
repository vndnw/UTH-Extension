const BASE_URL = window.location.origin;

function createButton() {
    if (document.getElementById("xem-ngay-button")) return;
    const t = document.createElement("button");
    t.id = "xem-ngay-button";
    t.textContent = "Xem ngay";
    t.className = "xem-ngay-fixed-btn";
    t.onclick = handleClick;
    document.body.appendChild(t);
}

async function getDotId() {
    const t = localStorage.getItem("account");
    if (!t) throw new Error("Vui lòng đăng nhập hoặc tải lại trang để tiếp tục!");
    try {
        const n = await fetch(`${BASE_URL}/api/v1/dkhp/getDot`, {
            method: "GET",
            headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            credentials: "include"
        });
        const e = await n.json();
        if (e.success && e.body && e.body.length > 0) return e.body[0].id;
        throw new Error("Không lấy được thông tin đợt đăng ký");
    } catch (t) {
        throw console.error("Lỗi khi lấy ID đợt:", t), t;
    }
}

async function getDotsList() {
    const t = localStorage.getItem("account");
    if (!t) throw new Error("Vui lòng đăng nhập hoặc tải lại trang để tiếp tục!");
    try {
        const n = await fetch(`${BASE_URL}/api/v1/dkhp/getDot`, {
            method: "GET",
            headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            credentials: "include"
        });
        const e = await n.json();
        if (e.success && e.body) return e.body;
        throw new Error("Không lấy được danh sách đợt");
    } catch (t) {
        throw console.error("Lỗi khi lấy danh sách đợt:", t), t;
    }
}

async function handleClick() {
    const t = localStorage.getItem("account");
    if (t) try {
        const n = await getDotId();
        const e = await fetch(`${BASE_URL}/api/v1/dkhp/getLHPDaDangKy?idDot=${n}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            credentials: "include"
        });
        const a = await e.json();
        a.success ? showModal(a.body) : alert("Không lấy được dữ liệu từ API");
    } catch (t) {
        console.error(t);
        alert("Lỗi khi gọi API: " + t.message);
    } else alert("Vui lòng đăng nhập hoặc tải lại trang để sử dụng chức năng này!");
}

function showModal(t) {
    if (document.getElementById("lhp-modal")) return;
    const n = document.createElement("div");
    n.id = "lhp-modal";
    n.className = "lhp-modal-overlay";
    n.innerHTML = `
    <div class="lhp-modal-content">
      <h2>Lớp học phần đã đăng ký</h2>
      <button id="view-new-subjects-btn" class="view-new-btn">Xem học phần học mới</button>
      <table class="lhp-table">
        <thead>
          <tr>
            <th>Các lớp khác</th>
            <th>Mã LHP</th>
            <th>Tên môn học</th>
            <th>Lớp dự kiến</th>
            <th>Tín chỉ</th>
            <th>Học phí</th>
            <th>Trạng thái</th>
            <th>Ngày đăng ký</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((t, n) => `
            <tr>
              <td><button class="other-class-btn" data-ma="${t.maLopHocPhan}">Lớp khác</button></td>
              <td>${t.maLopHocPhan}</td>
              <td>${t.tenMonHoc}</td>
              <td>${t.lopDuKien}</td>
              <td>${t.soTinChi}</td>
              <td>${t.mucHocPhi.toLocaleString()}</td>
              <td>${t.tenTrangThaiDangKy}</td>
              <td>${new Date(t.ngayDangKy).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <button id="close-lhp-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(n);
    document.getElementById("close-lhp-modal").onclick = () => { n.remove(); };
    document.getElementById("view-new-subjects-btn").onclick = showNewSubjectsModal;
    document.querySelectorAll(".other-class-btn").forEach((t => {
        t.addEventListener("click", (async () => {
            const n = t.getAttribute("data-ma").slice(0, 10);
            try {
                const t = localStorage.getItem("account") || "";
                const e = await getDotId();
                const a = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanChoDangKy?idDot=${e}&maHocPhan=${n}&isLocTrung=false&isLocTrungWithoutElearning=false`, {
                    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
                    credentials: "include"
                });
                const o = await a.json();
                o.success ? showOtherClassModal(o.body || [], o.body[0]?.tenMonHoc || "Không rõ tên môn học") : alert("Không lấy được lớp khác.");
            } catch (t) {
                console.error(t);
                alert("Lỗi khi gọi API lớp khác: " + t.message);
            }
        }));
    }));
}

function showOtherClassModal(t, n) {
    const e = document.getElementById("other-class-modal");
    e && e.remove();
    const a = document.createElement("div");
    a.id = "other-class-modal";
    a.className = "lhp-modal-overlay";
    a.innerHTML = `
    <div class="lhp-modal-content" style="max-width: 800px;">
      <h3>Các lớp khác của môn: ${n}</h3>
      <table class="lhp-table">
        <thead>
          <tr>
            <th>Mã LHP</th>
            <th>Trạng thái</th>
            <th>Phần trăm đăng ký</th>
            <th>Được đăng ký?</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((t => `
            <tr>
              <td>${t.maLopHocPhan}</td>
              <td>${t.tenTrangThai}</td>
              <td>${t.phanTramDangKy}%</td>
              <td>${t.choDangKy ? "✔️" : "❌"}</td>
              <td><button class="xem-chi-tiet-btn" data-id="${t.id}" data-ma="${t.maLopHocPhan}">Chi tiết</button></td>
            </tr>
          `)).join("")}
        </tbody>
      </table>
      <button id="close-other-class-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(a);
    document.getElementById("close-other-class-modal").onclick = () => a.remove();
    document.querySelectorAll(".xem-chi-tiet-btn").forEach((t => {
        t.addEventListener("click", (async () => {
            const n = t.getAttribute("data-id");
            const e = t.getAttribute("data-ma");
            await showClassDetailModal(n, e);
        }));
    }));
}

async function showClassDetailModal(t, n) {
    try {
        const e = localStorage.getItem("account");
        if (!e) return void alert("Vui lòng đăng nhập hoặc tải lại trang để xem chi tiết!");
        const a = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanDetail?idLopHocPhan=${t}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${e}`, "Content-Type": "application/json" },
            credentials: "include"
        });
        const o = await a.json();
        o.success ? displayClassDetail(o.body || [], n) : alert("Không lấy được chi tiết lớp học phần.");
    } catch (t) {
        console.error("Lỗi khi lấy chi tiết lớp học phần:", t);
        alert("Lỗi khi gọi API chi tiết: " + t.message);
    }
}

function displayClassDetail(t, n) {
    const e = document.getElementById("class-detail-modal");
    e && e.remove();
    const a = { 2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5", 6: "Thứ 6", 7: "Thứ 7", 8: "Chủ nhật" };
    const o = document.createElement("div");
    o.id = "class-detail-modal";
    o.className = "lhp-modal-overlay";
    o.innerHTML = `
    <div class="lhp-modal-content" style="max-width: 900px;">
      <h3>Chi tiết lịch học - Mã lớp học phần: ${n}</h3>
      <table class="lhp-table">
        <thead>
          <tr>
            <th>Thứ</th>
            <th>Tiết học</th>
            <th>Loại lịch</th>
            <th>Dãy nhà</th>
            <th>Phòng</th>
            <th>Ngày bắt đầu</th>
            <th>Ngày kết thúc</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${t.length > 0 ? t.map((t => `
            <tr>
              <td>${a[t.thu] || `Thứ ${t.thu}`}</td>
              <td>${t.tietHoc}</td>
              <td>${t.loaiLich}</td>
              <td>${t.dayNha || "-"}</td>
              <td>${t.phong || "-"}</td>
              <td>${new Date(t.ngayBatDau).toLocaleDateString("vi-VN")}</td>
              <td>${new Date(t.ngayKetThuc).toLocaleDateString("vi-VN")}</td>
              <td>${t.ghiChu || "-"}</td>
            </tr>
          `)).join("") : `
            <tr>
              <td colspan="8" style="text-align: center;">Không có lịch học</td>
            </tr>
          `}
        </tbody>
      </table>
      <button id="close-class-detail-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(o);
    document.getElementById("close-class-detail-modal").onclick = () => o.remove();
}

async function showNewSubjectsModal() {
    try {
        const t = await getDotsList();
        const n = document.createElement("div");
        n.id = "new-subjects-modal";
        n.className = "lhp-modal-overlay";
        n.innerHTML = `
      <div class="lhp-modal-content" style="max-width: 600px;">
        <h3>Chọn đợt để xem học phần học mới</h3>
        <select id="dot-select" class="dot-select">
          <option value="">Chọn đợt</option>
          ${t.map((t => `<option value="${t.id}">${t.tenHocKy}</option>`)).join("")}
        </select>
        <div id="subjects-container" style="display:none;">
          <h4>Danh sách học phần</h4>
          <table class="lhp-table" id="subjects-table"></table>
        </div>
        <button id="close-new-subjects-modal" class="close-modal-btn">Đóng</button>
      </div>
    `;
        document.body.appendChild(n);
        document.getElementById("close-new-subjects-modal").onclick = () => n.remove();
        document.getElementById("dot-select").onchange = async function () {
            const t = this.value;
            if (t) try {
                const n = localStorage.getItem("account");
                const e = await fetch(`${BASE_URL}/api/v1/dkhp/getHocPhanHocMoi?idDot=${t}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${n}`, "Content-Type": "application/json" },
                    credentials: "include"
                });
                const a = await e.json();
                a.success ? displayNewSubjects(a.body || []) : alert("Không lấy được học phần mới.");
            } catch (t) {
                console.error(t);
                alert("Lỗi khi gọi API học phần mới: " + t.message);
            }
        };
    } catch (t) {
        console.error(t);
        alert("Lỗi khi tải danh sách đợt: " + t.message);
    }
}

function displayNewSubjects(t) {
    const n = document.getElementById("subjects-container");
    const e = document.getElementById("subjects-table");
    n.style.display = "block";
    e.innerHTML = `
    <thead>
      <tr>
        <th>Mã học phần</th>
        <th>Tên học phần</th>
        <th>Tín chỉ</th>
        <th>Chi tiết</th>
      </tr>
    </thead>
    <tbody>
      ${t.map((t => `
        <tr>
          <td>${t.maHocPhan}</td>
          <td>${t.tenHocPhan}</td>
          <td>${t.soTinChi}</td>
          <td><button class="view-classes-btn" data-ma="${t.maHocPhan}">Xem lớp</button></td>
        </tr>
      `)).join("")}
    </tbody>
  `;
    // Add event listeners for view classes buttons
    document.querySelectorAll(".view-classes-btn").forEach((btn => {
        btn.addEventListener("click", async () => {
            const maHocPhan = btn.getAttribute("data-ma");
            const dotSelect = document.getElementById("dot-select");
            const idDot = dotSelect.value;
            if (!idDot) {
                alert("Vui lòng chọn đợt trước!");
                return;
            }
            try {
                const account = localStorage.getItem("account") || "";
                const response = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanChoDangKy?idDot=${idDot}&maHocPhan=${maHocPhan}&isLocTrung=false&isLocTrungWithoutElearning=false`, {
                    headers: { Authorization: `Bearer ${account}`, "Content-Type": "application/json" },
                    credentials: "include"
                });
                const data = await response.json();
                if (data.success) {
                    showClassesModal(data.body || [], t.find(s => s.maHocPhan === maHocPhan)?.tenHocPhan || "Không rõ tên học phần");
                } else {
                    alert("Không lấy được lớp học phần.");
                }
            } catch (error) {
                console.error(error);
                alert("Lỗi khi gọi API lớp học phần: " + error.message);
            }
        });
    }));
}

function showClassesModal(t, subjectName) {
    const existingModal = document.getElementById("classes-modal");
    if (existingModal) existingModal.remove();
    const modal = document.createElement("div");
    modal.id = "classes-modal";
    modal.className = "lhp-modal-overlay";
    modal.innerHTML = `
    <div class="lhp-modal-content" style="max-width: 800px;">
      <h3>Các lớp của học phần: ${subjectName}</h3>
      <table class="lhp-table">
        <thead>
          <tr>
            <th>Mã LHP</th>
            <th>Trạng thái</th>
            <th>Phần trăm đăng ký</th>
            <th>Được đăng ký?</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          ${t.map((cls => `
            <tr>
              <td>${cls.maLopHocPhan}</td>
              <td>${cls.tenTrangThai}</td>
              <td>${cls.phanTramDangKy}%</td>
              <td>${cls.choDangKy ? "✔️" : "❌"}</td>
              <td><button class="xem-chi-tiet-btn" data-id="${cls.id}" data-ma="${cls.maLopHocPhan}">Chi tiết</button></td>
            </tr>
          `)).join("")}
        </tbody>
      </table>
      <button id="close-classes-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(modal);
    document.getElementById("close-classes-modal").onclick = () => modal.remove();
    document.querySelectorAll("#classes-modal .xem-chi-tiet-btn").forEach((btn => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            const ma = btn.getAttribute("data-ma");
            await showClassDetailModal(id, ma);
        });
    }));
}

createButton();
