// src/components/CheckinPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/checkin.css";

const CheckinPage = () => {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [passenger, setPassenger] = useState(null);
  const [selectedLeg, setSelectedLeg] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirmBtn, setShowConfirmBtn] = useState(false);

  useEffect(() => {
    const bookingCode = localStorage.getItem("current_booking_code");
    if (!bookingCode) return navigate("/");

    const bookingStr = localStorage.getItem(`booking_${bookingCode}`);
    if (!bookingStr) return navigate("/");

    const bk = JSON.parse(bookingStr);

    if (bk.type === "roundtrip") {
      bk.checkedInOutbound = bk.checkedInOutbound ?? false;
      bk.checkedInInbound = bk.checkedInInbound ?? false;
      setShowOptions(true);
    } else {
      setSelectedLeg("oneway");
      setSelectedFlight(bk.flight);
      setSelectedSeat(bk.seat);
      setShowConfirmBtn(!bk.checkedIn);
    }

    setBooking(bk);
    setPassenger(bk.passenger);
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const handleSelectLeg = (leg) => {
    if (!booking) return;

    setSelectedLeg(leg);
    if (leg === "outbound") {
      setSelectedFlight(booking.outbound);
      setSelectedSeat(booking.seatOutbound);
    } else {
      setSelectedFlight(booking.inbound);
      setSelectedSeat(booking.seatInbound);
    }

    setShowOptions(false);
    setShowConfirmBtn(true);
  };

  // const handleConfirmCheckin = () => {
  //   if (!booking || !selectedFlight || !selectedLeg) return;

  //   const bookingCode = localStorage.getItem("current_booking_code");
  //   const updatedBooking = { ...booking };

  //   if (updatedBooking.type === "oneway") {
  //     updatedBooking.checkedIn = true;
  //   } else {
  //     if (selectedLeg === "outbound") updatedBooking.checkedInOutbound = true;
  //     if (selectedLeg === "inbound") updatedBooking.checkedInInbound = true;
  //   }

  //   localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(updatedBooking));
  //   setBooking(updatedBooking);

  //   if (updatedBooking.type === "roundtrip") {
  //     const outboundDone = updatedBooking.checkedInOutbound;
  //     const inboundDone = updatedBooking.checkedInInbound;

  //     // Nếu còn chặng chưa check-in → hiện nút chọn chặng
  //     if (!outboundDone || !inboundDone) {
  //       setShowOptions(true);
  //       setShowConfirmBtn(false);
  //     } else {
  //       setShowOptions(false);
  //       setShowConfirmBtn(false);
  //     }
  //   } else {
  //     // one-way
  //     setShowConfirmBtn(false);
  //   }
  // };

  // if (!booking || !passenger) return <p>Đang tải dữ liệu...</p>;


  const handleConfirmCheckin = () => {
    if (!booking || !selectedFlight || !selectedLeg) return;

    const bookingCode = localStorage.getItem("current_booking_code");
    const updatedBooking = { ...booking };

    if (updatedBooking.type === "oneway") {
      updatedBooking.checkedIn = true;
    } else {
      if (selectedLeg === "outbound") updatedBooking.checkedInOutbound = true;
      if (selectedLeg === "inbound") updatedBooking.checkedInInbound = true;
    }

    // lưu trạng thái check-in vào localStorage
    localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(updatedBooking));
    setBooking(updatedBooking);

    // Roundtrip: nếu còn chặng chưa check-in, show nút chọn chặng
    if (updatedBooking.type === "roundtrip") {
      const outboundDone = updatedBooking.checkedInOutbound;
      const inboundDone = updatedBooking.checkedInInbound;
      setShowOptions(!outboundDone || !inboundDone);
      setShowConfirmBtn(false); // sau khi check-in, ẩn nút
      // giữ selectedFlight & selectedLeg để hiển thị boarding pass
    } else {
      setShowConfirmBtn(false); // one-way
    }
  };


  return (
    <div className="checkin-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img src="/assets/Lotus_Logo-removebg-preview.png" alt="Lotus Travel" />
          <span>Lotus Travel</span>
        </a>
      </header>

      <div className="checkin-container">
        {/* Thông tin chuyến bay trước khi check-in */}
        {selectedFlight && showConfirmBtn && (
          <div className="cf-flights">
            <h2>Xác nhận chuyến bay</h2>
            <p><strong>Hành khách:</strong> {passenger.Ho} {passenger.Ten_dem_va_ten}</p>
            <p><strong>Chuyến bay:</strong> {selectedFlight.airport_from} → {selectedFlight.airport_to}</p>
            <p><strong>Giờ khởi hành:</strong> {selectedFlight.f_time_from}</p>
            <p><strong>Ghế:</strong> {selectedSeat}</p>
          </div>
        )}

        {/* Nút chọn chặng còn lại cho roundtrip */}
        {showOptions && booking.type === "roundtrip" && (
          <div className="checkin-options">
            {!booking.checkedInOutbound && (
              <button onClick={() => handleSelectLeg("outbound")}>Chọn chặng đi</button>
            )}
            {!booking.checkedInInbound && (
              <button onClick={() => handleSelectLeg("inbound")}>Chọn chặng về</button>
            )}
          </div>
        )}

        {/* Nút xác nhận check-in */}
        {showConfirmBtn && (
          <button className="btn-confirm" onClick={handleConfirmCheckin}>
            Xác nhận làm thủ tục lên máy bay
          </button>
        )}

        {/* Boarding pass sau khi check-in */}
        {selectedFlight && (
          ((booking.type === "oneway" && booking.checkedIn) ||
            (booking.type === "roundtrip" &&
              ((selectedLeg === "outbound" && booking.checkedInOutbound) ||
                (selectedLeg === "inbound" && booking.checkedInInbound)))
          ) && (
            <div className="boarding-pass">
              <h3>Thẻ lên máy bay</h3>
              <p><strong>Hành khách:</strong> {passenger.Ho} {passenger.Ten_dem_va_ten}</p>
              <p><strong>Mã đặt chỗ:</strong> {booking.bookingCode}</p>
              <p><strong>Chuyến bay:</strong> {selectedFlight.airport_from} → {selectedFlight.airport_to}</p>
              <p><strong>Giờ khởi hành:</strong> {selectedFlight.f_time_from}</p>
              <p><strong>Ghế:</strong> {selectedSeat}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CheckinPage;
