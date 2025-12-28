import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/checkin.css";

const CheckinPage = () => {
  const navigate = useNavigate();
  const [gate, setGate] = useState("");
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
      setShowOptions(!bk.checkedInOutbound || !bk.checkedInInbound);
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
    if (selectedFlight) {
      setGate(generateGate());
    }
  }, [selectedFlight]);



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

    localStorage.setItem(`booking_${bookingCode}`, JSON.stringify(updatedBooking));
    setBooking(updatedBooking);
    setShowConfirmBtn(false);
    setShowOptions(false);
  };

  if (!booking || !passenger) return <p>Đang tải dữ liệu...</p>;

  const showBoardingPass = () => {
    if (!booking) return false;

    if (booking.type === "oneway") return booking.checkedIn;

    if (booking.type === "roundtrip") {
      if (booking.checkedInOutbound && selectedLeg === "outbound") return true;
      if (booking.checkedInInbound && selectedLeg === "inbound") return true;
    }

    return false;
  };

  const generateGate = () => {
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const number = Math.floor(Math.random() * 9) + 1; 
    return `${letter}${number}`;
  };


  const parseTime = (time) => {
    if (!time || typeof time !== "string") {
      return { date: "", hour: "" };
    }

    const [date = "", hour = ""] = time.split(" ");
    return { date, hour };
  };


  const subtractMinutes = (timeStr, minutes) => {
    if (!timeStr) return "";

    const timePart = timeStr.includes(" ")
      ? timeStr.split(" ")[1]
      : timeStr;

    const [h, m, s] = timePart.split(":").map(Number);

    const d = new Date();
    d.setHours(h, m - minutes, s || 0);

    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const { date, hour } = parseTime(selectedFlight?.f_time_from);


  const getCabinClass = (flight) => {
    if (!flight || !flight.f_type) return "ECONOMY";

    const t = flight.f_type.toLowerCase();

    if (t.includes("business")) return "BUSINESS";
    if (t.includes("eco")) return "ECONOMY";
    if (t.includes("first")) return "FIRST";

    return "ECONOMY"; 
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
        {selectedFlight && showConfirmBtn && (
          <div className="cf-flights">
            <h2>Xác nhận chuyến bay</h2>
            <p><strong>Hành khách:</strong> {(passenger.Ho + " " + passenger.Ten_dem_va_ten).toUpperCase()}</p>
            <p><strong>Chuyến bay:</strong> {selectedFlight.airport_from} → {selectedFlight.airport_to}</p>
            <p><strong>Giờ khởi hành:</strong> {selectedFlight.f_time_from}</p>
            <p><strong>Ghế:</strong> {selectedSeat}</p>
          </div>
        )}

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

        {showConfirmBtn && (
          <button className="btn-confirm" onClick={handleConfirmCheckin}>
            Xác nhận làm thủ tục lên máy bay
          </button>
        )}

        {showBoardingPass() && (

          <div className="boarding-pass">
            <div className="bp-left">
              <span className="bp-logo">LOTUS</span>
              <span className="bp-alliance">STAR ALLIANCE</span>
            </div>

            <div className="bp-right">
              <div className="bp-header">
                <span>BOARDING PASS</span>
                <span>{getCabinClass(selectedFlight.type)}</span>
              </div>

              <div className="bp-row big">
                {(passenger.Ho + " " + passenger.Ten_dem_va_ten).toUpperCase()}
              </div>

              <div className="bp-row">
                <span>{selectedFlight.airport_from}</span>
                <span>→</span>
                <span>{selectedFlight.airport_to}</span>
              </div>

              <div className="bp-grid">
                <div>
                  <label>FLIGHT</label>
                  <strong>{selectedFlight.f_code}</strong>
                </div>
                <div>
                  <label>DATE</label>
                  <strong>{date}</strong>
                </div>
                <div>
                  <label>SEAT</label>
                  <strong>{selectedSeat}</strong>
                </div>
              </div>

              <div className="bp-grid">
                <div>
                  <label>GATE</label>
                  <strong>{gate}</strong>
                </div>
                <div>
                  <label>BOARDING TIME</label>
                  <strong>{subtractMinutes(selectedFlight.f_time_from, 30)}</strong>
                </div>
              </div>

              <div className="bp-barcode"></div>
            </div>
          </div>

        )}
      </div>
    </div>
  );
};

export default CheckinPage;
