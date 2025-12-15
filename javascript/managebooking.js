document.addEventListener("DOMContentLoaded", () => {
    const detail = document.getElementById("managebooking-detail");
    const bookingCode = localStorage.getItem("current_booking_code");

    if (!bookingCode) {
        detail.innerHTML = "<p>Không tìm thấy thông tin chuyến bay.</p>";
        return;
    }

    const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
    if (!bookingStr) {
        detail.innerHTML = "<p>Thông tin chuyến bay không tồn tại.</p>";
        return;
    }

    const booking = JSON.parse(bookingStr);

    detail.innerHTML = `
        <div class="flight-detail">
            <p><strong>Hành khách:</strong> ${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</p>
            <p><strong>Mã đặt chỗ:</strong> ${bookingCode}</p>
            <p><strong>Chuyến bay:</strong> ${booking.flight.code}</p>
            <p><strong>Hành trình:</strong> ${booking.flight.from} → ${booking.flight.to}</p>
            <p><strong>Ngày bay:</strong> ${booking.flight.time_from.split(" ")[0]}</p>
            <p><strong>Giờ khởi hành:</strong> ${booking.flight.time_from.split(" ")[1]}</p>
            <p><strong>Hành lý:</strong> ${booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> ${booking.services?.meal?.type || "Không"}</p>
            <p><strong>Ghế:</strong> ${booking.seat}</p>
            <p><strong>Trạng thái check-in:</strong> ${booking.checkedIn ? "Đã check-in" : "Chưa check-in"}</p>
        </div>
    `;
});
