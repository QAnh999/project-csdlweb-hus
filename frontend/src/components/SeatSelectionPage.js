import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/seatselection.css";
import { isSameFlight } from "../utils/bookingUtils";


const Seat = ({ code, booked, selected, onSelect }) => {
  const handleClick = () => {
    if (!booked) onSelect(code);
  };

  let className = "seat";
  if (booked) className += " booked";
  else if (selected) className += " selected";
  else className += " regular";

  return (
    <div className={className} onClick={handleClick}>
      {code.slice(-1)}
    </div>
  );
};

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookingDraft, setBookingDraft] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const leg = searchParams.get("leg") || "outbound";
  const hasAlertedInbound = useRef(false);

  const rows = 40;
  const colsLeft = ["A", "B", "C"];
  const colsRight = ["D", "E", "F"];
  const exitAfter = [3, 27];

  const toggleSelect = (code) => {
    setSelectedSeat((prev) => (prev === code ? null : code));
  };
  useEffect(() => {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) {
      alert("Không tìm thấy thông tin đặt chỗ!");
      navigate("/");
      return;
    }

    const draft = JSON.parse(draftStr);

    // chỉ kiểm tra có chuyến bay hay không
    const hasFlight =
      draft.flight || draft.outbound || draft.inbound;

    if (!hasFlight) {
      alert("Thông tin chuyến bay không hợp lệ!");
      navigate("/booking");
      return;
    }

    if (!draft.type) {
      draft.type = draft.outbound ? "roundtrip" : "oneway";
      localStorage.setItem("bookingDraft", JSON.stringify(draft));
    }
    setBookingDraft(draft);


  }, [navigate]);

  useEffect(() => {
    if (leg !== "inbound") return;

    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr) return;

    const draft = JSON.parse(draftStr);

    if (!draft.seatOutbound) {
      alert("Vui lòng chọn ghế chặng đi trước");
      navigate("/seatselection");
    }
  }, [leg, navigate]);



  // ================= LOAD BOOKED SEATS THEO CHUYẾN BAY =================
  useEffect(() => {
    if (!bookingDraft) return;

    const currentFlight = (() => {
      if (leg === "outbound") return bookingDraft.outbound;
      if (leg === "inbound") return bookingDraft.inbound;
      return bookingDraft.flight;
    })();


    if (!currentFlight) return;

    setSelectedSeat(null);
    setBookedSeats([]);

    const seats = [];

    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("booking_")) return;

      const b = JSON.parse(localStorage.getItem(key));
      if (!b || !b.bookingCode) return;

      if (b.flight && isSameFlight(b.flight, currentFlight) && b.seat) {
        seats.push(b.seat);
      }

      if (b.outbound && isSameFlight(b.outbound, currentFlight) && b.seatOutbound) {
        seats.push(b.seatOutbound);
      }


      if (b.inbound && isSameFlight(b.inbound, currentFlight) && b.seatInbound) {
        seats.push(b.seatInbound);
      }
    });


    setBookedSeats(seats);
  }, [bookingDraft, leg]);

  useEffect(() => {
    if (!bookingDraft) return;

    if (leg === "outbound") {
      setSelectedSeat(bookingDraft.seatOutbound || null);
    } else if (leg === "inbound") {
      setSelectedSeat(bookingDraft.seatInbound || null);
    } else {
      setSelectedSeat(bookingDraft.seat || null);
    }
  }, [bookingDraft, leg]);

  useEffect(() => {
    if (!bookingDraft) return;

    if (
      bookingDraft.type === "roundtrip" &&
      leg === "inbound" &&
      bookingDraft.seatOutbound &&
      !hasAlertedInbound.current
    ) {
      alert("Tiếp tục chọn ghế chuyến về");
      hasAlertedInbound.current = true;
    }
  }, [bookingDraft, leg]);


  const confirmSeat = () => {
    if (!bookingDraft || !selectedSeat) return;

    if (bookingDraft.type === "oneway") {
      const updated = {
        ...bookingDraft,
        seat: selectedSeat,
      };

      localStorage.setItem("bookingDraft", JSON.stringify(updated));
      setBookingDraft(updated);
      navigate("/payment");
      return;
    }

    // ===== ROUNDTRIP =====
    if (leg === "outbound") {
      const updated = {
        ...bookingDraft,
        seatOutbound: selectedSeat,
      };

      localStorage.setItem("bookingDraft", JSON.stringify(updated));
      setBookingDraft(updated);
      navigate("/seatselection?leg=inbound");
      return;
    }

    if (leg === "inbound") {
      const updated = {
        ...bookingDraft,
        seatInbound: selectedSeat,
      };

      localStorage.setItem("bookingDraft", JSON.stringify(updated));
      setBookingDraft(updated);
      navigate("/payment");
    }
  };



  const renderRow = (i) => {
    const leftSeats = colsLeft.map((col) => {
      const code = `${i}${col}`;
      return (
        <Seat
          key={code}
          code={code}
          booked={bookedSeats.includes(code)}
          selected={selectedSeat === code}
          onSelect={toggleSelect}
        />
      );
    });

    const rightSeats = colsRight.map((col) => {
      const code = `${i}${col}`;
      return (
        <Seat
          key={code}
          code={code}
          booked={bookedSeats.includes(code)}
          selected={selectedSeat === code}
          onSelect={toggleSelect}
        />
      );
    });

    return (
      <React.Fragment key={i}>
        <div className="row">
          <div className="row-number">{i}</div>
          <div className="seat-group">{leftSeats}</div>
          <div className="aisle" />
          <div className="seat-group">{rightSeats}</div>
        </div>
        {exitAfter.includes(i) && (
          <div className="exit-row">
            <div className="exit exit-left">EXIT</div>
            <div className="exit exit-right">EXIT</div>
          </div>
        )}
      </React.Fragment>
    );
  };

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


      {/* <div className="page-content"> */}
      <h1>Chọn chỗ ngồi trên máy bay</h1>


      <div className="note">
        <p>Chọn chỗ ngồi mong muốn của bạn</p>
        <p>Ghế đã chọn sẽ được tô màu vàng</p>
      </div>
      <section className="seat-selection">
        <div className="plane">
          <div className="plane-nose">
            <div className="restroom">
              <span>Restroom</span>
            </div>
          </div>

          <div className="seat-map">{Array.from({ length: rows }, (_, i) => renderRow(i + 1))}</div>

          <div className="plane-tail">
            <div className="restroom">
              <span>Restroom</span>
            </div>
          </div>

          <div className="seat-order">
            <div className="seat-status">
              <div className="status available"></div>
              <span>Ghế trống</span>
            </div>
            <div className="seat-status">
              <div className="status selected"></div>
              <span>Ghế bạn chọn</span>
            </div>
            <div className="seat-status">
              <div className="status booked"></div>
              <span>Ghế đã đặt</span>
            </div>
          </div>
          <button id="confirmSeat" onClick={confirmSeat}>
            Xác nhận chỗ ngồi
          </button>
        </div>
      </section>

      {/* </div> */}
    </>
  );
};

export default SeatSelectionPage;
