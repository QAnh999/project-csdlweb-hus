import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/payment.css";

const PaymentPage = () => {
  const navigate = useNavigate();

  const [bookingDraft, setBookingDraft] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // format tiền VNĐ
  const formatPrice = (price) => Number(price).toLocaleString("vi-VN");

  useEffect(() => {
    let draftStr = localStorage.getItem("bookingDraft");
    let booking = null;

    if (draftStr) {
      booking = JSON.parse(draftStr);
    } else {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith("booking_"))
        .sort();

      if (keys.length > 0) {
        booking = JSON.parse(localStorage.getItem(keys[keys.length - 1]));
      }
    }

    if (!booking) {
      alert("Không tìm thấy thông tin đặt chỗ.");
      navigate("/booking");
      return;
    }

    setBookingDraft(booking);
  }, [navigate]);

  useEffect(() => {
    if (!bookingDraft) return;

    const { services, type } = bookingDraft;
    const isOneWay = type === "oneway";
    const isRoundTrip = type === "roundtrip";
    const multiplier = isRoundTrip ? 2 : 1;

    const basePrice = isOneWay
      ? Number(bookingDraft.flight?.total_price || 0)
      : Number(bookingDraft.outbound?.total_price || 0) +
      Number(bookingDraft.inbound?.total_price || 0);

    const baggagePrice = services?.baggage
      ? services.baggage.price * multiplier
      : 0;

    const mealPrice = services?.meal
      ? services.meal.price * multiplier
      : 0;

    const systemFee = 215000 * multiplier;
    const serviceFee = 410000 * multiplier;
    const airportFee = 99000 * multiplier;
    const securityFee = 20000 * multiplier;
    const vatFee = 40000 * multiplier;

    const total =
      basePrice +
      baggagePrice +
      mealPrice +
      systemFee +
      serviceFee +
      airportFee +
      securityFee +
      vatFee;

    setTotalAmount(total);
  }, [bookingDraft]);



  const generateBookingCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 3; i++) code += Math.floor(Math.random() * 10);
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    return code;
  };

  const handlePayment = async () => {
    if (!bookingDraft) return;

    const qrResult = await new Promise(resolve => {
      setTimeout(() => {
        resolve({ qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAYMENT123" });
      }, 500);
    });

    setQrCodeUrl(qrResult.qrCode);
    setShowQR(true);
    localStorage.setItem("paymentPending", "true");
  };

  const handleCloseQR = async () => {
    setShowQR(false);
    const isPending = localStorage.getItem("paymentPending");
    if (!isPending) return;

    const paymentResult = await new Promise(resolve => {
      setTimeout(() => {
        resolve({ status: "success", bookingCode: generateBookingCode() });
      }, 500);
    });

    if (paymentResult.status === "success") {
      const { passenger, services, flight, seat, outbound, inbound, seatOutbound, seatInbound, type } = bookingDraft;
      const bookingInfo = {
        bookingCode: paymentResult.bookingCode,
        passenger,
        services,
        totalAmount,
        checkedIn: false,
        type,
        createdAt: Date.now(),
      };

      if (type === "oneway") {
        bookingInfo.flight = flight;
        bookingInfo.seat = seat;
      } else if (type === "roundtrip") {
        bookingInfo.outbound = outbound;
        bookingInfo.inbound = inbound;
        bookingInfo.seatOutbound = seatOutbound;
        bookingInfo.seatInbound = seatInbound;
      }

      localStorage.setItem(`booking_${paymentResult.bookingCode}`, JSON.stringify(bookingInfo));
      localStorage.removeItem("paymentPending");
      localStorage.removeItem("bookingDraft");

      alert("Thanh toán thành công!\nMã đặt chỗ của bạn: " + paymentResult.bookingCode);
      navigate("/");
    }
  };

  if (!bookingDraft || !bookingDraft.passenger) {
    return <p>Đang tải dữ liệu đặt chỗ...</p>;
  }

  const { passenger, services, type } = bookingDraft;
  const isOneWay = type === "oneway";
  const isRoundTrip = type === "roundtrip";
  const serviceMultiplier = isRoundTrip ? 2 : 1;


  const basePrice = isOneWay
    ? Number(bookingDraft.flight.total_price)
    : (Number(bookingDraft.outbound.total_price) + Number(bookingDraft.inbound.total_price));

  return (
    <>
      <header className="site-header">
        <a href="/" className="logo">
          <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel" />
          <span>Lotus Travel</span>
        </a>
      </header>

      <div className="payment-container">
        <div className="passenger-info-form">
          <h2>Thông tin hành khách</h2>
          <p><span className="label">Họ tên:</span> <span className="value">({passenger.Danh_xung}) {passenger.Ho} {passenger.Ten_dem_va_ten}</span></p>
          <p><span className="label">Email:</span> <span className="value">{passenger.Email}</span></p>
          <p><span className="label">Điện thoại:</span> <span className="value">{passenger.Ma_quoc_gia} {passenger.So_dien_thoai?.replace(/^0/, "")}</span></p>

          {isOneWay && bookingDraft.flight && (
            <>
              <h2>Chi tiết chuyến bay</h2>
              <p><span className="label">Mã chuyến bay:</span> <span className="value">{bookingDraft.flight.f_code}</span></p>
              <p><span className="label">Chặng bay:</span> <span className="value">{bookingDraft.flight.airport_from} ✈ {bookingDraft.flight.airport_to}</span></p>
              <p><span className="label">Khởi hành:</span> <span className="value">{bookingDraft.flight.f_time_from}</span></p>
              <p><span className="label">Ghế đã chọn:</span> <span className="value">{bookingDraft.seat}</span></p>
            </>
          )}

          {isRoundTrip && bookingDraft.outbound && bookingDraft.inbound && (
            <>
              <h2>Chặng đi</h2>
              <p><span className="label">Mã chuyến bay:</span> <span className="value">{bookingDraft.outbound.f_code}</span></p>
              <p><span className="label">Chặng bay:</span> <span className="value">{bookingDraft.outbound.airport_from} ✈ {bookingDraft.outbound.airport_to}</span></p>
              <p><span className="label">Khởi hành:</span> <span className="value">{bookingDraft.outbound.f_time_from}</span></p>
              <p><span className="label">Ghế đã chọn:</span> <span className="value">{bookingDraft.seatOutbound || "not found"}</span></p>

              <h2>Chặng về</h2>
              <p><span className="label">Mã chuyến bay:</span> <span className="value">{bookingDraft.inbound.f_code}</span></p>
              <p><span className="label">Chặng bay:</span> <span className="value">{bookingDraft.inbound.airport_from} ✈ {bookingDraft.inbound.airport_to}</span></p>
              <p><span className="label">Khởi hành:</span> <span className="value">{bookingDraft.inbound.f_time_from}</span></p>
              <p><span className="label">Ghế đã chọn:</span> <span className="value">{bookingDraft.seatInbound}</span></p>
            </>
          )}
        </div>

        <div className="services">
          <h2>Chi tiết giá vé</h2>
          <p><span className="label">Giá vé cơ bản:</span> <span className="value">{formatPrice(basePrice)} VNĐ</span></p>
          {services?.baggage && <p><span className="label">Hành lý ký gửi:</span> <span className="value">{formatPrice(services.baggage.price * serviceMultiplier)} VNĐ</span></p>}
          {services?.meal && <p><span className="label">Suất ăn:</span> <span className="value">{formatPrice(services.meal.price * serviceMultiplier)} VNĐ</span></p>}
          <p><span className="label">Phí hệ thống:</span> <span className="value">{formatPrice(215000 * serviceMultiplier)} VNĐ</span></p>
          <p><span className="label">Phí quản lý & phục vụ:</span> <span className="value">{formatPrice(410000 * serviceMultiplier)} VNĐ</span></p>
          <p><span className="label">Phí sân bay:</span> <span className="value">{formatPrice(99000 * serviceMultiplier)} VNĐ</span></p>
          <p><span className="label">Phí an ninh soi chiếu:</span> <span className="value">{formatPrice(20000 * serviceMultiplier)} VNĐ</span></p>
          <p><span className="label">Thuế VAT:</span> <span className="value">{formatPrice(40000 * serviceMultiplier)} VNĐ</span></p>
          <p><span className="label">Tổng thanh toán:</span> <span className="value">{formatPrice(totalAmount)} VNĐ</span></p>
        </div>

        <button type="submit" onClick={handlePayment}>Xác nhận giao dịch</button>
      </div>

      {showQR && (
        <div className="qr-overlay">
          <div className="qr-box">
            <h3>Quét mã để thanh toán</h3>
            <img src={qrCodeUrl} alt="QR Thanh toán" />
            <button onClick={handleCloseQR}>Đóng</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentPage;
