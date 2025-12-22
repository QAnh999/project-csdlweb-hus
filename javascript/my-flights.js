document.addEventListener("DOMContentLoaded", () => {
    // if (!requireLogin()) return;

    const auth = JSON.parse(localStorage.getItem("auth"));
    if (!auth?.email) return;

    const userEmail = auth.email.toLowerCase();
    const container = document.getElementById("my-flights-list");
    if (!container) return;

    const pagination = document.createElement("div");
    pagination.className = "pagination";
    container.after(pagination);

    const myBookings = [];

    Object.keys(localStorage).forEach(key => {
        if (!key.startsWith("booking_")) return;

        const booking = JSON.parse(localStorage.getItem(key));
        if (!booking?.passenger?.Email) return;

        if (booking.passenger.Email.toLowerCase() === userEmail) {
            myBookings.push(booking);
        }
    });

    myBookings.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (myBookings.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; margin-top:20px;">
                Bạn chưa đặt chuyến bay nào.
            </p>
        `;
        return;
    }

    // ===== PHÂN TRANG =====
    const ITEMS_PER_PAGE = 2;
    let currentPage = 1;

    function renderPage(page) {
        container.innerHTML = "";
        pagination.innerHTML = "";

        const totalPages = Math.ceil(myBookings.length / ITEMS_PER_PAGE);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = myBookings.slice(start, end);

        pageItems.forEach(b => {
            const div = document.createElement("div");
            div.className = "my-flight-card";

            if (b.type === "roundtrip" && b.outbound && b.inbound) {
                div.innerHTML = `
                    <p><strong>Mã đặt chỗ:</strong> <span>${b.bookingCode}</span></p>
                    <p><strong>Chuyến đi:</strong> <span>${b.outbound.airport_from} → ${b.outbound.airport_to}</span></p>
                    <p><strong>Ghế đi:</strong> <span>${b.seatOutbound || "Chưa chọn"}</span></p>
                    <p><strong>Chuyến về:</strong> <span>${b.inbound.airport_from} → ${b.inbound.airport_to}</span></p>
                    <p><strong>Ghế về:</strong> <span>${b.seatInbound || "Chưa chọn"}<span></p>
                    <p><strong>Tổng tiền:</strong> <span>${b.totalAmount?.toLocaleString() || 0} VND</span></p>
                    <p><strong>Thời gian đặt:</strong> <span>${new Date(b.createdAt).toLocaleString("vi-VN")}</span></p>
                    `;
            } else if (b.flight) {
                div.innerHTML = `
                    <p><strong>Mã đặt chỗ:</strong> <span>${b.bookingCode}</span></p>
                    <p><strong>Chuyến bay:</strong> <span>${b.flight.airport_from} → ${b.flight.airport_to}</span></p>
                    <p><strong>Ghế:</strong> <span>${b.seat || "Chưa chọn"}</span></p>
                    <p><strong>Tổng tiền:</strong> <span>${b.totalAmount?.toLocaleString() || 0} VND</span></p>
                    <p><strong>Thời gian đặt:</strong> <span>${new Date(b.createdAt).toLocaleString("vi-VN")}</span></p>
                    
                    `;
            }

            container.appendChild(div);
        });

        // tạo nút phân trang
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;
                btn.classList.toggle("active", i === page);
                btn.onclick = () => {
                    currentPage = i;
                    renderPage(i);
                };
                pagination.appendChild(btn);
            }
        }
    }

    // render trang đầu tiên
    renderPage(1);
});
