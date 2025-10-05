const BASE_URL = window.location.origin;

function createButton() {
    if (document.getElementById("xem-ngay-button")) return;
    const t = document.createElement("button");
    t.id = "xem-ngay-button";
    t.textContent = "Xem ngay";
    t.className = "xem-ngay-fixed-btn";
    t.onclick = handleClick;
    document.body.appendChild(t);
    addTooltip(t, "Xem danh sách lớp học phần đã đăng ký");

    // Create toast container
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
}

async function registerClass(classId, classCode) {
    try {
        showToast("Đang đăng ký lớp học phần...", "info");
        const account = localStorage.getItem("account");
        if (!account) {
            showToast("Vui lòng đăng nhập lại!", "error");
            return;
        }

        const dotSelect = document.getElementById("dot-select");
        const idDot = dotSelect.value;
        if (!idDot) {
            showToast("Vui lòng chọn đợt đăng ký!", "error");
            return;
        }

        const response = await fetch(`${BASE_URL}/api/v1/dkhp/dangKyLopHocPhan`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${account}`,
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                idDot: idDot,
                idLopHocPhan: classId
            })
        });

        const data = await response.json();
        if (data.success) {
            showToast(`Đăng ký lớp ${classCode} thành công!`, "success");
            // Có thể refresh lại danh sách đã đăng ký hoặc cập nhật trạng thái
        } else {
            showToast(`Đăng ký thất bại: ${data.message || "Lỗi không xác định"}`, "error");
        }
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        showToast("Lỗi khi đăng ký: " + error.message, "error");
    }
}

function showToast(message, type = "info", duration = 3000) {
    nt.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
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
    const t = document.getElementById("xem-ngay-button");
    showLoading(t);
    const account = localStorage.getItem("account");
    if (account) try {
        const n = await getDotId();
        const e = await fetch(`${BASE_URL}/api/v1/dkhp/getLHPDaDangKy?idDot=${n}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${account}`, "Content-Type": "application/json" },
            credentials: "include"
        });
        const a = await e.json();
        hideLoading(t);
        if (a.success) {
            showModal(a.body);
            showToast("Đã tải danh sách lớp học phần thành công", "success");
        } else {
            showToast("Không lấy được dữ liệu từ API", "error");
        }
    } catch (error) {
        hideLoading(t);
        console.error(error);
        showToast("Lỗi khi gọi API: " + error.message, "error");
    } else {
        hideLoading(t);
        showToast("Vui lòng đăng nhập hoặc tải lại trang để sử dụng chức năng này!", "error");
    }
}

function showModal(t) {
    if (document.getElementById("lhp-modal")) return;
    const n = document.createElement("div");
    n.id = "lhp-modal";
    n.className = "lhp-drawer-overlay";
    n.innerHTML = `
    <div class="lhp-drawer-content">
    <button id="view-new-subjects-btn" class="view-new-btn">Xem học phần các đợt khác</button>
      <h2>Lớp học phần đã đăng ký</h2>
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
              <td>${t.tenTrangThaiLopHocPhan}</td>
              <td>${new Date(t.ngayDangKy).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <button id="close-lhp-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(n);
    setTimeout(() => n.classList.add("open"), 10);
    document.getElementById("close-lhp-modal").onclick = () => {
        n.classList.remove("open");
        setTimeout(() => n.remove(), 300);
    };
    document.getElementById("view-new-subjects-btn").onclick = () => {
        showNewSubjectsModal();
        showToast("Mở panel xem học phần mới", "info");
    };
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
    a.className = "lhp-drawer-overlay";
    a.innerHTML = `
    <div class="lhp-drawer-content" style="max-width: 800px;">
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
    setTimeout(() => a.classList.add("open"), 10);
    document.getElementById("close-other-class-modal").onclick = () => {
        a.classList.remove("open");
        setTimeout(() => a.remove(), 300);
    };
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
    o.className = "lhp-drawer-overlay";
    o.innerHTML = `
    <div class="lhp-drawer-content" style="max-width: 900px;">
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
    setTimeout(() => o.classList.add("open"), 10);
    document.getElementById("close-class-detail-modal").onclick = () => {
        o.classList.remove("open");
        setTimeout(() => o.remove(), 300);
    };
}

async function showNewSubjectsModal() {
    try {
        const t = await getDotsList();
        const n = document.createElement("div");
        n.id = "new-subjects-modal";
        n.className = "lhp-drawer-overlay";
        n.innerHTML = `
      <div class="lhp-drawer-content" style="max-width: 600px;">
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
        setTimeout(() => n.classList.add("open"), 10);
        document.getElementById("close-new-subjects-modal").onclick = () => {
            n.classList.remove("open");
            setTimeout(() => n.remove(), 300);
        };
        document.getElementById("dot-select").onchange = async function () {
            const t = this.value;
            if (t) {
                showToast("Đang tải danh sách học phần...", "info");
                try {
                    const n = localStorage.getItem("account");
                    const e = await fetch(`${BASE_URL}/api/v1/dkhp/getHocPhanHocMoi?idDot=${t}`, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${n}`, "Content-Type": "application/json" },
                        credentials: "include"
                    });
                    const a = await e.json();
                    if (a.success) {
                        displayNewSubjects(a.body || []);
                        showToast("Đã tải danh sách học phần thành công", "success");
                    } else {
                        showToast("Không lấy được học phần mới", "error");
                    }
                } catch (t) {
                    console.error(t);
                    showToast("Lỗi khi gọi API học phần mới: " + t.message, "error");
                }
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
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${t.map((subject => `
        <tr class="expandable-row" data-ma="${subject.maHocPhan}" data-loaded="false">
          <td>${subject.maHocPhan}</td>
          <td>${subject.tenHocPhan}</td>
          <td>${subject.soTinChi}</td>
          <td><span class="expand-icon">▶</span></td>
        </tr>
        <tr class="expandable-content">
          <td colspan="4">
            <div class="sub-table-container" style="display: none;">
              <table class="sub-table">
                <thead>
                  <tr>
                    <th>Mã LHP</th>
                    <th>Trạng thái</th>
                    <th>Phần trăm đăng ký</th>
                    <th>Được đăng ký?</th>
                    <th>Chi tiết</th>
                    <th>Đăng ký</th>
                  </tr>
                </thead>
                <tbody class="sub-table-body">
                  <!-- Classes will be loaded here -->
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      `)).join("")}
    </tbody>
  `;

    // Add event listeners for expandable rows
    document.querySelectorAll(".expandable-row").forEach((row => {
        addTooltip(row, "Click để xem các lớp học phần");
        row.addEventListener("click", async () => {
            const maHocPhan = row.getAttribute("data-ma");
            const contentRow = row.nextElementSibling;
            const container = contentRow.querySelector(".sub-table-container");
            const icon = row.querySelector(".expand-icon");
            const isExpanded = row.classList.contains("expanded");

            if (isExpanded) {
                // Collapse
                row.classList.remove("expanded");
                contentRow.classList.remove("expanded");
                icon.textContent = "▶";
                setTimeout(() => container.style.display = "none", 300);
            } else {
                // Expand
                row.classList.add("expanded");
                contentRow.classList.add("expanded");
                icon.textContent = "▼";
                container.style.display = "block";

                // Load data if not loaded
                if (row.getAttribute("data-loaded") === "false") {
                    showToast("Đang tải danh sách lớp...", "info");
                    try {
                        const dotSelect = document.getElementById("dot-select");
                        const idDot = dotSelect.value;
                        if (!idDot) {
                            showToast("Vui lòng chọn đợt trước!", "error");
                            // Collapse back
                            row.classList.remove("expanded");
                            contentRow.classList.remove("expanded");
                            icon.textContent = "▶";
                            setTimeout(() => container.style.display = "none", 300);
                            return;
                        }

                        const account = localStorage.getItem("account") || "";
                        const response = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanChoDangKy?idDot=${idDot}&maHocPhan=${maHocPhan}&isLocTrung=false&isLocTrungWithoutElearning=false`, {
                            headers: { Authorization: `Bearer ${account}`, "Content-Type": "application/json" },
                            credentials: "include"
                        });
                        const data = await response.json();
                        if (data.success) {
                            const tbody = container.querySelector(".sub-table-body");
                            tbody.innerHTML = data.body.map(cls => `
                              <tr>
                                <td>${cls.maLopHocPhan}</td>
                                <td>${cls.tenTrangThai}</td>
                                <td>${cls.phanTramDangKy}%</td>
                                <td>${cls.choDangKy ? "✔️" : "❌"}</td>
                                <td><button class="xem-chi-tiet-btn" data-id="${cls.id}" data-ma="${cls.maLopHocPhan}">Chi tiết</button></td>
                                <td><button class="dang-ky-btn ${cls.choDangKy ? '' : 'disabled'}" data-id="${cls.id}" data-ma="${cls.maLopHocPhan}" ${cls.choDangKy ? '' : 'disabled'}>Đăng ký</button></td>
                              </tr>
                            `).join("");

                            // Add event listeners for detail buttons
                            tbody.querySelectorAll(".xem-chi-tiet-btn").forEach(btn => {
                                btn.addEventListener("click", async () => {
                                    const id = btn.getAttribute("data-id");
                                    const ma = btn.getAttribute("data-ma");
                                    await showClassDetailModal(id, ma);
                                });
                            });

                            // Add event listeners for register buttons
                            tbody.querySelectorAll(".dang-ky-btn").forEach(btn => {
                                btn.addEventListener("click", async () => {
                                    const id = btn.getAttribute("data-id");
                                    const ma = btn.getAttribute("data-ma");
                                    await registerClass(id, ma);
                                });
                            });

                            row.setAttribute("data-loaded", "true");
                            showToast("Đã tải danh sách lớp thành công", "success");
                        } else {
                            showToast("Không lấy được lớp học phần", "error");
                            // Collapse back
                            row.classList.remove("expanded");
                            contentRow.classList.remove("expanded");
                            icon.textContent = "▶";
                            setTimeout(() => container.style.display = "none", 300);
                        }
                    } catch (error) {
                        console.error(error);
                        showToast("Lỗi khi gọi API lớp học phần: " + error.message, "error");
                        // Collapse back
                        row.classList.remove("expanded");
                        contentRow.classList.remove("expanded");
                        icon.textContent = "▶";
                        setTimeout(() => container.style.display = "none", 300);
                    }
                }
            }
        });
    }));
}

createButton();

// Utility functions for better UX
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function addTooltip(element, text) {
    element.classList.add("tooltip");
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip-text";
    tooltip.textContent = text;
    element.appendChild(tooltip);
}

function showLoading(button) {
    const spinner = document.createElement("span");
    spinner.className = "loading-spinner";
    button.disabled = true;
    button.insertBefore(spinner, button.firstChild);
}

function hideLoading(button) {
    const spinner = button.querySelector(".loading-spinner");
    if (spinner) spinner.remove();
    button.disabled = false;
}

function toggleExpandable(element) {
    element.classList.toggle("expanded");
}