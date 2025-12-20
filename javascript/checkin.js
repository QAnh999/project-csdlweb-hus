document.addEventListener("DOMContentLoaded", () => {
    const detail = document.getElementById("checkin-detail");
    const options = document.getElementById("checkin-options");
    const btnConfirm = document.getElementById("btn-confirm-checkin");

    if (!detail || !options || !btnConfirm) return;

    const bookingCode = localStorage.getItem("current_checkin_code");
    if (!bookingCode) {
        detail.innerHTML = "<p>Không tìm thấy thông tin check-in</p>";
        return;
    }

    const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
    if (!bookingStr) {
        detail.innerHTML = "<p>Thông tin đặt chỗ không tồn tại</p>";
        return;
    }

    const booking = JSON.parse(bookingStr);
    const passenger = booking.passenger;
    let selectedLeg = null;
    let selectedFlight = null;
    let selectedSeat = null;

    // ==== Vé một chiều ====
    if (booking.type === "oneway") {
        selectedFlight = booking.flight;
        selectedSeat = booking.seat;
        options.style.display = "none";
        btnConfirm.style.display = "block";

        const [date, time] = selectedFlight.time_from.split(" ");
        detail.innerHTML = `
            <div class="cf-flights">
                <h2>Xác nhận chuyến bay</h2>
                <p><strong>Hành khách: </strong> <span>${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></p>
                <p><strong>Chuyến bay: </strong> <span>${selectedFlight.airport_from} → ${selectedFlight.airport_to}</span></p>
                <p><strong>Giờ khởi hành: </strong> <span>${date} | ${time}</span></p>
                <p><strong>Ghế: </strong> <span>${selectedSeat}</span></p>
            </div>
        `;
    }

    // ==== Vé khứ hồi ====
   if (booking.type === "roundtrip") {
    if (booking.checkedInOutbound === undefined) booking.checkedInOutbound = false;
    if (booking.checkedInInbound === undefined) booking.checkedInInbound = false;

    options.style.display = "block";
    btnConfirm.style.display = "none";

    function renderRoundTripButtons() {
      options.innerHTML = `
        ${!booking.checkedInOutbound ? `<button class="checkin-btn" data-leg="outbound">Chọn chặng đi</button>` : ""}
        ${!booking.checkedInInbound ? `<button class="checkin-btn" data-leg="inbound">Chọn chặng về</button>` : ""}
      `;

      options.querySelectorAll(".checkin-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedLeg = btn.dataset.leg;
          if (selectedLeg === "outbound") {
            selectedFlight = booking.outbound;
            selectedSeat = booking.seatOutbound;
          } else {
            selectedFlight = booking.inbound;
            selectedSeat = booking.seatInbound;
          }

          const [date, time] = selectedFlight.time_from.split(" ");
          detail.innerHTML = `
            <div class="cf-flights">
              <h2>Xác nhận chuyến bay</h2>
              <p><strong>Hành khách: </strong> <span>${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></p>
              <p><strong>Chuyến bay: </strong> <span>${selectedFlight.airport_from} → ${selectedFlight.airport_to}</span></p>
              <p><strong>Giờ khởi hành: </strong> <span>${date} | ${time}</span></p>
              <p><strong>Ghế: </strong><span>${selectedSeat}</span></p>
            </div>
          `;

          // Ẩn nút vừa click, các nút khác vẫn hiển thị
        //   btn.style.display = "none";
          options.style.display = "none";
          btnConfirm.style.display = "block";
        });
      });
    }

    renderRoundTripButtons();
  }

  // ==== Xử lý nút xác nhận check-in ====
  btnConfirm.addEventListener("click", () => {
    if (!selectedFlight) return;

    if (booking.type === "oneway") {
      booking.checkedIn = true;
    } else if (booking.type === "roundtrip") {
      if (selectedLeg === "outbound") booking.checkedInOutbound = true;
      else booking.checkedInInbound = true;
    }

    localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(booking));
    btnConfirm.style.display = "none";

    const [date, time] = selectedFlight.time_from.split(" ");
    detail.innerHTML = `
      <div class="boarding-pass">
        <p><strong>Hành khách: </strong> <span>${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></p>
        <p><strong>Chuyến bay: </strong> <span>${selectedFlight.airport_from} → ${selectedFlight.airport_to}</span></p>
        <p><strong>Mã đặt chỗ: </strong> <span>${bookingCode}</span></p>
        <p><strong>Giờ khởi hành: </strong> <span>${date} | ${time}</span></p>
        <p><strong>Ghế: </strong><span>${selectedSeat}</span></p>
        <hr>
        <p>Cửa ra máy bay sẽ đóng 15 phút trước giờ khởi hành</p>
      </div>
    `;

    // Nếu còn chặng chưa check-in, hiển thị lại nút
    if (booking.type === "roundtrip" && (!booking.checkedInOutbound || !booking.checkedInInbound)) {
      renderRoundTripButtons();
    }
  });
});
