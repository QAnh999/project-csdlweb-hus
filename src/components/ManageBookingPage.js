import React, { useEffect, useState } from "react";
import "../style/managebooking.css";

const ManageBookingPage = () => {
  const [booking, setBooking] = useState(null);
  const [bookingCode, setBookingCode] = useState(null);

  useEffect(() => {
    const code = localStorage.getItem("current_booking_code");
    setBookingCode(code);

    if (!code) return;

    const bookingStr = localStorage.getItem(`booking_${code}`);
    if (!bookingStr) return;

    const parsedBooking = JSON.parse(bookingStr);
    setBooking(parsedBooking);
  }, []);

  if (!bookingCode) {
    return <p>Không tìm thấy thông tin chuyến bay.</p>;
  }

  if (!booking) {
    return <p>Thông tin chuyến bay không tồn tại.</p>;
  }

  const parseTime = (time) => {
    if (!time || typeof time !== "string") {
      return { date: "", hour: "" };
    }
    const [date = "", hour = ""] = time.split(" ");
    return { date, hour };
  };


  const renderFlightDetails = () => {
    if (!booking) return null;

    // ===== ONE WAY =====
    if (booking.type === "oneway" && booking.flight) {
      const { date, hour } = parseTime(
        booking.flight.time_from || booking.flight.f_time_from
      );

      return (
        <div className="flight-detail">
          <h3>Chi tiết chuyến bay</h3>

          <p><strong>Mã chuyến bay:</strong> {booking.flight.f_code}</p>
          <p><strong>Hành trình:</strong> {booking.flight.airport_from} → {booking.flight.airport_to}</p>
          <p><strong>Ngày khởi hành:</strong> {date}</p>
          <p><strong>Giờ khởi hành:</strong> {hour}</p>
          <p><strong>Ghế:</strong> {booking.seat || "Chưa chọn"}</p>
          <p><strong>Hành lý:</strong> {booking.services?.baggage?.type || "Không"}</p>
          <p><strong>Bữa ăn:</strong> {booking.services?.meal?.type || "Không"}</p>
        </div>
      );
    }

    // ===== ROUND TRIP =====
    if (booking.type === "roundtrip" && booking.outbound && booking.inbound) {
      const out = parseTime(booking.outbound.time_from || booking.outbound.f_time_from);
      const inbound = parseTime(booking.inbound.time_from || booking.inbound.f_time_from);

      return (
        <>
          <div className="flight-detail">
            <h3>Chặng đi</h3>
            <p><strong>Mã chuyến bay:</strong> {booking.outbound.f_code}</p>
            <p><strong>Hành trình:</strong> {booking.outbound.airport_from} → {booking.outbound.airport_to}</p>
            <p><strong>Ngày:</strong> {out.date}</p>
            <p><strong>Giờ:</strong> {out.hour}</p>
            <p><strong>Ghế:</strong> {booking.seatOutbound || "Chưa chọn"}</p>
            <p><strong>Hành lý:</strong> {booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> {booking.services?.meal?.type || "Không"}</p>
          
          </div>

          <div className="flight-detail">
            <h3>Chặng về</h3>
            <p><strong>Mã chuyến bay:</strong> {booking.inbound.f_code}</p>
            <p><strong>Hành trình:</strong> {booking.inbound.airport_from} → {booking.inbound.airport_to}</p>
            <p><strong>Ngày:</strong> {inbound.date}</p>
            <p><strong>Giờ:</strong> {inbound.hour}</p>
            <p><strong>Ghế:</strong> {booking.seatInbound || "Chưa chọn"}</p>
            <p><strong>Hành lý:</strong> {booking.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> {booking.services?.meal?.type || "Không"}</p>
          </div>
        </>
      );
    }

    return null;
  };



  return (
    <div className="managebooking-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>
      
      <section className="managebooking-container">
        <h2>Chuyến bay của bạn</h2>

        <div className="booking-info">

          {/* Thông tin đặt chỗ */}
          <div className="flight-detail">
            <h3>Thông tin đặt chỗ</h3>
            <p><strong>Hành khách:</strong> {booking.passenger.Ho} {booking.passenger.Ten_dem_va_ten}</p>
            <p><strong>Mã đặt chỗ:</strong> {bookingCode}</p>
            <p><strong>Loại vé:</strong> {booking.type === "oneway" ? "Một chiều" : "Khứ hồi"}</p>
            <p><strong>Trạng thái:</strong> {booking.checkedIn ? "Đã check-in" : "Chưa check-in"}</p>
          </div>

          {/* Chi tiết chuyến bay */}
          {renderFlightDetails()}

        </div>
      </section>
    </div>
  );

};

export default ManageBookingPage;
