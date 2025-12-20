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
    const passenger = booking.passenger;
    const services = booking.services;
    let flightHTML = "";

    if (booking.type === "oneway" && booking.flight){
        const flight = booking.flight;
        const [date, time] = flight.time_from.split(" ");

        flightHTML = `
            <h3>Chi tiết chuyến bay</h3>
            <p><strong>Mã chuyến bay:</strong> ${flight.code}</p>
            <p><strong>Hành trình:</strong> ${flight.airport_from} → ${flight.airport_to}</p>
            <p><strong>Khởi hành:</strong> ${date}</p>
            <p><strong>Giờ khởi hành:</strong> ${time}</p>
            <p><strong>Ghế:</strong> ${booking.seat}</p>
            <p><strong>Hành lý:</strong> ${booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> ${booking.services?.meal?.type || "Không"}</p>
        `;
    }

    if (booking.type === "roundtrip" && booking.outbound && booking.inbound){
        const {outbound, inbound} = booking;
        const [outDate, outTime] = outbound.time_from.split(" ");
        const [inDate, inTime] = inbound.time_from.split(" ");

        flightHTML = `
            <h3>Chặng đi</h3>
            <p><strong>Mã chuyến bay:</strong> ${outbound.code}</p>
            <p><strong>Hành trình:</strong> ${outbound.airport_from} → ${outbound.airport_to}</p>
            <p><strong>Khởi hành:</strong> ${outDate}</p>
            <p><strong>Giờ khởi hành:</strong> ${outTime}</p>
            <p><strong>Ghế:</strong> ${booking.seatOutbound}</p>
            <p><strong>Hành lý:</strong> ${booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> ${booking.services?.meal?.type || "Không"}</p>

            <h3>Chặng về</h3>
            <p><strong>Mã chuyến bay:</strong> ${inbound.code}</p>
            <p><strong>Hành trình:</strong> ${inbound.airport_from} → ${inbound.airport_to}</p>
            <p><strong>Khởi hành:</strong> ${inDate}</p>
            <p><strong>Giờ khởi hành:</strong> ${inTime}</p>
            <p><strong>Ghế:</strong> ${booking.seatInbound}</p>
            <p><strong>Hành lý:</strong> ${booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> ${booking.services?.meal?.type || "Không"}</p>
            `;
    }

    detail.innerHTML = `
        <div class="flight-detail">
            <h3>Thông tin đặt chỗ</h3>
            <p><strong>Hành khách:</strong> ${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</p>
            <p><strong>Mã đặt chỗ:</strong> ${bookingCode}</p>
            <p><strong>Loại vé:</strong> ${booking.type === "oneway" ? "Một chiều" : "Khứ hồi"}</p>
            <p><strong>Trạng thái check-in:</strong> ${booking.checkedIn ? "Đã check-in" : "Chưa check-in"}</p>
            ${flightHTML}
        </div>
    `;
});
