// src/components/ManageBookingPage.js
import React, { useEffect, useState } from "react";
import "../style/managebooking.css";

const ManageBookingPage = () => {
  const [booking, setBooking] = useState(null);
  const [bookingCode, setBookingCode] = useState(null);

  useEffect(() => {
    const code = localStorage.getItem("current_booking_code");
    if (!code) return;

    setBookingCode(code);

    // ✅ lấy trực tiếp theo passengerCode
    const bookingStr = localStorage.getItem(code);
    if (!bookingStr) return;

    const parsedBooking = JSON.parse(bookingStr);

    // init checkin
    if (parsedBooking.type === "roundtrip") {
      parsedBooking.checkedInOutbound ??= false;
      parsedBooking.checkedInInbound ??= false;
    } else {
      parsedBooking.checkedIn ??= false;
    }

    setBooking(parsedBooking);
  }, []);


  if (!bookingCode) {
    return <p>Không tìm thấy thông tin đặt chỗ.</p>;
  }

  if (!booking) {
    return <p>Thông tin chuyến bay không tồn tại.</p>;
  }

  const parseTime = (time) => {
    if (!time || typeof time !== "string") return { date: "", hour: "" };
    const [date = "", hour = ""] = time.split(" ");
    return { date, hour };
  };

  const renderFlightDetails = () => {
    if (!booking) return null;

    // ===== ONE WAY =====
    if (booking.type === "oneway" && booking.flight) {
      const { date, hour } = parseTime(booking.flight.f_time_from);
      return (
        <div className="flight-detail">
          <h3>Chi tiết chuyến bay</h3>
          <p><strong>Mã chuyến bay:</strong> {booking.flight.f_code}</p>
          <p><strong>Hành trình:</strong> {booking.flight.airport_from} → {booking.flight.airport_to}</p>
          <p><strong>Ngày khởi hành:</strong> {date}</p>
          <p><strong>Giờ khởi hành:</strong> {hour}</p>
          <p><strong>Ghế:</strong> {booking.passenger.seatOneway || "Chưa chọn"}</p>
          <p><strong>Hành lý:</strong> {booking.passenger.services?.baggage?.type || "Không"}</p>
          <p><strong>Bữa ăn:</strong> {booking.passenger.services?.meal?.type || "Không"}</p>
          <p><strong>Trạng thái check-in:</strong> {booking.checkedIn ? "Đã check-in" : "Chưa check-in"}</p>
        </div>
      );
    }

    if (booking.type === "roundtrip") {
      const outboundTime = parseTime(booking.outbound.f_time_from);
      const inboundTime = parseTime(booking.inbound.f_time_from);

      return (
        <>
          <div className="flight-detail">
            <h3>Chặng đi</h3>
            <p><strong>Mã chuyến bay:</strong> {booking.outbound.f_code}</p>
            <p><strong>Hành trình:</strong> {booking.outbound.airport_from} → {booking.outbound.airport_to}</p>
            <p><strong>Ngày:</strong> {outboundTime.date}</p>
            <p><strong>Giờ:</strong> {outboundTime.hour}</p>
            <p><strong>Ghế:</strong> {booking.passenger.seatOutbound || "Chưa chọn"}</p>
            <p><strong>Hành lý:</strong> {booking.passenger.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> {booking.passenger.services?.meal?.type || "Không"}</p>
            <p><strong>Trạng thái check-in:</strong> {booking.checkedInOutbound ? "Đã check-in" : "Chưa check-in"}</p>
          </div>

          <div className="flight-detail">
            <h3>Chặng về</h3>
            <p><strong>Mã chuyến bay:</strong> {booking.inbound.f_code}</p>
            <p><strong>Hành trình:</strong> {booking.inbound.airport_from} → {booking.inbound.airport_to}</p>
            <p><strong>Ngày:</strong> {inboundTime.date}</p>
            <p><strong>Giờ:</strong> {inboundTime.hour}</p>
            <p><strong>Ghế:</strong> {booking.passenger.seatInbound || "Chưa chọn"}</p>
            <p><strong>Hành lý:</strong> {booking.passenger.services?.baggage?.type || "Không"}</p>
            <p><strong>Bữa ăn:</strong> {booking.passenger.services?.meal?.type || "Không"}</p>
            <p><strong>Trạng thái check-in:</strong> {booking.checkedInInbound ? "Đã check-in" : "Chưa check-in"}</p>
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
          <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel" />
          <span>Lotus Travel</span>
        </a>
      </header>

      <section className="managebooking-container">
        <h2>Chuyến bay của bạn</h2>

        <div className="booking-info">
          {/* Thông tin đặt chỗ */}
          <div className="flight-detail">
            <h3>Thông tin đặt chỗ</h3>
            <p><strong>Hành khách:</strong> {(booking.passenger.info.Ho + " " + booking.passenger.info.Ten_dem_va_ten).toUpperCase()}</p>
            <p><strong>Mã đặt chỗ:</strong> {bookingCode}</p>
            <p><strong>Loại vé:</strong> {booking.type === "oneway" ? "Một chiều" : "Khứ hồi"}</p>
          </div>

          {/* Chi tiết chuyến bay */}
          {renderFlightDetails()}
        </div>
      </section>
    </div>
  );
};

export default ManageBookingPage;
