function handlePaymentPage() {
    const bookingDataStr = localStorage.getItem('bookingDraft');
    const bookingData = bookingDataStr ? JSON.parse(bookingDataStr) : null;

    if (!bookingData || !bookingData.passenger) {
        document.querySelector('.payment').innerHTML = "<p>Lỗi: Không tìm thấy thông tin đặt chỗ. Vui lòng quay lại trang đặt vé.</p>";
        return;
    }
    
    const isOneWay = !!bookingData.flight;
    const isRoundTrip = !!(bookingData.outbound && bookingData.inbound);

    if (!isOneWay && !isRoundTrip){
        document.querySelector(".payment").innerHTML = "<p>Lỗi: Dữ liệu chuyến bay không hợp lệ.</p>";
        return;
    }

    // const { flight, passenger, services, seat } = bookingData;
    const passenger = bookingData.passenger;
    const services = bookingData.services;

    const flightDetailsEl = document.getElementById('flight-details'); 
    const costSummaryEl = document.getElementById('cost-summary');    
    const payButton = document.getElementById('pay-button');
    
    const system_service = 215000;
    const service_management = 410000;
    const airport_fee = 99000;
    const security_screening = 20000;
    const value_added_tax = 40000;

    // const subTotal = basePrice + baggagePrice + mealPrice;
    // const totalAmount = subTotal + system_service + service_management + airport_fee + security_screening + value_added_tax;

    let totalAmount = 0;
    let flightHTML = "";

    if (isOneWay){
        const {flight, seat} = bookingData;
        const basePrice = Number(flight.price);
        const baggagePrice = services?.baggage?.price || 0;
        const mealPrice = services?.meal?.price || 0;

        totalAmount = basePrice + baggagePrice + mealPrice + system_service + service_management + airport_fee + security_screening + value_added_tax;
    
        flightDetailsEl.innerHTML = `
        <div class="flight">
            <h3>Thông tin hành khách</h3>
            <div class="detail-row"><span class="label">Họ tên:</span> <span class="info"> (${passenger.Danh_xung}) ${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></div>
            <div class="detail-row"><span class="label">Email:</span> <span class="info">${passenger.Email}</span></div>
            <div class="detail-row"><span class="label">Điện thoại:</span> <span class="info">${passenger.Ma_quoc_gia} ${passenger.So_dien_thoai.replace(/^0/, '')}</span></div>
            
            <h3>Chi tiết chuyến bay</h3>
            <div class="detail-row"><span class="label">Mã chuyến bay:</span> <span class="info">${flight.code} (${flight.type})</span></div>
            <div class="detail-row"><span class="label">Chặng bay:</span> <span class="info">${flight.airport_from} ✈ ${flight.airport_to}</span></div>
            <div class="detail-row"><span class="label">Khởi hành:</span> <span class="info">${flight.time_from}</span></div>
            <div class="detail-row"><span class="label">Ghế đã chọn:</span> <span class="info">${seat}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Hành lý):</span> <span class="info">${services.baggage.type}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Bữa ăn):</span> <span class="info">${services.meal.type}</span></div>
        </div>
        `;

        
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
    }
    

    if (isRoundTrip){
        const {outbound, inbound, seatOutbound, seatInbound} = bookingData;
        
        const basePrice = Number(outbound.price) + Number(inbound.price);
        const baggagePrice = services?.baggage?.price || 0;
        const mealPrice = services?.meal?.price || 0;

        // mac dinh hanh ly va bua an cho ca chang di va chang ve
        totalAmount = 
            basePrice + 2 * (baggagePrice + mealPrice) +
            2 * (system_service + service_management + airport_fee + security_screening + value_added_tax); 
    
        flightDetailsEl.innerHTML = `
        <div class="flight">
        <h3>Thông tin hành khách</h3>
            <div class="detail-row"><span class="label">Họ tên:</span> <span class="info"> (${passenger.Danh_xung}) ${passenger.Ho} ${passenger.Ten_dem_va_ten}</span></div>
            <div class="detail-row"><span class="label">Email:</span> <span class="info">${passenger.Email}</span></div>
            <div class="detail-row"><span class="label">Điện thoại:</span> <span class="info">${passenger.Ma_quoc_gia} ${passenger.So_dien_thoai.replace(/^0/, '')}</span></div>
            
            <h3>Chi tiết chặng đi</h3>
            <div class="detail-row"><span class="label">Mã chuyến bay:</span> <span class="info">${outbound.code} (${outbound.type})</span></div>
            <div class="detail-row"><span class="label">Chặng bay:</span> <span class="info">${outbound.airport_from} ✈ ${outbound.airport_to}</span></div>
            <div class="detail-row"><span class="label">Khởi hành:</span> <span class="info">${outbound.time_from}</span></div>
            <div class="detail-row"><span class="label">Ghế đã chọn:</span> <span class="info">${seatOutbound}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Hành lý):</span> <span class="info">${services.baggage.type}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Bữa ăn):</span> <span class="info">${services.meal.type}</span></div>
            
            <h3>Chi tiết chặng về</h3>
            <div class="detail-row"><span class="label">Mã chuyến bay:</span> <span class="info">${inbound.code} (${inbound.type})</span></div>
            <div class="detail-row"><span class="label">Chặng bay:</span> <span class="info">${inbound.airport_from} ✈ ${inbound.airport_to}</span></div>
            <div class="detail-row"><span class="label">Khởi hành:</span> <span class="info">${inbound.time_from}</span></div>
            <div class="detail-row"><span class="label">Ghế đã chọn:</span> <span class="info">${seatInbound}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Hành lý):</span> <span class="info">${services.baggage.type}</span></div>
            <div class="detail-row"><span class="label">Dịch vụ (Bữa ăn):</span> <span class="info">${services.meal.type}</span></div>
            
        </div>
        `;

        
        costSummaryEl.innerHTML = `
        <div class="services">
            <div class="detail-row"><span class="label">Giá vé cơ bản:</span> <span class="price">${basePrice.toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phí hành lý:</span> <span class="price">${(baggagePrice * 2).toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phí bữa ăn:</span> <span class="price">${(mealPrice * 2).toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phụ thu dịch vụ hệ thống:</span> <span class="price">${system_service.toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phụ thu quản trị hệ thống:</span> <span class="price">${service_management.toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phí sân bay quốc nội:</span> <span class="price">${(2 * airport_fee).toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Phí an ninh soi chiếu:</span> <span class="price">${(2 * security_screening).toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Thuế giá trị gia tăng:</span> <span class="price">${(2 * value_added_tax).toLocaleString('vi-VN')} VNĐ</span></div>
            <div class="detail-row"><span class="label">Tổng:</span> <span class="price">${totalAmount.toLocaleString('vi-VN')} VNĐ</span></div>
        </div>
            `;
    }

    payButton.textContent = `Xác nhận giao dịch`;


    
    payButton.addEventListener('click', async () => {
        let payload = {
            passenger, services, totalAmount, type: isOneWay ? "oneway" : "roundtrip"
        };

        if (isOneWay){
            payload.flight = bookingData.flight;
            payload.seat = bookingData.seat;
        } else {
            payload.outbound = bookingData.outbound;
            payload.inbound = bookingData.inbound;
            payload.seatOutbound = bookingData.seatOutbound;
            payload.seatInbound = bookingData.seatInbound;
        }

        try {
            const result = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAYMENT123",
                    bookingCode: "123ABC"
                    });
                }, 1000);
            });


            document.getElementById("qr-image").src = result.qrCode;
            document.getElementById("qr-modal").style.display = "flex";

            localStorage.setItem("paymentPending", "true");

            // alert("Mã đặt chỗ của bạn: " + result.bookingCode + "\nKiểm tra email để xem thông tin chi tiết.");
        } catch (error){
            console.error("Lỗi khi gửi yêu cầu thanh toán:", error);
            alert("Không thể xử lý thanh toán. Vui lòng thử lại.");
        }
    });

    function generateBookingCode(){
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        
        for (let i = 0; i < 3; i++){
            code += Math.floor(Math.random() * 10);
        }
        
        for (let i = 0; i < 3; i++){
            code += letters.charAt(Math.floor(Math.random() * letters.length));       
        }

        return code;
    }

    document.getElementById("close-qr").addEventListener("click", async() => {
        document.getElementById("qr-modal").style.display = "none";

        const isPending = localStorage.getItem("paymentPending");
        if (!isPending) return;
        
        const paymentResult = await new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    status: "success",
                    bookingCode: generateBookingCode()
                });
            }, 1000);
        });

        if (paymentResult.status == "success"){
            // const passengerInfo = JSON.parse(localStorage.getItem("passengerInfo"));

            let bookingInfo = {
                bookingCode: paymentResult.bookingCode,
                passenger,
                services,
                totalAmount,
                checkedIn: false,
                type: isOneWay ? "oneway" : "roundtrip"
            };

            if (isOneWay){
                bookingInfo.flight = bookingData.flight;
                bookingInfo.seat = bookingData.seat;
            } else {
                bookingInfo.outbound = bookingData.outbound;
                bookingInfo.inbound = bookingData.inbound;
                bookingInfo.seatOutbound = bookingData.seatOutbound;
                bookingInfo.seatInbound = bookingData.seatInbound;
            }
            
            localStorage.setItem(`booking_${paymentResult.bookingCode}`, JSON.stringify(bookingInfo));
            localStorage.removeItem("paymentPending");
            localStorage.removeItem("bookingDraft");
            alert("Thanh toán thành công!\nMã đặt chỗ của bạn: " + paymentResult.bookingCode);
            
            window.location.href = "../index.html";
        }
    });


}


document.addEventListener("DOMContentLoaded", handlePaymentPage);