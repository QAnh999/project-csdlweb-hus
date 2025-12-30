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

  /* ===================== LOAD BOOKING ===================== */
  useEffect(() => {
    let draftStr = localStorage.getItem("bookingDraft");
    let booking = null;

    if (draftStr) {
      booking = JSON.parse(draftStr);
    } else {
      const keys = Object.keys(localStorage)
        .filter((k) => k.startsWith("booking_"))
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

    const { passengers = [], type } = bookingDraft;
    const isOneWay = type === "oneway";
    const isRoundTrip = type === "roundtrip";
    const numPassengers = passengers.length;

    // Base price
    const basePrice = isOneWay
      ? Number(bookingDraft.flight?.total_price || 0)
      : Number(bookingDraft.outbound?.total_price || 0) +
      Number(bookingDraft.inbound?.total_price || 0);

    // Dịch vụ của từng hành khách
    let baggagePrice = 0;
    let mealPrice = 0;
    passengers.forEach((p) => {
      if (p.services?.baggage) baggagePrice += p.services.baggage.price;
      if (p.services?.meal) mealPrice += p.services.meal.price;
    });

    // Nếu roundtrip, nhân đôi các dịch vụ
    if (isRoundTrip) {
      baggagePrice *= 2;
      mealPrice *= 2;
    }

    // Các khoản phí cố định
    const systemFee = 215000 * numPassengers * (isRoundTrip ? 2 : 1);
    const serviceFee = 410000 * numPassengers * (isRoundTrip ? 2 : 1);
    const airportFee = 99000 * numPassengers * (isRoundTrip ? 2 : 1);
    const securityFee = 20000 * numPassengers * (isRoundTrip ? 2 : 1);
    const vatFee = 40000 * numPassengers * (isRoundTrip ? 2 : 1);

    const total =
      basePrice * numPassengers +
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
    for (let i = 0; i < 3; i++)
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    return code;
  };

  const generatePassengerCodes = (passengers) => {
    return passengers.map(() => generateBookingCode());
  };

  const handlePayment = async () => {
    if (!bookingDraft) return;

    const passengerCodes = generatePassengerCodes(bookingDraft.passengers);
    localStorage.setItem("paymentPending", JSON.stringify(passengerCodes));

    const qrResult = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${passengerCodes.join(
            "-"
          )}`,
        });
      }, 500);
    });

    setQrCodeUrl(qrResult.qrCode);
    setShowQR(true);
  };


  const handleCloseQR = async () => {
    setShowQR(false);

    setTimeout(() => {
      const passengerCodesStr = localStorage.getItem("paymentPending");
      if (!passengerCodesStr) return;

      const passengerCodes = JSON.parse(passengerCodesStr);

      bookingDraft.passengers.forEach((p, i) => {
        const code = passengerCodes[i];

        const passengerBooking = {
          bookingCode: code,          // 👈 key chính
          passenger: p,               // thông tin hành khách
          type: bookingDraft.type,
          flight: bookingDraft.flight || null,
          outbound: bookingDraft.outbound || null,
          inbound: bookingDraft.inbound || null,
          totalAmount,
          createdAt: Date.now(),
          checkedIn: false
        };

        // ✅ LƯU THEO MÃ ĐẶT CHỖ
        localStorage.setItem(code, JSON.stringify(passengerBooking));
      });

      alert(
        "Mã đặt chỗ của từng hành khách:\n" +
        bookingDraft.passengers
          .map(
            (p, i) =>
              `${p.info.Ho} ${p.info.Ten_dem_va_ten}: ${passengerCodes[i]}`
          )
          .join("\n")
      );

      localStorage.removeItem("bookingDraft");
      localStorage.removeItem("paymentPending");

      navigate("/");
    }, 100);

  };



  if (!bookingDraft || !bookingDraft.passengers) {
    return <p>Đang tải dữ liệu đặt chỗ...</p>;
  }

  const { passengers, services, type } = bookingDraft;
  const passenger = passengers[0];
  const isOneWay = type === "oneway";
  const isRoundTrip = type === "roundtrip";
  const serviceMultiplier = isRoundTrip ? 2 : 1;
  const numPassengers = passengers.length;
  const basePrice = isOneWay
    ? Number(bookingDraft.flight.total_price)
    : Number(bookingDraft.outbound.total_price) +
    Number(bookingDraft.inbound.total_price);

  return (
    <>
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>

      <div className="payment-container">
        <div className="passenger-info-form">
          <h2>Thông tin hành khách</h2>

          {passengers.map((p, index) => {
            const info = p.info;
            if (!info) return null;

            return (
              <div key={index}
                className={`passenger-block ${index % 2 === 0 ? "even" : "odd"}`}>
                <h3>Hành khách {index + 1}</h3>
                <p>
                  <span className="label">Họ tên:</span>{" "}
                  <span className="value">
                    ({info.Danh_xung}) {`${info.Ho} ${info.Ten_dem_va_ten}`.toUpperCase()}
                  </span>
                </p>
                <p>
                  <span className="label">Email:</span>{" "}
                  <span className="value">{info.Email}</span>
                </p>
                <p>
                  <span className="label">Điện thoại:</span>{" "}
                  <span className="value">
                    {info.Ma_quoc_gia} {info.So_dien_thoai?.replace(/^0/, "")}
                  </span>
                </p>

                {isOneWay && bookingDraft.flight && (
                  <>
                    <h4>Chuyến bay</h4>
                    <p>
                      <span className="label">Mã chuyến bay:</span>{" "}
                      <span className="value">{bookingDraft.flight.f_code}</span>
                    </p>
                    <p>
                      <span className="label">Chặng bay:</span>{" "}
                      <span className="value">
                        {bookingDraft.flight.airport_from} ✈ {bookingDraft.flight.airport_to}
                      </span>
                    </p>
                    <p>
                      <span className="label">Khởi hành:</span>{" "}
                      <span className="value">{bookingDraft.flight.f_time_from}</span>
                    </p>
                    <p>
                      <span className="label">Ghế đã chọn:</span>{" "}
                      <span className="value">{p.seatOneway || "Chưa chọn ghế"}</span>
                    </p>
                  </>
                )}

                {isRoundTrip && (
                  <>
                    <h4>Chặng đi</h4>
                    <p>
                      <span className="label">Mã chuyến bay:</span>{" "}
                      <span className="value">{bookingDraft.outbound.f_code}</span>
                    </p>
                    <p>
                      <span className="label">Chặng bay:</span>{" "}
                      <span className="value">
                        {bookingDraft.outbound.airport_from} ✈ {bookingDraft.outbound.airport_to}
                      </span>
                    </p>
                    <p>
                      <span className="label">Ghế đã chọn:</span>{" "}
                      <span className="value">{p.seatOutbound || "Chưa chọn ghế"}</span>
                    </p>

                    <h4>Chặng về</h4>
                    <p>
                      <span className="label">Mã chuyến bay:</span>{" "}
                      <span className="value">{bookingDraft.inbound.f_code}</span>
                    </p>
                    <p>
                      <span className="label">Chặng bay:</span>{" "}
                      <span className="value">
                        {bookingDraft.inbound.airport_from} ✈ {bookingDraft.inbound.airport_to}
                      </span>
                    </p>
                    <p>
                      <span className="label">Ghế đã chọn:</span>{" "}
                      <span className="value">{p.seatInbound || "Chưa chọn ghế"}</span>
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="services">
          <h2>Chi tiết giá vé</h2>

          <div className="passenger-block">
            <p>
              <span className="label">Giá vé cơ bản:</span>{" "}
              <span className="value">{formatPrice(basePrice * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>

            {passengers.map((p, i) => (

              <React.Fragment key={i}>
                {p.services?.baggage && p.services.baggage.type !== "Không" && (
                  <p>
                    <span className="label">{`Hành lý ký gửi (Hành khách ${i + 1}):`}</span>{" "}
                    <span className="value">
                      {formatPrice(p.services.baggage.price)} VNĐ
                    </span>
                  </p>
                )}
                {p.services?.meal && p.services.meal.type !== "Không" && (
                  <p>
                    <span className="label">{`Suất ăn (Hành khách ${i + 1}):`}</span>{" "}
                    <span className="value">{formatPrice(p.services.meal.price)} VNĐ</span>
                  </p>
                )}
              </React.Fragment>
            ))}

            <p className="fee">
              <span className="label">Phí hệ thống:</span>{" "}
              <span className="value">{formatPrice(215000 * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>
            <p className="fee">
              <span className="label">Phí dịch vụ:</span>{" "}
              <span className="value">{formatPrice(410000 * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>
            <p className="fee">
              <span className="label">Phí sân bay:</span>{" "}
              <span className="value">{formatPrice(99000 * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>
            <p className="fee">
              <span className="label">Phí an ninh:</span>{" "}
              <span className="value">{formatPrice(20000 * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>
            <p className="fee">
              <span className="label">VAT:</span>{" "}
              <span className="value">{formatPrice(40000 * numPassengers * serviceMultiplier)} VNĐ</span>
            </p>

            <p className="total">
              <span className="label">Tổng thanh toán:</span>{" "}
              <span className="value">{formatPrice(totalAmount)} VNĐ</span>
            </p>
          </div>

        </div>

        <button onClick={handlePayment}>Xác nhận giao dịch</button>
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
