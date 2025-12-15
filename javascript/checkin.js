// document.getElementById("btn-checkin").addEventListener("click", () => {
//     const bookingCode = document.getElementById("checkin-code").value.trim().toUpperCase();
//     const lastNameInput = document.getElementById("checkin-lastname").value.trim().toUpperCase();
    
//     const result = document.getElementById("checkin-result");
//     const detail = document.getElementById("checkin-detail");

//     result.innerHTML ="";
//     detail.style.display = "none";

//     if (!bookingCode || !lastNameInput){
//         result.innerHTML = "<p>Vui lòng nhập đầy đủ thông tin</p>";
//         return;
//     }

//     const bookingStr = localStorage.getItem(`booking_${bookingCode}`);

//     if (!bookingStr){
//         result.innerHTML = "<p>Mã đặt chỗ không tồn tại</p>";
//         return;
//     }

//     const booking = JSON.parse(bookingStr);

//     if (!booking.passenger || !booking.passenger.Ho){
//         result.innerHTML = "<p>Dữ liệu hành khách không hợp lệ</p>";
//         return;
//     }

//     const storedLastName = booking.passenger.Ho.trim().toUpperCase();
//     const inputLastName = lastNameInput.trim().toUpperCase();

//     if (storedLastName !== inputLastName){
//         result.innerHTML = "<p>Họ không khớp với mã đặt chỗ</p>";
//         return;
//     } 

//     if (booking.checkedIn){
//         result.innerHTML = "<p>Bạn đã check-in trước đó</p>";
//         return;
//     }

//     detail.style.display = "block";
//     detail.innerHTML = `
//         <div class="boarding-pass">
//             <h3>Check-in thành công</h3>
//             <p><strong>Hành khách:</strong> ${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</p>
//             <p><strong>Chuyến bay:</strong> ${booking.flight.code}</p>
//             <p><strong>Từ:</strong> ${booking.flight.from}</p>
//             <p><strong>Đến:</strong> ${booking.flight.to}</p>
//             <p><strong>Ngày bay:</strong> ${booking.flight.date}</p>
//             <p><strong>Giờ khởi hành:</strong> ${booking.flight.time}</p>
//             <p><strong>Ghế:</strong> ${booking.seat}</p>

//             <button class="btn" id="btn-confirm-checkin">Xác nhận làm thủ tục lên máy bay</button>
//         </div>
//     `;

//     document.getElementById("btn-confirm-checkin").addEventListener("click", () => {
//         booking.checkedIn = true;
//         booking.checkinTime = new Date().toLocaleString("vi-VN");

//         localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(booking));

//         detail.innerHTML = `
//             <div class="boarding-pass">
//             <h3>Thẻ lên máy bay</h3>
//             <p><strong>Hành khách:</strong> ${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</p>
//             <p><strong>Chuyến bay:</strong> ${booking.flight.code}</p>
//             <p><strong>Từ:</strong> ${booking.flight.from}</p>
//             <p><strong>Đến:</strong> ${booking.flight.to}</p>
//             <p><strong>Ngày bay:</strong> ${booking.flight.date}</p>
//             <p><strong>Giờ khởi hành:</strong> ${booking.flight.time}</p>
//             <p><strong>Ghế:</strong> ${booking.seat}</p>
//             <hr>
//             <p>Cửa ra máy bay sẽ đóng 15 phút trước giờ khởi hành</p>
//         </div>
//         `
//     })

  
// });



document.addEventListener("DOMContentLoaded", () => {

    // ---- PHẦN CHO index.html ----
    const btnCheckin = document.getElementById("btn-checkin");
    if (btnCheckin) {
        btnCheckin.addEventListener("click", () => {
            const bookingCode = document.getElementById("checkin-code").value.trim().toUpperCase();
            const lastName = document.getElementById("checkin-lastname").value.trim().toUpperCase();
            const result = document.getElementById("checkin-result");

            result.innerHTML = "";

            if (!bookingCode || !lastName) {
                result.innerHTML = "<p>Vui lòng nhập đầy đủ thông tin!</p>";
                return;
            }

            const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
            if (!bookingStr) {
                result.innerHTML = "<p>Mã đặt chỗ không tồn tại</p>";
                return;
            }

            const booking = JSON.parse(bookingStr);

            if (!booking.passenger || booking.passenger.Ho.trim().toUpperCase() !== lastName) {
                result.innerHTML = "<p>Họ không khớp với mã đặt chỗ</p>";
                return;
            }

            if (booking.checkedIn) {
                result.innerHTML = "<p>Bạn đã check-in trước đó</p>";
                return;
            }

            localStorage.setItem("current_checkin_code", bookingCode);

            window.location.href = "pages/checkin.html";
        });
    }

    // ---- PHẦN CHO checkin.html ----
    const btnConfirm = document.getElementById("btn-confirm-checkin");
    const detail = document.getElementById("checkin-detail"); // sửa thành đúng ID HTML

    if (btnConfirm && detail) {
        const bookingCode = localStorage.getItem("current_checkin_code");

        if (!bookingCode) {
            detail.innerHTML = "<p>Không tìm thấy thông tin check-in</p>";
            btnConfirm.style.display = "none";
            return;
        }

        const booking = JSON.parse(localStorage.getItem(`booking_${bookingCode}`));

        // Hiển thị thông tin chuyến bay
        detail.innerHTML = `
            <div class="boarding-pass-info">
                <h2>Thông tin chuyến bay</h2>
                <p><strong>Hành khách:</strong> ${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</p>
                <p><strong>Mã đặt chỗ:</strong> ${bookingCode}</p>
                <p><strong>Chuyến bay:</strong> ${booking.flight.code}</p>
                <p><strong>Từ:</strong> ${booking.flight.from}</p>
                <p><strong>Đến:</strong> ${booking.flight.to}</p>
                <p><strong>Ngày bay:</strong> ${booking.flight.time_from.split(" ")[0]}</p>
                <p><strong>Giờ bay:</strong> ${booking.flight.time_from.split(" ")[1]}</p>
                <p><strong>Ghế:</strong> ${booking.seat}</p>
            </div>
        `;

        // Xác nhận làm thủ tục → hiển thị boarding pass
        btnConfirm.addEventListener("click", () => {
            booking.checkedIn = true;
            booking.checkinTime = new Date().toLocaleString("vi-VN");

            localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(booking));

            detail.innerHTML = `
                <div class="boarding-pass">
                    <h2>Thẻ lên máy bay</h2>
                    <p><strong>${booking.passenger.Ho} ${booking.passenger.Ten_dem_va_ten}</strong></p>
                    <p>Chuyến bay: ${booking.flight.code}</p>
                    <p>${booking.flight.from} → ${booking.flight.to}</p>
                    <p>${booking.flight.time_from.split(" ")[0]} | ${booking.flight.time_from.split(" ")[1]}</p>
                    <p>Ghế: ${booking.seat}</p>
                    <hr>
                    <p>Cửa ra máy bay đóng trước 15 phút</p>
                </div>
            `;

            btnConfirm.style.display = "none";
        });
    }

});
