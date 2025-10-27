function handlePaymentPage() {
    // 1. Lấy dữ liệu từ LocalStorage
    const bookingDataStr = localStorage.getItem('bookingData');
    const bookingData = bookingDataStr ? JSON.parse(bookingDataStr) : null;

    // Kiểm tra dữ liệu
    if (!bookingData || !bookingData.flight || !bookingData.passenger) {
        document.querySelector('.payment').innerHTML = "<p>Lỗi: Không tìm thấy thông tin đặt chỗ. Vui lòng quay lại trang đặt vé.</p>";
        console.error("Dữ liệu đặt chỗ bị thiếu hoặc không hợp lệ.");
        return;
    }

    // Phân rã dữ liệu
    const { flight, passenger, services, seat } = bookingData;

    // Lấy các phần tử HTML theo ID mới
    const flightDetailsEl = document.getElementById('flight-details'); // Dùng thay cho #flight-info và #user-info
    const costSummaryEl = document.getElementById('cost-summary');     // Dùng thay cho #summary-details
    const payButton = document.getElementById('pay-button');

    // --- Tính toán chi phí ---
    let basePrice = Number(flight.price);
    let baggagePrice = services.baggage.price;
    let mealPrice = services.meal.price;

    // Các phí cố định (Mô phỏng)
    const system_service = 215000;
    const service_management = 410000;
    const airport_fee = 99000;
    const security_screening = 20000;
    const value_added_tax = 40000;

    const subTotal = basePrice + baggagePrice + mealPrice;
    const totalAmount = subTotal + system_service + service_management + airport_fee + security_screening + value_added_tax;

    // -----------------------------------------------------------------
    // A. IN THÔNG TIN CHUYẾN BAY, GHẾ & HÀNH KHÁCH (Vào #flight-details)
    // -----------------------------------------------------------------
    flightDetailsEl.innerHTML = `
    <div class="flight">
        <h3>Chi tiết chuyến bay</h3>
        <div class="detail-row"><span class="label">Mã chuyến bay:</span> <span class="info">${flight.code} (${flight.type})</span></div>
        <div class="detail-row"><span class="label">Chặng bay:</span> <span class="info">${flight.airport_from} ✈ ${flight.airport_to}</span></div>
        <div class="detail-row"><span class="label">Khởi hành:</span> <span class="info">${flight.time_from}</span></div>
        <div class="detail-row"><span class="label">Ghế đã chọn:</span> <span class="info">${seat}</span></div>
    
        <h3>Thông tin hành khách</h3>
        <div class="detail-row"><span class="label">Họ tên:</span> <span class="info"> (${passenger.Danh_xung}) ${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></div>
        <div class="detail-row"><span class="label">Email:</span> <span class="info">${passenger.Email}</span></div>
        <div class="detail-row"><span class="label">Điện thoại:</span> <span class="info">${passenger.Ma_quoc_gia} ${passenger.So_dien_thoai.replace(/^0/, '')}</span></div>
        <div class="detail-row"><span class="label">Dịch vụ (Hành lý):</span> <span class="info">${services.baggage.type}</span></div>
        <div class="detail-row"><span class="label">Dịch vụ (Bữa ăn):</span> <span class="info">${services.meal.type}</span></div>
    </div>
    `;

    // -----------------------------------------------------------------
    // B. IN TÓM TẮT CHI PHÍ (Vào #cost-summary)
    // -----------------------------------------------------------------
    costSummaryEl.innerHTML = `
    <div class="services">
        <div class="detail-row"><span class="label">Giá vé cơ bản:</span> <span class="price">${basePrice.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phí hành lý:</span> <span class="price">${baggagePrice.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phí bữa ăn:</span> <span class="price">${mealPrice.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phụ thu dịch vụ hệ thống:</span> <span class="price">${system_service.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phụ thu quản trị hệ thống:</span> <span class="price">${service_management.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phí sân bay quốc nội:</span> <span class="price">${airport_fee.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Phí an ninh soi chiếu:</span> <span class="price">${security_screening.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Thuế giá trị gia tăng:</span> <span class="price">${value_added_tax.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="detail-row"><span class="label">Tổng:</span> <span class="price">${totalAmount.toLocaleString('vi-VN')} VNĐ</span></div>
    </div>
        `;

    // -----------------------------------------------------------------
    // C. CẬP NHẬT NÚT THANH TOÁN
    // -----------------------------------------------------------------
    payButton.textContent = `Xác nhận giao dịch`;


    // Xử lý sự kiện nút thanh toán
    payButton.addEventListener('click', () => {
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (selectedPaymentMethod) {
            alert(`Đang tiến hành thanh toán ${totalAmount.toLocaleString('vi-VN')} VNĐ bằng phương thức: ${selectedPaymentMethod.value.toUpperCase()}. (Demo)`);
        } else {
            alert("Vui lòng chọn phương thức thanh toán!");
        }
    });
}

// KHỞI TẠO: Đảm bảo hàm này chạy khi trang được tải
document.addEventListener("DOMContentLoaded", handlePaymentPage);