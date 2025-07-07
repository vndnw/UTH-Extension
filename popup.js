// Popup JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Hiển thị thông tin phiên bản và thời gian
    updateVersionInfo();

    // Thêm event listeners cho các links (nếu có)
    setupEventListeners();

    // Log thống kê sử dụng (tùy chọn)
    logPopupView();
});

function updateVersionInfo() {
    const versionElement = document.querySelector('.version');
    if (versionElement) {
        const currentDate = new Date().toLocaleDateString('vi-VN');
        versionElement.textContent = `Phiên bản 1.0 - Cập nhật: ${currentDate}`;
    }
}

function setupEventListeners() {
    // Có thể thêm các event listeners cho buttons hoặc links trong tương lai
    console.log('Popup loaded successfully');
}

function logPopupView() {
    // Log việc mở popup (có thể dùng cho analytics)
    const currentTime = new Date().toISOString();
    console.log('Popup viewed at:', currentTime);

    // Có thể lưu vào localStorage để theo dõi số lần sử dụng
    let viewCount = parseInt(localStorage.getItem('popup_view_count') || '0');
    viewCount++;
    localStorage.setItem('popup_view_count', viewCount.toString());
    localStorage.setItem('last_popup_view', currentTime);
}

// Hàm tiện ích để có thể gọi từ HTML (nếu cần)
function openExternalLink(url) {
    chrome.tabs.create({ url: url });
}

// Có thể thêm các hàm khác để tương tác với content script
function getExtensionStatus() {
    return {
        version: '1.0',
        status: 'active',
        lastUpdate: new Date().toISOString()
    };
}
