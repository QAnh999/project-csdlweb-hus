// SeatSelectionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/seatselection.css";

const API = process.env.REACT_APP_API_URL;
// Component hiển thị 1 ghế
const Seat = ({ seat, selected, onSelect }) => {
  const { seat_number, seat_class, status } = seat;

  let className = "seat";
  if (status === "booked") className += " booked";
  else if (status === "held") className += " held";
  else className += ` available ${seat_class}`;

  return (
    <div
      className={className + (selected ? " selected" : "")}
      onClick={() => status === "available" && onSelect(seat)}
      title={`Ghế ${seat_number} - ${seat_class} - ${status}`}
    >
      {seat_number.match(/[A-Z]/)?.[0] || seat_number}
    </div>
  );
};

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const passengerIndex = Number(params.get("index")) || 0; // hành khách hiện tại
  const leg = params.get("leg") || "main"; // main, outbound, inbound
  const reservationId = params.get("reservation_id");

  const [draft, setDraft] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(false);
  const cabinClass = draft?.cabinClass;

  const getAuthToken = () =>
    JSON.parse(localStorage.getItem("auth") || "{}")?.access_token || "";

  // Load draft, flight & sơ đồ ghế
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("bookingDraft");
        if (!stored) throw new Error("Không tìm thấy booking draft");

        const bookingDraft = JSON.parse(stored);
        setDraft(bookingDraft);
        // setCabinClass(bookingDraft.cabinClass || "economy");

        // Xác định chuyến bay hiện tại theo leg
        let flightData = null;
        let flightId = null;
        if (bookingDraft.tripType === "oneway") {
          flightData = bookingDraft.mainFlight;
          flightId = bookingDraft.mainFlightId;
        } else {
          if (leg === "outbound") {
            flightData = bookingDraft.outboundFlight;
            flightId = bookingDraft.mainFlightId;
          } else {
            flightData = bookingDraft.inboundFlight;
            flightId = bookingDraft.returnFlightId;
          }
        }

        if (!flightId) throw new Error("Không tìm thấy thông tin chuyến bay");
        setFlight(flightData);

        // Lấy danh sách ghế từ BE (lưu ý: BE không có seat_class trong response, nhưng FE không dùng)
        const res = await fetch(
          `${API}/booking/seats/${flightId}?seat_class=${bookingDraft.cabinClass}`,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Không thể tải sơ đồ ghế");
        setSeats(data.seats || []);

        // Load ghế đã chọn trước đó cho hành khách
        const passenger = bookingDraft.passengers[passengerIndex];
        if (passenger?.seatMap?.[leg]) {
          const prevSeat = data.seats.find(
            (s) => s.seat_id === passenger.seatMap[leg]
          );
          if (prevSeat) setSelectedSeat(prevSeat);
        }
      } catch (err) {
        console.error(err);
        alert(err.message);
        navigate("/booking");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, leg, passengerIndex, cabinClass]);

  // Giữ ghế
  const holdSeat = async () => {
    if (!selectedSeat || !draft) {
      alert("Vui lòng chọn ghế");
      return;
    }

    try {
      setLoading(true);

      // Lấy flightId theo leg
      let flightId =
        leg === "inbound" ? draft.returnFlightId : draft.mainFlightId;

      const payload = {
        flight_id: flightId,
        seat_ids: [selectedSeat.seat_id],
        seat_class: draft.cabinClass,
      };

      console.log("Payload gửi lên BE /hold-seats:", payload);

      const res = await fetch(`${API}/booking/${reservationId}/hold-seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.detail || data.message || "Lỗi giữ ghế");

      const { held_seats } = data; // Sử dụng response để xác nhận

      alert(data.message || "Giữ ghế thành công");

      // Cập nhật draft hành khách với seatMap đầy đủ
      const updatedDraft = { ...draft };
      if (!updatedDraft.passengers[passengerIndex].seatMap)
        updatedDraft.passengers[passengerIndex].seatMap = {};
      updatedDraft.passengers[passengerIndex].seatMap[leg] =
        selectedSeat.seat_id;

      // // Cập nhật passenger_id nếu chưa có
      // if (!updatedDraft.passengers[passengerIndex].passenger_id) {
      //   updatedDraft.passengers[passengerIndex].passenger_id =
      //     updatedDraft.passengers[passengerIndex].info.passenger_id;
      // }

      setDraft(updatedDraft);
      localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));

      goNext(updatedDraft);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển sang hành khách tiếp theo hoặc Review
  const goNext = (updatedDraft) => {
    const total = updatedDraft.passengerCount || updatedDraft.passengers.length;

    if (updatedDraft.tripType === "oneway") {
      if (passengerIndex + 1 < total)
        navigate(
          `/seatselection?leg=main&index=${
            passengerIndex + 1
          }&reservation_id=${reservationId}`
        );
      else navigate(`/review?reservation_id=${reservationId}`);
      return;
    }

    if (leg === "outbound") {
      if (passengerIndex + 1 < total)
        navigate(
          `/seatselection?leg=outbound&index=${
            passengerIndex + 1
          }&reservation_id=${reservationId}`
        );
      else
        navigate(
          `/seatselection?leg=inbound&index=0&reservation_id=${reservationId}`
        );
      return;
    }

    if (leg === "inbound") {
      if (passengerIndex + 1 < total)
        navigate(
          `/seatselection?leg=inbound&index=${
            passengerIndex + 1
          }&reservation_id=${reservationId}`
        );
      else navigate(`/review?reservation_id=${reservationId}`);
    }
  };

  if (loading && !seats.length)
    return <div className="loading-page">Đang tải sơ đồ ghế...</div>;

  // Chia ghế theo hàng để hiển thị
  const rows = {};
  seats.forEach((s) => {
    const rowNumber = s.seat_number.match(/\d+/)[0];
    if (!rows[rowNumber]) rows[rowNumber] = [];
    rows[rowNumber].push(s);
  });
  Object.keys(rows).forEach((r) =>
    rows[r].sort((a, b) => a.seat_number.localeCompare(b.seat_number))
  );
  const sortedRowNumbers = Object.keys(rows).sort(
    (a, b) => Number(a) - Number(b)
  );

  return (
    <div className="seat-selection-page">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>

      <div className="seat-page-content">
        <h1>Chọn ghế</h1>
        <p>
          Chuyến bay: {flight?.flight_number || "N/A"} | Hành khách{" "}
          {passengerIndex + 1}/
          {draft?.passengerCount || draft?.passengers.length} | Hạng vé:{" "}
          {cabinClass}
        </p>

        <div id="seat-map" className="plane">
          <div className="plane-nose">ĐẦU MÁY BAY</div>
          <div className="cabin">
            {sortedRowNumbers.map((rowNum) => (
              <div className="row" key={rowNum}>
                <div className="row-number">{rowNum}</div>
                <div className="seat-group">
                  {rows[rowNum].map((seat) => (
                    <Seat
                      key={seat.seat_id}
                      seat={seat}
                      selected={selectedSeat?.seat_id === seat.seat_id}
                      onSelect={setSelectedSeat}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="plane-tail">ĐUÔI MÁY BAY</div>
        </div>

        {selectedSeat && (
          <div className="note">
            Đã chọn: {selectedSeat.seat_number} | Hạng:{" "}
            {selectedSeat.seat_class}
          </div>
        )}

        <div className="seat-controls">
          <button onClick={() => navigate(-1)} disabled={loading}>
            Quay lại
          </button>
          <button onClick={holdSeat} disabled={!selectedSeat || loading}>
            {loading ? "Đang xử lý..." : "Xác nhận ghế"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
