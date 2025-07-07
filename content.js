// Biến toàn cục để lưu base URL
const BASE_URL = window.location.origin;

function createButton() {
    if (document.getElementById("xem-ngay-button")) return;

    const btn = document.createElement("button");
    btn.id = "xem-ngay-button";
    btn.textContent = "Xem ngay";
    btn.className = "xem-ngay-fixed-btn";
    btn.onclick = handleClick;
    document.body.appendChild(btn);
}

async function getDotId() {
    const token = localStorage.getItem("account");

    if (!token) {
        throw new Error("Không tìm thấy token!");
    }

    try {
        const res = await fetch(`${BASE_URL}/api/v1/dkhp/getDot`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (data.success && data.body && data.body.length > 0) {
            // Lấy đợt đầu tiên hoặc đợt hiện tại (có thể thêm logic để chọn đợt phù hợp)
            return data.body[0].id;
        } else {
            throw new Error("Không lấy được thông tin đợt đăng ký");
        }
    } catch (err) {
        console.error("Lỗi khi lấy ID đợt:", err);
        throw err;
    }
}

async function handleClick() {
    const token = localStorage.getItem("account"); // hoặc lấy từ sessionStorage, cookie...

    if (!token) {
        alert("Không tìm thấy token!");
        return;
    }

    try {
        // Lấy ID đợt động
        const dotId = await getDotId();

        const res = await fetch(`${BASE_URL}/api/v1/dkhp/getLHPDaDangKy?idDot=${dotId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            credentials: "include" // nếu server yêu cầu cookie
        });

        const data = await res.json();

        if (data.success) {
            showModal(data.body);
        } else {
            alert("Không lấy được dữ liệu từ API");
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi gọi API: " + err.message);
    }
}


function showModal(classes) {
    if (document.getElementById("lhp-modal")) return;

    const modal = document.createElement("div");
    modal.id = "lhp-modal";
    modal.className = "lhp-modal-overlay";
    modal.innerHTML = `
    <div class="lhp-modal-content">
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
          ${classes.map((lhp, index) => `
            <tr>
              <td><button class="other-class-btn" data-ma="${lhp.maLopHocPhan}">Lớp khác</button></td>
              <td>${lhp.maLopHocPhan}</td>
              <td>${lhp.tenMonHoc}</td>
              <td>${lhp.lopDuKien}</td>
              <td>${lhp.soTinChi}</td>
              <td>${lhp.mucHocPhi.toLocaleString()}</td>
              <td>${lhp.tenTrangThaiDangKy}</td>
              <td>${new Date(lhp.ngayDangKy).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button id="close-lhp-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(modal);

    document.getElementById("close-lhp-modal").onclick = () => {
        modal.remove();
    };

    document.querySelectorAll(".other-class-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const maLopHocPhan = btn.getAttribute("data-ma");
            const maHocPhan = maLopHocPhan.slice(0, 10);
            try {
                const token = localStorage.getItem("account") || ""; // hoặc get từ cookie

                // Lấy ID đợt động
                const dotId = await getDotId();

                const res = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanChoDangKy?idDot=${dotId}&maHocPhan=${maHocPhan}&isLocTrung=false&isLocTrungWithoutElearning=false`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });

                const data = await res.json();
                if (data.success) {
                    showOtherClassModal(data.body || [], data.body[0]?.tenMonHoc || "Không rõ tên môn học");
                } else {
                    alert("Không lấy được lớp khác.");
                }
            } catch (e) {
                console.error(e);
                alert("Lỗi khi gọi API lớp khác: " + e.message);
            }
        });
    });
}

function showOtherClassModal(list, tenMonHoc) {
    const existing = document.getElementById("other-class-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "other-class-modal";
    modal.className = "lhp-modal-overlay";
    modal.innerHTML = `
    <div class="lhp-modal-content" style="max-width: 800px;">
      <h3>Các lớp khác của môn: ${tenMonHoc}</h3>
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
          ${list.map(lhp => `
            <tr>
              <td>${lhp.maLopHocPhan}</td>
              <td>${lhp.tenTrangThai}</td>
              <td>${lhp.phanTramDangKy}%</td>
              <td>${lhp.choDangKy ? "✔️" : "❌"}</td>
              <td><button class="xem-chi-tiet-btn" data-id="${lhp.id}" data-ma="${lhp.maLopHocPhan}">Chi tiết</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button id="close-other-class-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(modal);

    document.getElementById("close-other-class-modal").onclick = () => modal.remove();

    // Thêm event listener cho các nút "Xem chi tiết"
    document.querySelectorAll(".xem-chi-tiet-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const idLopHocPhan = btn.getAttribute("data-id");
            const maLopHocPhan = btn.getAttribute("data-ma");
            await showClassDetailModal(idLopHocPhan, maLopHocPhan);
        });
    });
}


async function showClassDetailModal(idLopHocPhan, maLopHocPhan) {
    try {
        const token = localStorage.getItem("account");
        if (!token) {
            alert("Không tìm thấy token!");
            return;
        }

        const res = await fetch(`${BASE_URL}/api/v1/dkhp/getLopHocPhanDetail?idLopHocPhan=${idLopHocPhan}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            displayClassDetail(data.body || [], maLopHocPhan);
        } else {
            alert("Không lấy được chi tiết lớp học phần.");
        }
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết lớp học phần:", err);
        alert("Lỗi khi gọi API chi tiết: " + err.message);
    }
}

function displayClassDetail(schedules, maLopHocPhan) {
    const existing = document.getElementById("class-detail-modal");
    if (existing) existing.remove();

    const daysOfWeek = {
        2: "Thứ 2",
        3: "Thứ 3",
        4: "Thứ 4",
        5: "Thứ 5",
        6: "Thứ 6",
        7: "Thứ 7",
        8: "Chủ nhật"
    };

    const modal = document.createElement("div");
    modal.id = "class-detail-modal";
    modal.className = "lhp-modal-overlay";
    modal.innerHTML = `
    <div class="lhp-modal-content" style="max-width: 900px;">
      <h3>Chi tiết lịch học - Mã lớp học phần: ${maLopHocPhan}</h3>
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
          ${schedules.length > 0 ? schedules.map(schedule => `
            <tr>
              <td>${daysOfWeek[schedule.thu] || `Thứ ${schedule.thu}`}</td>
              <td>${schedule.tietHoc}</td>
              <td>${schedule.loaiLich}</td>
              <td>${schedule.dayNha || "-"}</td>
              <td>${schedule.phong || "-"}</td>
              <td>${new Date(schedule.ngayBatDau).toLocaleDateString('vi-VN')}</td>
              <td>${new Date(schedule.ngayKetThuc).toLocaleDateString('vi-VN')}</td>
              <td>${schedule.ghiChu || "-"}</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="8" style="text-align: center;">Không có lịch học</td>
            </tr>
          `}
        </tbody>
      </table>
      <button id="close-class-detail-modal" class="close-modal-btn">Đóng</button>
    </div>
  `;
    document.body.appendChild(modal);

    document.getElementById("close-class-detail-modal").onclick = () => modal.remove();
}

function observeText() {
    const observer = new MutationObserver(() => {
        const found = [...document.body.querySelectorAll("*")]
            .some(el => el.textContent.includes("Học phần đã đăng ký trong học kỳ này"));
        if (found) {
            createButton();
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

observeText();
